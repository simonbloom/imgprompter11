"use client";

import { useState, useEffect } from "react";
import { Download, RefreshCw, Loader2, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PlatformKey } from "@/utils/styleExtractionClient";

const GENERATED_IMAGES_KEY = "imgprompter-generated-images";
const STORAGE_KEY = "imgprompter-selected-platform";

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  chatgpt: "ChatGPT",
  flux: "Flux Pro",
  nano_banana: "Nano Banana",
  seedream: "Seedream",
};

interface GeneratedImageSectionProps {
  onRegenerate?: () => void;
  isGenerating?: boolean;
}

export function GeneratedImageSection({ onRegenerate, isGenerating }: GeneratedImageSectionProps) {
  const [generatedImages, setGeneratedImages] = useState<Partial<Record<PlatformKey, string>>>({});
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>("chatgpt");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(GENERATED_IMAGES_KEY);
      if (saved) {
        try {
          setGeneratedImages(JSON.parse(saved));
        } catch {
          // Invalid JSON
        }
      }
      const platform = localStorage.getItem(STORAGE_KEY);
      if (platform) {
        setSelectedPlatform(platform as PlatformKey);
      }
    }

    // Listen for storage changes from ResultStep
    const handleStorage = () => {
      const saved = localStorage.getItem(GENERATED_IMAGES_KEY);
      if (saved) {
        try {
          setGeneratedImages(JSON.parse(saved));
        } catch {
          // Invalid JSON
        }
      }
      const platform = localStorage.getItem(STORAGE_KEY);
      if (platform) {
        setSelectedPlatform(platform as PlatformKey);
      }
    };

    window.addEventListener("storage", handleStorage);
    
    // Also poll for changes (since storage event doesn't fire in same tab)
    const interval = setInterval(handleStorage, 500);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const currentImage = generatedImages[selectedPlatform];
  const hasAnyImage = Object.values(generatedImages).some(Boolean);

  const handleDownload = async () => {
    if (!currentImage) return;

    try {
      const response = await fetch(currentImage);
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

  if (!hasAnyImage && !isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--text-muted)]">
        <ImageIcon className="w-8 h-8 mb-3" />
        <p className="text-sm">No images generated yet</p>
        <p className="text-xs mt-1">Generate an image from the Style Prompts section above</p>
      </div>
    );
  }

  if (isGenerating && !currentImage) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-ai)] mb-4" />
        <p className="text-sm text-[var(--text-secondary)]">Generating image...</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">This may take 5-15 seconds</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {currentImage ? (
        <>
          <div className="flex justify-center">
            <img
              src={currentImage}
              alt={`Generated image using ${PLATFORM_LABELS[selectedPlatform]}`}
              className="max-w-full max-h-[500px] object-contain border border-[var(--border-color)]"
            />
          </div>

          <p className="text-center text-sm text-[var(--text-muted)]">
            Generated with {PLATFORM_LABELS[selectedPlatform]}
          </p>

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
              <Download className="w-4 h-4" />
              Download
            </button>

            {onRegenerate && (
              <button
                onClick={onRegenerate}
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
                <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                Regenerate
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center text-[var(--text-muted)]">
          <p className="text-sm">No image for {PLATFORM_LABELS[selectedPlatform]} yet</p>
        </div>
      )}
    </div>
  );
}

export function useHasGeneratedImages(): boolean {
  const [hasImages, setHasImages] = useState(false);

  useEffect(() => {
    const check = () => {
      const saved = localStorage.getItem(GENERATED_IMAGES_KEY);
      if (saved) {
        try {
          const images = JSON.parse(saved);
          setHasImages(Object.values(images).some(Boolean));
        } catch {
          setHasImages(false);
        }
      }
    };

    check();
    const interval = setInterval(check, 500);
    return () => clearInterval(interval);
  }, []);

  return hasImages;
}
