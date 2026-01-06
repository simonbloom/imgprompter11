"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ApiKeyInput } from "./ApiKeyInput";
import { UploadStep, type UploadedImage } from "./UploadStep";
import { AnalyzingStep } from "./AnalyzingStep";
import { ResultStep } from "./ResultStep";
import { uploadMultipleImages } from "@/utils/uploadImage";
import { postStyleExtraction, type PlatformPrompts } from "@/utils/styleExtractionClient";

type WizardStep = "upload" | "analyzing" | "result";

const STORAGE_KEY = "imgprompter_replicate_api_key";

export function StyleExtractorWizard() {
  const [step, setStep] = useState<WizardStep>("upload");
  const [apiKey, setApiKey] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [userGuidance, setUserGuidance] = useState("");
  const [prompts, setPrompts] = useState<PlatformPrompts | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem(STORAGE_KEY);
      if (savedKey) {
        setApiKey(savedKey);
      }
    }
  }, []);

  const handleExtract = async () => {
    if (!apiKey) {
      toast.error("Please enter your Replicate API key");
      return;
    }

    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setStep("analyzing");
    setError(null);

    try {
      // Upload images to Vercel Blob
      const uploadResult = await uploadMultipleImages(images.map((img) => img.file));

      if (!uploadResult.success || !uploadResult.urls) {
        throw new Error(uploadResult.errors?.join(", ") || "Failed to upload images");
      }

      // Extract style using Claude
      const extractResult = await postStyleExtraction({
        imageUrls: uploadResult.urls,
        userGuidance: userGuidance || undefined,
        apiKey,
      });

      if (!extractResult.success || !extractResult.prompts) {
        throw new Error(extractResult.error || "Failed to extract style");
      }

      setPrompts(extractResult.prompts);
      setStep("result");
      toast.success("Style extracted successfully!");
    } catch (err) {
      console.error("[StyleExtractorWizard] Error:", err);
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
      setStep("upload");
    }
  };

  const handleStartOver = () => {
    // Clean up image previews
    images.forEach((img) => URL.revokeObjectURL(img.preview));

    setStep("upload");
    setImages([]);
    setUserGuidance("");
    setPrompts(null);
    setError(null);
  };

  const isNextDisabled = images.length === 0 || !apiKey;

  return (
    <div className="space-y-8">
      {/* API Key Input - Always visible */}
      <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} />

      {/* Divider */}
      <div className="border-t border-[var(--border-color)]" />

      {/* Step Content */}
      {step === "upload" && (
        <UploadStep
          images={images}
          onImagesChange={setImages}
          userGuidance={userGuidance}
          onUserGuidanceChange={setUserGuidance}
          onNext={handleExtract}
          isNextDisabled={isNextDisabled}
          apiKey={apiKey}
        />
      )}

      {step === "analyzing" && <AnalyzingStep imageCount={images.length} />}

      {step === "result" && prompts && (
        <ResultStep
          prompts={prompts}
          imageCount={images.length}
          onStartOver={handleStartOver}
        />
      )}

      {/* Error Display */}
      {error && step === "upload" && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
