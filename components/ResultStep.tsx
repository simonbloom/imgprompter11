"use client";

import { useState } from "react";
import { Copy, Check, RotateCcw, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ResultStepProps {
  stylePrompt: string;
  imageCount: number;
  onStartOver: () => void;
}

function getStylePreview(stylePrompt: string, wordCount: number = 12): string {
  const words = stylePrompt.split(/\s+/).slice(0, wordCount);
  return words.join(" ") + (stylePrompt.split(/\s+/).length > wordCount ? "..." : "");
}

export function ResultStep({
  stylePrompt,
  imageCount,
  onStartOver,
}: ResultStepProps) {
  const [copied, setCopied] = useState(false);
  const [showUsage, setShowUsage] = useState(false);

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

  const stylePreview = getStylePreview(stylePrompt);

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

      {/* How to Use - Collapsible */}
      <div className="border border-[var(--border-color)]">
        <button
          onClick={() => setShowUsage(!showUsage)}
          aria-expanded={showUsage}
          aria-controls="usage-instructions"
          className={cn(
            "w-full px-4 py-3 flex items-center justify-between",
            "text-sm font-medium text-[var(--text-primary)]",
            "hover:bg-[var(--bg-secondary)] transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--accent-ai)]"
          )}
        >
          <span>How to Use This Prompt</span>
          {showUsage ? (
            <ChevronUp aria-hidden="true" className="w-4 h-4" />
          ) : (
            <ChevronDown aria-hidden="true" className="w-4 h-4" />
          )}
        </button>

        {showUsage && (
          <div
            id="usage-instructions"
            className="px-4 pb-4 space-y-4 border-t border-[var(--border-color)]"
          >
            {/* Template */}
            <div className="pt-4">
              <p className="mono-label mb-2">Template</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Copy this pattern and replace <code className="px-1 py-0.5 bg-[var(--bg-secondary)] text-[var(--accent-ai)]">[YOUR SUBJECT]</code>:
              </p>
              <div className="mt-2 p-3 bg-[var(--bg-secondary)] text-sm font-mono">
                &quot;[YOUR SUBJECT], rendered in [paste style prompt]&quot;
              </div>
            </div>

            {/* Example */}
            <div>
              <p className="mono-label mb-2">Example</p>
              <div className="p-3 bg-[var(--bg-secondary)] text-sm">
                <span className="text-[var(--accent-ai)]">&quot;A cat sitting on a windowsill&quot;</span>
                <span className="text-[var(--text-muted)]">, rendered in </span>
                <span className="text-[var(--text-secondary)]">{stylePreview}</span>
              </div>
            </div>

            {/* Platform Tips */}
            <div>
              <p className="mono-label mb-2">Platform Tips</p>
              <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
                <li>
                  <span className="text-[var(--text-primary)] font-medium">Midjourney:</span>{" "}
                  Add <code className="px-1 py-0.5 bg-[var(--bg-secondary)]">--style raw</code> for closer style match
                </li>
                <li>
                  <span className="text-[var(--text-primary)] font-medium">DALL-E:</span>{" "}
                  Works directly, be specific with your subject description
                </li>
                <li>
                  <span className="text-[var(--text-primary)] font-medium">Gemini:</span>{" "}
                  Describe your subject first, then paste the style
                </li>
                <li>
                  <span className="text-[var(--text-primary)] font-medium">Stable Diffusion:</span>{" "}
                  Use as positive prompt, add subject at the beginning
                </li>
              </ul>
            </div>
          </div>
        )}
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
