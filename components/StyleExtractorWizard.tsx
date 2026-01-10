"use client";

import { useState, useEffect } from "react";
import { Key, Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { ApiKeyInput } from "./ApiKeyInput";
import { UploadStep, type UploadedImage } from "./UploadStep";
import { ResultStep } from "./ResultStep";
import { GeneratedImageSection, useHasGeneratedImages } from "./GeneratedImageSection";
import { Accordion } from "./ui/Accordion";
import { uploadMultipleImages } from "@/utils/uploadImage";
import { postStyleExtraction, type PlatformPrompts } from "@/utils/styleExtractionClient";

const STORAGE_KEY = "imgprompter_replicate_api_key";

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
  const [imageOpen, setImageOpen] = useState(true);

  // Track generated images
  const hasGeneratedImages = useHasGeneratedImages();

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

      {/* Style Prompts Section - Always visible, not in accordion */}
      {prompts && (
        <ResultStep
          prompts={prompts}
          imageCount={images.length}
          apiKey={apiKey}
          onImageGenerated={() => setImageOpen(true)}
        />
      )}

      {/* Generated Image Section */}
      {prompts && (
        <Accordion
          title="Generated Image"
          icon={<ImageIcon className="w-4 h-4" />}
          isOpen={imageOpen}
          onToggle={() => setImageOpen(!imageOpen)}
          isCompleted={hasGeneratedImages}
        >
          <GeneratedImageSection />
        </Accordion>
      )}
    </div>
  );
}
