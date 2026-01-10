"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Sparkles, X, Loader2, Download, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PlatformPrompts, PlatformKey } from "@/utils/styleExtractionClient";
import { generateImage, type GeneratePlatform } from "@/utils/generateImageClient";

interface GeneratedImage {
  url: string;
  platform: PlatformKey;
  timestamp: number;
}

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
  const [generatingPlatforms, setGeneratingPlatforms] = useState<Set<PlatformKey>>(new Set());
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]); 
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
          const parsed = JSON.parse(saved);
          // Handle both old format (object) and new format (array)
          if (Array.isArray(parsed)) {
            setGeneratedImages(parsed);
          } else {
            // Migrate old format to new format
            const migrated: GeneratedImage[] = Object.entries(parsed)
              .filter(([, url]) => url)
              .map(([platform, url]) => ({
                url: url as string,
                platform: platform as PlatformKey,
                timestamp: Date.now(),
              }));
            setGeneratedImages(migrated);
            localStorage.setItem(GENERATED_IMAGES_KEY, JSON.stringify(migrated));
          }
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

  const hasSubject = subject.trim().length > 0;
  const canGenerateNow = hasSubject || Object.keys(editedPrompts).length > 0;
  const isGenerating = generatingPlatforms.size > 0;
  const generatingCount = generatingPlatforms.size;

  // Get prompt for a specific platform (with subject merged in)
  const getPromptForPlatform = (platform: PlatformKey): string => {
    const basePrompt = prompts[platform];
    if (editedPrompts[platform]) {
      return editedPrompts[platform];
    }
    if (subject.trim()) {
      return `${subject.trim()}, rendered in ${basePrompt.charAt(0).toLowerCase()}${basePrompt.slice(1)}`;
    }
    return basePrompt;
  };

  // Generate with automatic retry (up to 3 attempts)
  const generateWithRetry = async (platform: PlatformKey, maxRetries = 3) => {
    const prompt = getPromptForPlatform(platform);
    let lastError = "Unknown error";

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await generateImage({
          prompt,
          platform: platform as GeneratePlatform,
          apiKey,
        });

        if (result.success && result.imageUrl) {
          return { success: true, imageUrl: result.imageUrl };
        }

        lastError = result.error || "Failed to generate";

        // Don't retry on content policy errors
        if (lastError.includes("content policy") || lastError.includes("Invalid API")) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      } catch (error) {
        console.error(`Generation attempt ${attempt} for ${platform}:`, error);
        lastError = "Network error";
      }
    }

    return { success: false, error: lastError };
  };

  const handleGenerateAll = async () => {
    if (!canGenerateNow || isGenerating) return;

    // Clear previous errors
    setGenerationErrors({});

    // Generate for all supported platforms in parallel
    const platformsToGenerate = REPLICATE_SUPPORTED_PLATFORMS;

    // Mark all as generating
    setGeneratingPlatforms(new Set(platformsToGenerate));

    // Start all generations in parallel (each with its own retry logic)
    platformsToGenerate.forEach(async (platform) => {
      const result = await generateWithRetry(platform);

      if (result.success && result.imageUrl) {
        const newImage: GeneratedImage = {
          url: result.imageUrl,
          platform,
          timestamp: Date.now(),
        };
        setGeneratedImages((prev) => {
          const updated = [...prev, newImage];
          localStorage.setItem(GENERATED_IMAGES_KEY, JSON.stringify(updated));
          return updated;
        });
        toast.success(`${PLATFORM_CONFIG[platform].label} image ready!`);
        onImageGenerated?.();
      } else {
        setGenerationErrors((prev) => ({ ...prev, [platform]: result.error || "Failed after 3 attempts" }));
        toast.error(`${PLATFORM_CONFIG[platform].label}: ${result.error}`);
      }

      // Remove this platform from generating set
      setGeneratingPlatforms((prev) => {
        const updated = new Set(prev);
        updated.delete(platform);
        return updated;
      });
    });
  };

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-${image.platform}-${image.timestamp}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Image downloaded!");
    } catch {
      toast.error("Failed to download image");
    }
  };

  const handleClearImages = () => {
    setGeneratedImages([]);
    localStorage.removeItem(GENERATED_IMAGES_KEY);
    toast.success("Images cleared");
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

            <button
              onClick={handleGenerateAll}
              disabled={!canGenerateNow || isGenerating}
              aria-label={
                !canGenerateNow
                  ? "Add a subject or edit the prompt to generate images"
                  : isGenerating
                  ? `Generating ${generatingCount} images...`
                  : "Generate images for all platforms"
              }
              title={!canGenerateNow ? "Add a subject or edit the prompt to generate" : undefined}
              className={cn(
                "px-4 py-2",
                "flex items-center gap-2 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2",
                "transition-colors",
                canGenerateNow && !isGenerating
                  ? "bg-[var(--accent-ai)] text-white hover:opacity-90"
                  : "bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
                  Generating ({generatingCount}/{REPLICATE_SUPPORTED_PLATFORMS.length})...
                </>
              ) : (
                <>
                  <Sparkles aria-hidden="true" className="w-4 h-4" />
                  Generate Images
                </>
              )}
            </button>
          </div>

          <p className="mt-2 text-xs text-[var(--text-muted)]">
            💰 Generates 3 images (~$0.06-0.12 total, charged to your Replicate account)
          </p>
        </div>

        {/* Platform Tip */}
        <div className="px-4 pb-4">
          <div className="p-3 bg-[var(--bg-secondary)] border-l-2 border-[var(--accent-ai)] text-sm">
            <span className="text-[var(--text-muted)]">💡 </span>
            <span className="text-[var(--text-secondary)]">{currentConfig.tip}</span>
          </div>
        </div>
      </div>

      {/* Generated Images Grid */}
      {(generatedImages.length > 0 || isGenerating || Object.keys(generationErrors).length > 0) && (
        <div className="border border-[var(--border-color)] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              🎨 Generated Images
              {generatedImages.length > 0 && (
                <span className="text-[var(--text-muted)]">({generatedImages.length})</span>
              )}
              {isGenerating && (
                <span className="text-[var(--accent-ai)] flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {generatingCount} generating...
                </span>
              )}
            </h3>
            {generatedImages.length > 0 && (
              <button
                onClick={handleClearImages}
                className={cn(
                  "px-3 py-1 text-xs",
                  "border border-[var(--border-color)]",
                  "hover:bg-[var(--bg-secondary)] transition-colors"
                )}
              >
                Clear All
              </button>
            )}
          </div>

          {/* 2x2 Grid with Loading Placeholders */}
          <div className="grid grid-cols-2 gap-4">
            {/* Show loading placeholders for platforms being generated */}
            {Array.from(generatingPlatforms).map((platform) => (
              <div key={`loading-${platform}`} className="aspect-square border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-ai)] mb-2" />
                <p className="text-sm text-[var(--text-secondary)]">{PLATFORM_CONFIG[platform].label}</p>
                <p className="text-xs text-[var(--text-muted)]">Generating...</p>
              </div>
            ))}
            
            {/* Show error placeholders */}
            {Object.entries(generationErrors).map(([platform, error]) => (
              <div key={`error-${platform}`} className="aspect-square border border-red-200 bg-red-50 flex flex-col items-center justify-center p-4">
                <X className="w-8 h-8 text-red-400 mb-2" />
                <p className="text-sm text-red-600">{PLATFORM_CONFIG[platform as PlatformKey].label}</p>
                <p className="text-xs text-red-500 text-center mt-1">{error}</p>
              </div>
            ))}
            
            {/* Show generated images */}
            {generatedImages.map((image) => (
              <div key={image.timestamp} className="relative group">
                <img
                  src={image.url}
                  alt={`Generated with ${PLATFORM_CONFIG[image.platform].label}`}
                  className="w-full aspect-square object-cover border border-[var(--border-color)]"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs flex items-center justify-between">
                  <span>{PLATFORM_CONFIG[image.platform].label}</span>
                  <button
                    onClick={() => handleDownload(image)}
                    className="p-1 hover:bg-white/20 rounded"
                    title="Download"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {generatedImages.length === 0 && !isGenerating && Object.keys(generationErrors).length === 0 && (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">
              No images generated yet. Add a subject and click Generate Images.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
