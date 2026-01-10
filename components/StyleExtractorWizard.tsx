"use client";

import { useState, useEffect, useCallback } from "react";
import { Key, Upload, Sparkles, ImageIcon, Loader2, X, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ApiKeyInput } from "./ApiKeyInput";
import { UploadStep, type UploadedImage } from "./UploadStep";
import { ResultStep, type GeneratedImage, PLATFORM_CONFIG } from "./ResultStep";
import { Accordion } from "./ui/Accordion";
import { Lightbox } from "./ui/Lightbox";
import { uploadMultipleImages } from "@/utils/uploadImage";
import { postStyleExtraction, type PlatformPrompts, type PlatformKey } from "@/utils/styleExtractionClient";

const STORAGE_KEY = "imgprompter_replicate_api_key";
const GENERATED_IMAGES_KEY = "imgprompter-generated-images";

export function StyleExtractorWizard() {
  const [apiKey, setApiKey] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [userGuidance, setUserGuidance] = useState("");
  const [prompts, setPrompts] = useState<PlatformPrompts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Accordion states
  const [apiKeyOpen, setApiKeyOpen] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(true);
  const [stylePromptsOpen, setStylePromptsOpen] = useState(true);
  const [imagesOpen, setImagesOpen] = useState(true);

  // Generated images state (lifted from ResultStep)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generatingPlatforms, setGeneratingPlatforms] = useState<Set<PlatformKey>>(new Set());
  const [generationErrors, setGenerationErrors] = useState<Partial<Record<PlatformKey, string>>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem(STORAGE_KEY);
      if (savedKey) {
        setApiKey(savedKey);
        setApiKeyOpen(false); // Auto-collapse if key already saved
      }
    }
  }, []);

  // Auto-collapse API key section when valid key entered
  useEffect(() => {
    if (apiKey && apiKey.startsWith("r8_") && apiKey.length > 10) {
      setApiKeyOpen(false);
    }
  }, [apiKey]);

  // Auto-collapse upload section when prompts extracted
  useEffect(() => {
    if (prompts) {
      setUploadOpen(false);
    }
  }, [prompts]);

  // Load generated images from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(GENERATED_IMAGES_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setGeneratedImages(parsed);
          }
        } catch {
          // Invalid JSON, ignore
        }
      }
    }
  }, []);

  // Callbacks to receive state from ResultStep
  const handleGeneratedImagesChange = useCallback((images: GeneratedImage[]) => {
    setGeneratedImages(images);
  }, []);

  const handleGeneratingPlatformsChange = useCallback((platforms: Set<PlatformKey>) => {
    setGeneratingPlatforms(platforms);
  }, []);

  const handleGenerationErrorsChange = useCallback((errors: Partial<Record<PlatformKey, string>>) => {
    setGenerationErrors(errors);
  }, []);

  const handleClearImages = () => {
    setGeneratedImages([]);
    setGenerationErrors({});
    localStorage.removeItem(GENERATED_IMAGES_KEY);
    toast.success("Images cleared");
  };

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${PLATFORM_CONFIG[image.platform].label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded");
    } catch {
      toast.error("Failed to download image");
    }
  };

  const handleDownloadAll = async () => {
    if (generatedImages.length === 0 || !prompts) return;
    
    setIsDownloading(true);
    try {
      // TODO: Implement full export in US-013
      toast.info("Download All - coming soon!");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to create download");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExtract = async () => {
    if (!apiKey) {
      toast.error("Please enter your Replicate API key");
      return;
    }

    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setIsExtracting(true);
    setError(null);
    
    // Clear generated images when re-extracting
    localStorage.removeItem(GENERATED_IMAGES_KEY);

    try {
      const uploadResult = await uploadMultipleImages(images.map((img) => img.file));

      if (!uploadResult.success || !uploadResult.urls) {
        throw new Error(uploadResult.errors?.join(", ") || "Failed to upload images");
      }

      const extractResult = await postStyleExtraction({
        imageUrls: uploadResult.urls,
        userGuidance: userGuidance || undefined,
        apiKey,
      });

      if (!extractResult.success || !extractResult.prompts) {
        throw new Error(extractResult.error || "Failed to extract style");
      }

      setPrompts(extractResult.prompts);
      toast.success("Style extracted successfully!");
    } catch (err) {
      console.error("[StyleExtractorWizard] Error:", err);
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setIsExtracting(false);
    }
  };

  const isNextDisabled = images.length === 0 || !apiKey || isExtracting;
  const hasValidApiKey = !!(apiKey && apiKey.startsWith("r8_") && apiKey.length > 10);
  const maskedKey = apiKey ? `${apiKey.slice(0, 5)}...${apiKey.slice(-4)}` : "";

  const uploadSummary = images.length > 0 
    ? `${images.length} image${images.length !== 1 ? "s" : ""}${userGuidance ? " + notes" : ""}`
    : undefined;

  return (
    <div className="space-y-4">
      {/* API Key Section */}
      <Accordion
        title="Replicate API Key"
        icon={<Key className="w-4 h-4" />}
        isOpen={apiKeyOpen}
        onToggle={() => setApiKeyOpen(!apiKeyOpen)}
        isCompleted={hasValidApiKey}
        summary={hasValidApiKey ? maskedKey : undefined}
      >
        <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} />
      </Accordion>

      {/* Upload Section */}
      <Accordion
        title="Upload Reference Image"
        icon={<Upload className="w-4 h-4" />}
        isOpen={uploadOpen}
        onToggle={() => setUploadOpen(!uploadOpen)}
        isCompleted={!!prompts}
        summary={uploadSummary}
      >
        <UploadStep
          images={images}
          onImagesChange={setImages}
          userGuidance={userGuidance}
          onUserGuidanceChange={setUserGuidance}
          onNext={handleExtract}
          isNextDisabled={isNextDisabled}
          apiKey={apiKey}
          isExtracting={isExtracting}
          hasResults={!!prompts}
        />
      </Accordion>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Style Prompts Section */}
      {prompts && (
        <Accordion
          title="Style Prompts"
          icon={<Sparkles className="w-4 h-4" />}
          isOpen={stylePromptsOpen}
          onToggle={() => setStylePromptsOpen(!stylePromptsOpen)}
          isCompleted={true}
          summary={`From ${images.length} image${images.length !== 1 ? "s" : ""}`}
        >
          <ResultStep
            prompts={prompts}
            imageCount={images.length}
            apiKey={apiKey}
            onGeneratedImagesChange={handleGeneratedImagesChange}
            onGeneratingPlatformsChange={handleGeneratingPlatformsChange}
            onGenerationErrorsChange={handleGenerationErrorsChange}
          />
        </Accordion>
      )}

      {/* Generated Images Section */}
      {(generatedImages.length > 0 || generatingPlatforms.size > 0 || Object.keys(generationErrors).length > 0) && (
        <Accordion
          title="Generated Images"
          icon={<ImageIcon className="w-4 h-4" />}
          isOpen={imagesOpen}
          onToggle={() => setImagesOpen(!imagesOpen)}
          isCompleted={generatedImages.length > 0}
          summary={generatedImages.length > 0 ? `${generatedImages.length} image${generatedImages.length !== 1 ? "s" : ""}` : undefined}
        >
          <div className="space-y-4">
            {/* Header with action buttons */}
            {generatedImages.length > 0 && (
              <div className="flex justify-end gap-2">
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
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloading || generatedImages.length === 0}
                  className={cn(
                    "px-3 py-1 text-xs",
                    "border border-[var(--border-color)]",
                    "transition-colors flex items-center gap-1",
                    isDownloading || generatedImages.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-[var(--bg-secondary)]"
                  )}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    "Download All"
                  )}
                </button>
              </div>
            )}

            {/* 3-column Grid */}
            <div className="grid grid-cols-3 gap-4">
              {/* Loading placeholders */}
              {Array.from(generatingPlatforms).map((platform) => (
                <div key={`loading-${platform}`} className="aspect-square border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-ai)] mb-2" />
                  <p className="text-sm text-[var(--text-secondary)]">{PLATFORM_CONFIG[platform].label}</p>
                  <p className="text-xs text-[var(--text-muted)]">Generating...</p>
                </div>
              ))}

              {/* Error placeholders */}
              {Object.entries(generationErrors).map(([platform, errorMsg]) => (
                <div key={`error-${platform}`} className="aspect-square border border-red-200 bg-red-50 flex flex-col items-center justify-center p-4">
                  <X className="w-8 h-8 text-red-400 mb-2" />
                  <p className="text-sm text-red-600">{PLATFORM_CONFIG[platform as PlatformKey].label}</p>
                  <p className="text-xs text-red-500 text-center mt-1">{errorMsg}</p>
                </div>
              ))}

              {/* Generated images */}
              {generatedImages.map((image, index) => (
                <div key={image.timestamp} className="relative group">
                  <button
                    onClick={() => setLightboxIndex(index)}
                    className="w-full focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)]"
                    aria-label={`View ${PLATFORM_CONFIG[image.platform].label} image in lightbox`}
                  >
                    <img
                      src={image.url}
                      alt={`Generated with ${PLATFORM_CONFIG[image.platform].label}`}
                      className="w-full aspect-square object-cover border border-[var(--border-color)] cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs flex items-center justify-between">
                    <span>{PLATFORM_CONFIG[image.platform].label}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image);
                      }}
                      className="p-1 hover:bg-white/20 rounded"
                      title="Download"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state */}
            {generatedImages.length === 0 && generatingPlatforms.size === 0 && Object.keys(generationErrors).length === 0 && (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">
                No images generated yet. Add a subject and click Generate Images.
              </p>
            )}
          </div>
        </Accordion>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && generatedImages.length > 0 && (
        <Lightbox
          images={generatedImages.map((img) => ({
            url: img.url,
            platform: img.platform,
            label: PLATFORM_CONFIG[img.platform].label,
          }))}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(index) => setLightboxIndex(index)}
          onDownload={() => handleDownload(generatedImages[lightboxIndex])}
        />
      )}
    </div>
  );
}
