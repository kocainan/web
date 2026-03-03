import ProjectCard from "./ProjectCard";
import ContactCard from "./ContactCard";

interface BaseMessage {
  role: "user" | "assistant";
}

interface TextMessage extends BaseMessage {
  type: "text";
  content: string;
}

interface ProjectMessage extends BaseMessage {
  type: "projects";
  projects: {
    title: string;
    description: string;
    tags: string[];
    link?: string;
  }[];
}

interface ContactMessage extends BaseMessage {
  type: "contact";
  availability: string;
  description: string;
  email: string;
}

export type Message = TextMessage | ProjectMessage | ContactMessage;

// Try to parse a rich component from a raw text content string.
// Returns null if the content is plain text or incomplete JSON (still streaming).
function parseRichContent(content: string): React.ReactNode | null {
  const trimmed = content.trim();
  if (!trimmed.startsWith("{")) return null;

  try {
    const parsed = JSON.parse(trimmed);

    if (parsed.type === "projects" && Array.isArray(parsed.items)) {
      return (
        <div className="flex flex-col gap-2">
          {parsed.intro && (
            <p className="text-[#888] text-xs mb-1">{parsed.intro}</p>
          )}
          <ProjectCard projects={parsed.items} />
        </div>
      );
    }

    if (parsed.type === "contact") {
      return (
        <ContactCard
          availability={parsed.availability}
          description={parsed.message}
          email={parsed.email}
        />
      );
    }
  } catch {
    // Incomplete JSON during streaming — render nothing; typing dots handle it
    return null;
  }

  return null;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] ${
          isUser
            ? "bg-[#1f1f1f] border border-[#333] text-white rounded-xl rounded-br-sm px-4 py-2.5 text-sm"
            : "text-white text-sm"
        }`}
      >
        {message.type === "text" && (() => {
          const rich = parseRichContent(message.content);
          if (rich !== null) return rich;
          // If content starts with '{' but parsing failed (streaming), render nothing
          if (message.content.trim().startsWith("{")) return null;
          return (
            <p className="leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          );
        })()}

        {message.type === "projects" && (
          <div className="flex flex-col gap-2">
            <ProjectCard projects={message.projects} />
          </div>
        )}

        {message.type === "contact" && (
          <ContactCard
            availability={message.availability}
            description={message.description}
            email={message.email}
          />
        )}
      </div>
    </div>
  );
}
