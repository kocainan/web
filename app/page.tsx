"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage, { Message } from "@/components/ChatMessage";

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    type: "text",
    content:
      "What would you like to know about me? You can ask about my work, projects, background, or how I can help you.",
  },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMessage: Message = { role: "user", type: "text", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    // Placeholder assistant message filled via streaming
    setMessages((prev) => [
      ...prev,
      { role: "assistant", type: "text", content: "" },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            type: "text",
            content: accumulated,
          };
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const lastContent =
    (messages[messages.length - 1] as Extract<Message, { type: "text" }>)
      ?.content ?? "";
  const showTypingDots =
    isStreaming &&
    (lastContent === "" || lastContent.trimStart().startsWith("{"));

  return (
    <main className="flex flex-col h-screen">
      {/* HERO */}
      <section
        className="flex-none flex flex-col items-center justify-center"
        style={{ height: "30vh", background: "#0a0a0a" }}
      >
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          Hi, I'm Cem.
        </h1>
        <p className="mt-3 text-[#888] text-base">
          Product Manager &amp; AI builder. Ask me anything.
          <span className="inline-block w-[2px] h-[1em] bg-[#888] ml-1 align-middle animate-blink" />
        </p>
      </section>

      {/* CHAT */}
      <section
        className="flex flex-col flex-1 overflow-hidden"
        style={{ background: "#111111", borderTop: "1px solid #1f1f1f" }}
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {showTypingDots && (
              <div className="flex justify-start">
                <span className="text-[#555] text-sm flex gap-1 items-center">
                  <span className="animate-blink">●</span>
                  <span className="animate-blink" style={{ animationDelay: "0.2s" }}>●</span>
                  <span className="animate-blink" style={{ animationDelay: "0.4s" }}>●</span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div
          className="flex-none px-4 py-4"
          style={{ borderTop: "1px solid #1f1f1f" }}
        >
          <div className="w-full max-w-2xl mx-auto flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me something..."
              disabled={isStreaming}
              className="flex-1 resize-none bg-[#1a1a1a] border border-[#333] text-white placeholder-[#555] text-sm rounded-xl px-4 py-3 outline-none focus:border-[#3b82f6] transition-colors disabled:opacity-50"
              style={{ maxHeight: "120px" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isStreaming || !input.trim()}
              className="flex-none bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-3 rounded-xl transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
