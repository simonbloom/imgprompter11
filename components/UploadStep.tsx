"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, ImageIcon, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

interface UploadStepProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  userGuidance: string;
  onUserGuidanceChange: (guidance: string) => void;
  onNext: () => void;
  isNextDisabled: boolean;
  apiKey: string;
  isExtracting?: boolean;
  hasResults?: boolean;
}

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function UploadStep({
  images,
  onImagesChange,
  userGuidance,
  onUserGuidanceChange,
  onNext,
  isNextDisabled,
  apiKey,
  isExtracting = false,
  hasResults = false,
}: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `${file.name}: Must be JPG, PNG, or WebP`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `${file.name}: Must be smaller than ${MAX_SIZE_MB}MB`;
    }
    return null;
  };

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(files);

      if (images.length + fileArray.length > MAX_IMAGES) {
        setError(`Maximum ${MAX_IMAGES} images allowed`);
        return;
      }

      const errors: string[] = [];
      const validFiles: File[] = [];

      for (const file of fileArray) {
        const fileError = validateFile(file);
        if (fileError) {
          errors.push(fileError);
        } else {
          validFiles.push(file);
        }
      }

      if (errors.length > 0) {
        setError(errors.join(". "));
      }

      if (validFiles.length > 0) {
        const newImages: UploadedImage[] = validFiles.map((file) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          preview: URL.createObjectURL(file),
        }));
        onImagesChange([...images, ...newImages]);
      }
    },
    [images, onImagesChange]
  );

  const removeImage = useCallback(
    (id: string) => {
      const image = images.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      onImagesChange(images.filter((img) => img.id !== id));
    },
    [images, onImagesChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(e.target.files);
      }
      e.target.value = "";
    },
    [addFiles]
  );

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload images. Click or drag and drop files here."
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed p-8 cursor-pointer transition-colors",
          "flex flex-col items-center justify-center gap-4 min-h-[200px]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2",
          isDragging
            ? "border-[var(--accent-ai)] bg-[var(--accent-ai)]/5"
            : "border-[var(--border-color)] hover:border-[var(--text-muted)]"
        )}
      >
        <Upload
          aria-hidden="true"
          className={cn(
            "w-8 h-8",
            isDragging ? "text-[var(--accent-ai)]" : "text-[var(--text-muted)]"
          )}
        />
        <div className="text-center">
          <p className="text-[var(--text-primary)]">
            {isDragging ? "Drop images here" : "Drop images or click to upload"}
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            JPG, PNG, WebP · Max {MAX_SIZE_MB}MB · Up to {MAX_IMAGES} images
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          onChange={handleFileSelect}
          className="sr-only"
          aria-label="Choose image files to upload"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div 
          role="alert"
          className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="mono-label" id="image-count">
            {images.length} image{images.length !== 1 ? "s" : ""} selected
          </p>
          <div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
            role="list"
            aria-labelledby="image-count"
          >
            {images.map((img, index) => (
              <div key={img.id} className="relative group aspect-square" role="listitem">
                <img
                  src={img.preview}
                  alt={`Uploaded image ${index + 1} of ${images.length}: ${img.file.name}`}
                  className="w-full h-full object-cover border border-[var(--border-color)]"
                />
                <button
                  onClick={() => removeImage(img.id)}
                  aria-label={`Remove image ${index + 1}: ${img.file.name}`}
                  className={cn(
                    "absolute top-1 right-1 p-1",
                    "bg-black/60 text-white opacity-0 group-hover:opacity-100 focus:opacity-100",
                    "transition-opacity",
                    "focus:outline-none focus:ring-2 focus:ring-white"
                  )}
                >
                  <X aria-hidden="true" className="w-4 h-4" />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                onClick={() => fileInputRef.current?.click()}
                aria-label="Add more images"
                className={cn(
                  "aspect-square border-2 border-dashed border-[var(--border-color)]",
                  "flex items-center justify-center",
                  "hover:border-[var(--text-muted)] transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2"
                )}
              >
                <ImageIcon aria-hidden="true" className="w-6 h-6 text-[var(--text-muted)]" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* User Guidance */}
      <div className="space-y-2">
        <label htmlFor="style-guidance" className="mono-label">Style Notes (Optional)</label>
        <textarea
          id="style-guidance"
          value={userGuidance}
          onChange={(e) => onUserGuidanceChange(e.target.value)}
          placeholder="e.g., 'Focus on the lighting' or 'I love the vintage feel'"
          rows={3}
          maxLength={500}
          className={cn(
            "w-full px-3 py-2 resize-none",
            "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
            "text-sm",
            "placeholder:text-[var(--text-muted)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2"
          )}
        />
      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          aria-disabled={isNextDisabled}
          className={cn(
            "px-6 py-2 text-sm font-medium transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent-ai)] focus:ring-offset-2",
            "flex items-center gap-2",
            isNextDisabled
              ? "bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed"
              : "bg-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-[var(--text-secondary)]"
          )}
        >
          {isExtracting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Extracting...
            </>
          ) : !apiKey ? (
            "Enter API Key First"
          ) : images.length === 0 ? (
            "Add Images First"
          ) : hasResults ? (
            "Re-extract Style →"
          ) : (
            "Extract Style →"
          )}
        </button>
      </div>
    </div>
  );
}

export type { UploadedImage };
