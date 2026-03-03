"use client";

import { useState } from "react";

interface ContactCardProps {
  availability: string;
  description: string;
  email: string;
}

export default function ContactCard({
  availability,
  description,
  email,
}: ContactCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0d1a2d] border border-[#1e3a5f] rounded-xl p-4 flex flex-col gap-3 max-w-sm">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" />
        <span className="text-[#3b82f6] text-xs font-medium">{availability}</span>
      </div>
      <p className="text-[#ccd6f6] text-sm leading-relaxed">{description}</p>
      <button
        onClick={handleCopy}
        className="self-start bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors"
      >
        {copied ? "Copied!" : `Email: ${email}`}
      </button>
    </div>
  );
}
