"use client";

import { Loader2, Sparkles } from "lucide-react";

interface AnalyzingStepProps {
  imageCount: number;
}

export function AnalyzingStep({ imageCount }: AnalyzingStepProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-[var(--accent-ai)] animate-spin" />
        <Sparkles className="w-4 h-4 text-[var(--accent-gold)] absolute -top-1 -right-1" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-lg font-medium text-[var(--text-primary)]">
          Analyzing Style
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Claude 4.5 Sonnet is extracting style characteristics from{" "}
          {imageCount === 1 ? "your image" : `${imageCount} images`}
        </p>
      </div>

      <div className="mono-tag">
        Processing via Replicate API
      </div>
    </div>
  );
}
