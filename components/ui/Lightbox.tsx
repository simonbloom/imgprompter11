"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface LightboxImage {
  url: string;
  platform: string;
  label: string;
}

interface LightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onDownload: () => void;
}

export function Lightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
  onDownload,
}: LightboxProps) {
  const currentImage = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1);
  }, [hasPrev, currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1);
  }, [hasNext, currentIndex, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          handlePrev();
          break;
        case "ArrowRight":
          handleNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, handlePrev, handleNext]);

  if (!currentImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className={cn(
          "absolute top-4 right-4 z-10 p-2",
          "text-white/70 hover:text-white",
          "transition-colors"
        )}
        aria-label="Close lightbox"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Previous button */}
      {hasPrev && (
        <button
          onClick={handlePrev}
          className={cn(
            "absolute left-4 z-10 p-2",
            "text-white/70 hover:text-white",
            "transition-colors"
          )}
          aria-label="Previous image"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          onClick={handleNext}
          className={cn(
            "absolute right-4 z-10 p-2",
            "text-white/70 hover:text-white",
            "transition-colors"
          )}
          aria-label="Next image"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-[90vw] max-h-[90vh]">
        {/* Image */}
        <img
          src={currentImage.url}
          alt={`Generated with ${currentImage.label}`}
          className="max-w-full max-h-[70vh] object-contain"
        />

        {/* Info */}
        <div className="mt-4 text-center text-white">
          <p className="text-lg font-medium">{currentImage.label}</p>
          <p className="text-sm text-white/60 mt-1">
            {currentIndex + 1} / {images.length}
          </p>
        </div>

        {/* Download button */}
        <button
          onClick={onDownload}
          className={cn(
            "mt-4 px-4 py-2",
            "bg-white/10 hover:bg-white/20",
            "text-white text-sm",
            "flex items-center gap-2",
            "transition-colors"
          )}
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
}
