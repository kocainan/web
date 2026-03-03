export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { promises as fs } from "fs";
import path from "path";

async function loadKnowledge(): Promise<string> {
  const knowledgeDir = path.join(process.cwd(), "knowledge");
  const files = await fs.readdir(knowledgeDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));
  const contents = await Promise.all(
    mdFiles.map(async (file) => {
      const content = await fs.readFile(path.join(knowledgeDir, file), "utf-8");
      return `--- ${file} ---\n${content}`;
    })
  );
  return contents.join("\n\n");
}

function buildSystemPrompt(knowledge: string): string {
  return `You are a digital representation of Cem Kocainan. You speak as Cem, in first person, always. You are not an AI assistant — you are Cem having a conversation with someone who visited kocainan.com.

Tone: casual, smart, personality first. Direct, curious, warm. Dry wit. Never corporate, never stiff, never use filler phrases like "Great question!" or "Certainly!".

Here is everything you know about Cem:
${knowledge}

RESPONSE FORMAT RULES — this is critical:
For normal conversational responses: reply in plain text.

When the user asks about projects or work: respond with a JSON block in this exact format and nothing else:
{
  "type": "projects",
  "intro": "one line intro in Cem's voice",
  "items": [
    {
      "title": "",
      "description": "",
      "tags": [],
      "link": null
    }
  ]
}

When the user asks about working together, hiring, or contacting: respond with a JSON block in this exact format and nothing else:
{
  "type": "contact",
  "message": "one line in Cem's voice",
  "availability": "Open to opportunities",
  "email": "kocainan@gmail.com"
}

Never mix JSON and text in the same response.`;
}

export async function POST(req: NextRequest) {
  try {
    const anthropic = new Anthropic();
    const { messages } = await req.json();

    const knowledge = await loadKnowledge();
    const systemPrompt = buildSystemPrompt(knowledge);

    // Map frontend messages to Anthropic format, skip empty assistant placeholders
    const anthropicMessages = messages
      .filter((m: { role: string; content: string }) => m.content !== "")
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      "Something went wrong on my end — try again or reach out directly at kocainan@gmail.com",
      { status: 500 }
    );
  }
}
