"use client";

import { useState } from "react";
import { Copy, Check, RotateCcw, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PlatformPrompts, PlatformKey } from "@/utils/styleExtractionClient";

interface ResultStepProps {
  prompts: PlatformPrompts;
  imageCount: number;
  onStartOver: () => void;
}

const PLATFORM_CONFIG: Record<PlatformKey, { label: string; tip: string }> = {
  midjourney: {
    label: "Midjourney",
    tip: "Use --sref with reference images. Adjust --sw (0-1000) for style strength. Add --raw for literal adherence.",
  },
  chatgpt: {
    label: "ChatGPT",
    tip: "Structure: Scene → Subject → Details → Constraints. Use quotes for text. Specify camera/lens for realism.",
  },
  flux: {
    label: "Flux",
    tip: "No negative prompts - describe what you want. Order: Subject → Action → Style → Context. Use hex colors for brand accuracy.",
  },
  nano_banana: {
    label: "Nano Banana",
    tip: "Camera-first format: Start with angle + shot type + perspective (e.g., 'low-angle medium shot, 3/4 view, f/2.8'), then subject position, spatial setting, lighting, style. Excels at precise compositions.",
  },
  seedream: {
    label: "Seedream",
    tip: "Keep prompts 30-100 words. Order: Subject → Style → Composition → Lighting → Technical. Critical elements first.",
  },
};

const PLATFORM_ORDER: PlatformKey[] = ["midjourney", "chatgpt", "flux", "nano_banana", "seedream"];
const STORAGE_KEY = "imgprompter-selected-platform";

export function ResultStep({
  prompts,
  imageCount,
  onStartOver,
}: ResultStepProps) {
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && PLATFORM_ORDER.includes(stored as PlatformKey)) {
        return stored as PlatformKey;
      }
    }
    return "midjourney";
  });

  const handlePlatformChange = (platform: PlatformKey) => {
    setSelectedPlatform(platform);
    localStorage.setItem(STORAGE_KEY, platform);
  };

  const currentPrompt = prompts[selectedPlatform];
  const currentConfig = PLATFORM_CONFIG[selectedPlatform];

  const displayPrompt = subject.trim()
    ? `${subject.trim()}, rendered in ${currentPrompt.charAt(0).toLowerCase()}${currentPrompt.slice(1)}`
    : currentPrompt;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayPrompt);
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
          <h2 className="text-lg font-medium">Style Prompts</h2>
        </div>
        <span className="mono-tag" aria-label={`Generated from ${imageCount} image${imageCount !== 1 ? "s" : ""}`}>
          From {imageCount} image{imageCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Subject Input */}
      <div className="space-y-2">
        <label
          htmlFor="subject-input"
          className="block text-sm text-[var(--text-secondary)]"
        >
          Add your subject (optional)
        </label>
        <div className="relative">
          <input
            id="subject-input"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder='e.g., "a family doing the weekly shop"'
            className={cn(
              "w-full px-4 py-3 pr-10",
              "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
              "text-[var(--text-primary)] text-sm",
              "placeholder:text-[var(--text-muted)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:border-transparent",
              "transition-colors"
            )}
          />
          {subject && (
            <button
              onClick={() => setSubject("")}
              aria-label="Clear subject"
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2",
                "p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                "transition-colors"
              )}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Platform Tabs */}
      <div className="border border-[var(--border-color)]">
        <div
          className="flex border-b border-[var(--border-color)]"
          role="tablist"
          aria-label="Select target platform"
        >
          {PLATFORM_ORDER.map((platform) => (
            <button
              key={platform}
              role="tab"
              aria-selected={selectedPlatform === platform}
              aria-controls={`panel-${platform}`}
              onClick={() => handlePlatformChange(platform)}
              className={cn(
                "flex-1 px-3 py-2.5 text-sm font-medium transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--accent-ai)]",
                selectedPlatform === platform
                  ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-b-2 border-[var(--accent-ai)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/50"
              )}
            >
              {PLATFORM_CONFIG[platform].label}
            </button>
          ))}
        </div>

        {/* Prompt Content */}
        <div
          id={`panel-${selectedPlatform}`}
          role="tabpanel"
          aria-labelledby={selectedPlatform}
          className="p-4"
        >
          <div
            className={cn(
              "p-4 min-h-[120px]",
              "bg-[var(--bg-primary)] border border-[var(--border-color)]",
              "text-[var(--text-primary)] text-sm leading-relaxed"
            )}
            role="textbox"
            aria-readonly="true"
            aria-label={`${currentConfig.label} style prompt`}
            tabIndex={0}
          >
            {displayPrompt}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={handleCopy}
              aria-label={copied ? "Copied to clipboard" : `Copy ${currentConfig.label} prompt to clipboard`}
              className={cn(
                "px-4 py-2",
                "border border-[var(--border-color)] bg-[var(--bg-primary)]",
                "hover:bg-[var(--bg-secondary)] transition-colors",
                "flex items-center gap-2 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2"
              )}
            >
              {copied ? (
                <>
                  <Check aria-hidden="true" className="w-4 h-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy aria-hidden="true" className="w-4 h-4" />
                  Copy Prompt
                </>
              )}
            </button>
          </div>
        </div>

        {/* Platform Tip */}
        <div className="px-4 pb-4">
          <div className="p-3 bg-[var(--bg-secondary)] border-l-2 border-[var(--accent-ai)] text-sm">
            <span className="text-[var(--text-muted)]">💡 </span>
            <span className="text-[var(--text-secondary)]">{currentConfig.tip}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center pt-4">
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
      </div>
    </div>
  );
}
