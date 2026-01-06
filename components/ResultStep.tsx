"use client";

import { useState } from "react";
import { Copy, Check, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ResultStepProps {
  stylePrompt: string;
  imageCount: number;
  onStartOver: () => void;
}

export function ResultStep({
  stylePrompt,
  imageCount,
  onStartOver,
}: ResultStepProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(stylePrompt);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="space-y-6" role="region" aria-label="Style extraction result">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles aria-hidden="true" className="w-5 h-5 text-[var(--accent-gold)]" />
          <h2 className="text-lg font-medium">Style Prompt</h2>
        </div>
        <span className="mono-tag" aria-label={`Generated from ${imageCount} image${imageCount !== 1 ? "s" : ""}`}>
          From {imageCount} image{imageCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Result Box */}
      <div className="relative">
        <div
          className={cn(
            "p-4 min-h-[150px]",
            "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
            "text-[var(--text-primary)] text-sm leading-relaxed"
          )}
          role="textbox"
          aria-readonly="true"
          aria-label="Generated style prompt"
          tabIndex={0}
        >
          {stylePrompt}
        </div>

        <button
          onClick={handleCopy}
          aria-label={copied ? "Copied to clipboard" : "Copy style prompt to clipboard"}
          className={cn(
            "absolute top-3 right-3 p-2",
            "border border-[var(--border-color)] bg-[var(--bg-primary)]",
            "hover:bg-[var(--bg-secondary)] transition-colors",
            "flex items-center gap-1.5 text-xs",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2"
          )}
        >
          {copied ? (
            <>
              <Check aria-hidden="true" className="w-4 h-4 text-green-600" />
              Copied
            </>
          ) : (
            <>
              <Copy aria-hidden="true" className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Usage Hint */}
      <div className="p-3 bg-[var(--bg-secondary)] border-l-2 border-[var(--accent-ai)]" role="note">
        <p className="text-sm text-[var(--text-secondary)]">
          Use this prompt with AI image generators like Midjourney, DALL-E, or
          Stable Diffusion to create new images in this style.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={onStartOver}
          aria-label="Start over with new images"
          className={cn(
            "flex items-center gap-2 px-4 py-2",
            "text-sm text-[var(--text-secondary)]",
            "hover:text-[var(--text-primary)] transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2"
          )}
        >
          <RotateCcw aria-hidden="true" className="w-4 h-4" />
          Start Over
        </button>

        <button
          onClick={handleCopy}
          aria-label="Copy style prompt to clipboard"
          className={cn(
            "px-6 py-2 text-sm font-medium",
            "bg-[var(--text-primary)] text-[var(--bg-primary)]",
            "hover:bg-[var(--text-secondary)] transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2"
          )}
        >
          Copy Prompt
        </button>
      </div>
    </div>
  );
}
