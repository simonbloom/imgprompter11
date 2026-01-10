"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Sparkles, X, Loader2, Download, RefreshCw, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PlatformPrompts, PlatformKey } from "@/utils/styleExtractionClient";
import { generateImage, type GeneratePlatform } from "@/utils/generateImageClient";

interface ResultStepProps {
  prompts: PlatformPrompts;
  imageCount: number;
  apiKey: string;
  onImageGenerated?: () => void;
}

const REPLICATE_SUPPORTED_PLATFORMS: PlatformKey[] = ["flux", "nano_banana", "seedream"];

const PLATFORM_CONFIG: Record<PlatformKey, { label: string; tip: string; fullModelName?: string }> = {
  chatgpt: {
    label: "ChatGPT",
    tip: "Structure: Scene → Subject → Details → Constraints. Use quotes for text. Specify camera/lens for realism.",
  },
  flux: {
    label: "Flux",
    fullModelName: "Black Forest Labs Flux 2 Pro",
    tip: "No negative prompts - describe what you want. Order: Subject → Action → Style → Context. Use hex colors for brand accuracy.",
  },
  nano_banana: {
    label: "Nano Banana",
    fullModelName: "Google Imagen 3 (Nano Banana Pro)",
    tip: "Camera-first format: Start with angle + shot type + perspective (e.g., 'low-angle medium shot, 3/4 view, f/2.8'), then subject position, spatial setting, lighting, style. Excels at precise compositions.",
  },
  seedream: {
    label: "Seedream",
    fullModelName: "ByteDance Seedream 4.5",
    tip: "Keep prompts 30-100 words. Order: Subject → Style → Composition → Lighting → Technical. Critical elements first.",
  },
};

const PLATFORM_ORDER: PlatformKey[] = ["chatgpt", "flux", "nano_banana", "seedream"];
const STORAGE_KEY = "imgprompter-selected-platform";
const GENERATED_IMAGES_KEY = "imgprompter-generated-images";

export function ResultStep({
  prompts,
  imageCount,
  apiKey,
  onImageGenerated,
}: ResultStepProps) {
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState("");
  const [editedPrompts, setEditedPrompts] = useState<Partial<Record<PlatformKey, string>>>({});
  const [generatingPlatforms, setGeneratingPlatforms] = useState<Partial<Record<PlatformKey, boolean>>>({});
  const [generatedImages, setGeneratedImages] = useState<Partial<Record<PlatformKey, string>>>({}); 
  const [generationErrors, setGenerationErrors] = useState<Partial<Record<PlatformKey, string>>>({});
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && PLATFORM_ORDER.includes(stored as PlatformKey)) {
        return stored as PlatformKey;
      }
    }
    return "chatgpt";
  });

  // Load generated images from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(GENERATED_IMAGES_KEY);
      if (saved) {
        try {
          setGeneratedImages(JSON.parse(saved));
        } catch {
          // Invalid JSON, ignore
        }
      }
    }
  }, []);

  const handlePlatformChange = (platform: PlatformKey) => {
    setSelectedPlatform(platform);
    localStorage.setItem(STORAGE_KEY, platform);
  };

  // Get generated image, error, and generating state for current platform
  const currentGeneratedImage = generatedImages[selectedPlatform];
  const currentGenerationError = generationErrors[selectedPlatform];
  const isCurrentPlatformGenerating = generatingPlatforms[selectedPlatform] ?? false;

  const currentPrompt = prompts[selectedPlatform];
  const currentConfig = PLATFORM_CONFIG[selectedPlatform];

  const displayPrompt = subject.trim()
    ? `${subject.trim()}, rendered in ${currentPrompt.charAt(0).toLowerCase()}${currentPrompt.slice(1)}`
    : currentPrompt;

  // Use edited prompt if available, otherwise fall back to computed displayPrompt
  const effectivePrompt = editedPrompts[selectedPlatform] ?? displayPrompt;
  const hasEdits = editedPrompts[selectedPlatform] !== undefined;

  // Clear edits when subject changes so new subject is applied
  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
    setEditedPrompts({});
  };

  const handlePromptEdit = (value: string) => {
    setEditedPrompts((prev) => ({ ...prev, [selectedPlatform]: value }));
  };

  const handleResetPrompt = () => {
    setEditedPrompts((prev) => {
      const updated = { ...prev };
      delete updated[selectedPlatform];
      return updated;
    });
    toast.success("Prompt reset to original");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(effectivePrompt);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const canGenerate = REPLICATE_SUPPORTED_PLATFORMS.includes(selectedPlatform);
  const hasSubject = subject.trim().length > 0;
  const canGenerateNow = hasSubject || hasEdits;

  const handleGenerate = async () => {
    if (!canGenerate || !canGenerateNow || isCurrentPlatformGenerating) return;

    // Capture the platform we're generating for (in case user switches tabs)
    const platformToGenerate = selectedPlatform;

    // Set generating state for THIS platform only
    setGeneratingPlatforms((prev) => ({ ...prev, [platformToGenerate]: true }));
    
    // Clear any previous error for this platform
    setGenerationErrors((prev) => {
      const updated = { ...prev };
      delete updated[platformToGenerate];
      return updated;
    });

    try {
      const result = await generateImage({
        prompt: effectivePrompt,
        platform: platformToGenerate as GeneratePlatform,
        apiKey,
      });

      if (result.success && result.imageUrl) {
        // Use functional update to avoid stale closure - always get latest state
        setGeneratedImages((prev) => {
          const updated = { ...prev, [platformToGenerate]: result.imageUrl };
          localStorage.setItem(GENERATED_IMAGES_KEY, JSON.stringify(updated));
          return updated;
        });
        toast.success(`Image generated with ${PLATFORM_CONFIG[platformToGenerate].label}!`);
        onImageGenerated?.();
      } else {
        const errorMessage = result.error || "Failed to generate image";
        setGenerationErrors((prev) => ({ ...prev, [platformToGenerate]: errorMessage }));
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage = "Network error. Please check your connection and try again.";
      setGenerationErrors((prev) => ({ ...prev, [platformToGenerate]: errorMessage }));
      toast.error(errorMessage);
    } finally {
      // Clear generating state for THIS platform
      setGeneratingPlatforms((prev) => {
        const updated = { ...prev };
        delete updated[platformToGenerate];
        return updated;
      });
    }
  };

  const handleDownload = async () => {
    if (!currentGeneratedImage) return;

    try {
      const response = await fetch(currentGeneratedImage);
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
            onChange={(e) => handleSubjectChange(e.target.value)}
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
          <textarea
            value={effectivePrompt}
            onChange={(e) => handlePromptEdit(e.target.value)}
            aria-label={`${currentConfig.label} style prompt - editable`}
            rows={6}
            className={cn(
              "w-full p-4 min-h-[120px] resize-y",
              "bg-[var(--bg-primary)] border border-[var(--border-color)]",
              "text-[var(--text-primary)] text-sm leading-relaxed",
              "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:border-transparent",
              "transition-colors"
            )}
          />

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

            {hasEdits && (
              <button
                onClick={handleResetPrompt}
                aria-label="Reset prompt to original"
                className={cn(
                  "px-4 py-2",
                  "border border-[var(--border-color)] bg-[var(--bg-primary)]",
                  "hover:bg-[var(--bg-secondary)] transition-colors",
                  "flex items-center gap-2 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2"
                )}
              >
                <RotateCcw aria-hidden="true" className="w-4 h-4" />
                Reset
              </button>
            )}

            {canGenerate && (
              <button
                onClick={handleGenerate}
                disabled={!canGenerateNow || isCurrentPlatformGenerating}
                aria-label={
                  !canGenerateNow
                    ? "Add a subject or edit the prompt to generate an image"
                    : isCurrentPlatformGenerating
                    ? "Generating image..."
                    : `Generate image with ${currentConfig.label}`
                }
                title={!canGenerateNow ? "Add a subject or edit the prompt to generate" : undefined}
                className={cn(
                  "px-4 py-2",
                  "flex items-center gap-2 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2",
                  "transition-colors",
                  canGenerateNow && !isCurrentPlatformGenerating
                    ? "bg-[var(--accent-ai)] text-white hover:opacity-90"
                    : "bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed"
                )}
              >
                {isCurrentPlatformGenerating ? (
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

          {/* Generated Image Display - Inside Tab */}
          {canGenerate && (isCurrentPlatformGenerating || currentGeneratedImage || currentGenerationError) && (
            <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
              <h3 className="text-sm font-medium mb-4">
                {currentGenerationError
                  ? "Generation Failed"
                  : currentGeneratedImage 
                    ? `Image generated by ${currentConfig.fullModelName}` 
                    : `Generating with ${currentConfig.fullModelName}...`}
              </h3>

              {/* Loading State */}
              {isCurrentPlatformGenerating && !currentGeneratedImage && !currentGenerationError && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-ai)] mb-4" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    Generating with {currentConfig.fullModelName}...
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    This may take 5-15 seconds
                  </p>
                </div>
              )}

              {/* Error State */}
              {currentGenerationError && !isCurrentPlatformGenerating && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-sm text-red-600 mb-2">{currentGenerationError}</p>
                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerateNow}
                    className={cn(
                      "mt-2 px-4 py-2",
                      "bg-[var(--accent-ai)] text-white",
                      "hover:opacity-90 transition-colors",
                      "flex items-center gap-2 text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2",
                      !canGenerateNow && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <RefreshCw aria-hidden="true" className="w-4 h-4" />
                    Try Again
                  </button>
                </div>
              )}

              {/* Success State */}
              {currentGeneratedImage && !currentGenerationError && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={currentGeneratedImage}
                      alt={`Generated image using ${currentConfig.fullModelName}`}
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
                      disabled={isCurrentPlatformGenerating || !canGenerateNow}
                      className={cn(
                        "px-4 py-2",
                        "border border-[var(--border-color)] bg-[var(--bg-primary)]",
                        "hover:bg-[var(--bg-secondary)] transition-colors",
                        "flex items-center gap-2 text-sm",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2",
                        (isCurrentPlatformGenerating || !canGenerateNow) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <RefreshCw aria-hidden="true" className={cn("w-4 h-4", isCurrentPlatformGenerating && "animate-spin")} />
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
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

    </div>
  );
}
