"use client";

import { useState } from "react";
import { Copy, Check, RotateCcw, Sparkles, X, Loader2, Download, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PlatformPrompts, PlatformKey } from "@/utils/styleExtractionClient";
import { generateImage, type GeneratePlatform } from "@/utils/generateImageClient";

interface ResultStepProps {
  prompts: PlatformPrompts;
  imageCount: number;
  onStartOver: () => void;
  apiKey: string;
}

const REPLICATE_SUPPORTED_PLATFORMS: PlatformKey[] = ["flux", "nano_banana", "seedream"];

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
  apiKey,
}: ResultStepProps) {
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
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

  const canGenerate = REPLICATE_SUPPORTED_PLATFORMS.includes(selectedPlatform);
  const hasSubject = subject.trim().length > 0;

  const handleGenerate = async () => {
    if (!canGenerate || !hasSubject || isGenerating) return;

    setIsGenerating(true);
    setGeneratedImageUrl(null);

    try {
      const result = await generateImage({
        prompt: displayPrompt,
        platform: selectedPlatform as GeneratePlatform,
        apiKey,
      });

      if (result.success && result.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
        toast.success("Image generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate image");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImageUrl) return;

    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-${selectedPlatform}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Image downloaded!");
    } catch {
      toast.error("Failed to download image");
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

          <div className="mt-4 flex items-center gap-3">
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

            {canGenerate && (
              <button
                onClick={handleGenerate}
                disabled={!hasSubject || isGenerating}
                aria-label={
                  !hasSubject
                    ? "Add a subject to generate an image"
                    : isGenerating
                    ? "Generating image..."
                    : `Generate image with ${currentConfig.label}`
                }
                title={!hasSubject ? "Add a subject to generate" : undefined}
                className={cn(
                  "px-4 py-2",
                  "flex items-center gap-2 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2",
                  "transition-colors",
                  hasSubject && !isGenerating
                    ? "bg-[var(--accent-ai)] text-white hover:opacity-90"
                    : "bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles aria-hidden="true" className="w-4 h-4" />
                    Generate Image
                  </>
                )}
              </button>
            )}
          </div>

          {canGenerate && (
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              💰 Generating costs ~$0.02-0.04 per image (charged to your Replicate account)
            </p>
          )}
        </div>

        {/* Platform Tip */}
        <div className="px-4 pb-4">
          <div className="p-3 bg-[var(--bg-secondary)] border-l-2 border-[var(--accent-ai)] text-sm">
            <span className="text-[var(--text-muted)]">💡 </span>
            <span className="text-[var(--text-secondary)]">{currentConfig.tip}</span>
          </div>
        </div>
      </div>

      {/* Generated Image Display */}
      {(isGenerating || generatedImageUrl) && (
        <div className="border border-[var(--border-color)] p-4">
          <h3 className="text-sm font-medium mb-4">Generated Image</h3>

          {isGenerating && !generatedImageUrl && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-ai)] mb-4" />
              <p className="text-sm text-[var(--text-secondary)]">
                Generating with {currentConfig.label}...
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                This may take 5-15 seconds
              </p>
            </div>
          )}

          {generatedImageUrl && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={generatedImageUrl}
                  alt={`Generated image using ${currentConfig.label}`}
                  className="max-w-full max-h-[500px] object-contain border border-[var(--border-color)]"
                />
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleDownload}
                  className={cn(
                    "px-4 py-2",
                    "border border-[var(--border-color)] bg-[var(--bg-primary)]",
                    "hover:bg-[var(--bg-secondary)] transition-colors",
                    "flex items-center gap-2 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2"
                  )}
                >
                  <Download aria-hidden="true" className="w-4 h-4" />
                  Download
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={cn(
                    "px-4 py-2",
                    "border border-[var(--border-color)] bg-[var(--bg-primary)]",
                    "hover:bg-[var(--bg-secondary)] transition-colors",
                    "flex items-center gap-2 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2",
                    isGenerating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <RefreshCw aria-hidden="true" className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
