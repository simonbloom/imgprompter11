# imgPrompter11 - Implementation Code Reference

## Overview

This document provides the core implementation code needed to build imgPrompter11. All code is extracted from the proven content11-v2 implementation.

> **Tech Stack Versions (January 2026):**
> - Next.js 16.x, React 19.2.x, TypeScript 5.x
> - Vercel AI SDK 6.x, @ai-sdk/anthropic 2.x/3.x
> - Tailwind CSS 4.1.x, @vercel/blob 1.1.x

---

## 1. Style Extraction Service

The core service that interfaces with Claude's Vision API.

### `/services/styleExtraction.ts`

```typescript
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export type VisionModel = 'claude-sonnet-4-5';

const STYLE_EXTRACTION_SYSTEM_PROMPT = `You are an expert at analyzing images and extracting their artistic and stylistic characteristics.

When analyzing an image, focus EXCLUSIVELY on style elements, NOT the subject matter or content.

ANALYZE AND DESCRIBE:
1. Visual style (e.g., photorealistic, watercolor, oil painting, digital art, anime, sketch, 3D render, pixel art)
2. Color palette and lighting (e.g., warm tones, cool blues, dramatic shadows, soft lighting, high contrast, muted colors)
3. Composition techniques (e.g., rule of thirds, centered, symmetrical, dynamic angles, negative space)
4. Mood and atmosphere (e.g., serene, energetic, mysterious, cheerful, dramatic, melancholic)
5. Artistic techniques (e.g., brush strokes, textures, filters, grain, blur effects, sharp details)
6. Distinctive visual elements (e.g., bokeh, film grain, vintage look, minimalist, maximalist, glitch effects)

OUTPUT REQUIREMENTS:
- Keep output under 150 words
- Use descriptive adjectives and artistic terminology
- Format as natural, flowing language (NOT bullet points or lists)
- Output must be suitable as an AI image generation prompt
- Focus ONLY on transferable style characteristics

GOOD EXAMPLE:
"Soft watercolor illustration with delicate pastel colors, predominantly pink and cream tones. Loose, flowing brush strokes with visible water bleeding effects. Dreamy, ethereal atmosphere with high key lighting and subtle gradients. Minimalist composition with lots of negative space. Gentle, calming mood with organic, natural textures."

BAD EXAMPLES:
"A picture of mountains with snow." ❌ (describes content, not style)
"Style: impressionist; Colors: blue, green; Technique: oil painting" ❌ (too list-like, not natural language)
"Beautiful landscape with trees" ❌ (generic, describes subject not style)`;

const buildUserPrompt = (imageCount: number, userGuidance?: string) => {
  if (imageCount === 1) {
    return `Analyze this image and extract its visual style characteristics into a detailed prompt that could be used to generate new images in the same style.

${userGuidance ? `User notes: "${userGuidance}"\n\nPay special attention to the aspects the user mentioned while maintaining focus on style over content.` : ''}

Focus exclusively on style elements, not the subject matter. Output a natural, flowing description suitable as an image generation prompt.`;
  } else {
    return `Analyze these ${imageCount} images and extract their COMMON style characteristics into a detailed prompt that could be used to generate new images in the same style.

${userGuidance ? `User notes: "${userGuidance}"\n\nPay special attention to the aspects the user mentioned.` : ''}

Focus on style patterns that appear across multiple images, not unique elements of individual images. Output a unified style description suitable as an image generation prompt.`;
  }
};

export interface StyleExtractionRequest {
  imageUrls: string[];
  userGuidance?: string;
  model?: VisionModel;
}

export interface StyleExtractionResponse {
  success: boolean;
  stylePrompt?: string;
  error?: string;
}

export async function extractStyleFromImage({
  imageUrls,
  userGuidance,
  model = 'claude-sonnet-4-5',
}: StyleExtractionRequest): Promise<StyleExtractionResponse> {
  try {
    const content: any[] = [
      {
        type: 'text',
        text: buildUserPrompt(imageUrls.length, userGuidance),
      }
    ];
    
    // Add all images - Claude handles them natively
    imageUrls.forEach(url => {
      content.push({
        type: 'image',
        image: url,
      });
    });
    
    const result = await generateText({
      model: anthropic(model),
      messages: [
        {
          role: 'system',
          content: STYLE_EXTRACTION_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content,
        },
      ],
      maxTokens: 500,
      temperature: 0.3,
    });

    const stylePrompt = result.text.trim();

    if (!stylePrompt) {
      return {
        success: false,
        error: 'No style description generated',
      };
    }

    return {
      success: true,
      stylePrompt,
    };
  } catch (error) {
    console.error('[styleExtraction] Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again in a moment.',
        };
      }
      if (error.message.includes('authentication') || error.message.includes('API key')) {
        return {
          success: false,
          error: 'API authentication error. Please contact support.',
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract style. Please try again.',
    };
  }
}
```

---

## 2. API Routes

### `/app/api/style-extraction/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { extractStyleFromImage } from '@/services/styleExtraction';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrls, userGuidance } = body;

    // Validate required parameters
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid image URLs array' },
        { status: 400 }
      );
    }

    // Limit to 5 images
    if (imageUrls.length > 5) {
      return NextResponse.json(
        { success: false, error: 'Maximum 5 images allowed' },
        { status: 400 }
      );
    }

    // Validate each URL
    for (const url of imageUrls) {
      if (typeof url !== 'string') {
        return NextResponse.json(
          { success: false, error: 'All image URLs must be strings' },
          { status: 400 }
        );
      }
      
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { success: false, error: `Invalid URL format: ${url}` },
          { status: 400 }
        );
      }
    }

    // Extract style using Claude Sonnet 4.5
    const result = await extractStyleFromImage({
      imageUrls,
      userGuidance: userGuidance || undefined,
    });

    return NextResponse.json({
      ...result,
      imageCount: imageUrls.length,
    }, { status: 200 });
    
  } catch (error) {
    console.error('[style-extraction API] Unexpected error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again.' 
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
```

---

### `/app/api/upload-image/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File must be smaller than 5MB' },
        { status: 400 }
      );
    }

    // Generate filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const userPath = userId || 'anonymous';
    const filename = `style-references/${userPath}/${timestamp}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
    });
  } catch (error) {
    console.error('[upload-image] Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to upload image'
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
```

---

## 3. Client-Side Utilities

### `/utils/uploadImage.ts`

```typescript
export interface UploadImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface UploadMultipleImagesResult {
  success: boolean;
  urls?: string[];
  errors?: string[];
}

export async function uploadImage(
  file: File,
  userId?: string
): Promise<UploadImageResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (userId) {
      formData.append('userId', userId);
    }

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Upload failed',
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('[uploadImage] Error:', error);
    
    return {
      success: false,
      error: error instanceof Error 
        ? error.message 
        : 'Failed to upload image',
    };
  }
}

export async function uploadMultipleImages(
  files: File[],
  userId?: string
): Promise<UploadMultipleImagesResult> {
  try {
    // Upload all files in parallel for speed
    const uploadPromises = files.map(file => 
      uploadImage(file, userId)
    );
    
    const results = await Promise.all(uploadPromises);
    
    // Collect errors
    const errors = results
      .filter(r => !r.success)
      .map(r => r.error || 'Upload failed');
    
    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }
    
    // Extract URLs
    const urls = results
      .filter(r => r.success && r.url)
      .map(r => r.url!);
    
    return {
      success: true,
      urls,
    };
  } catch (error) {
    console.error('[uploadMultipleImages] Error:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Upload failed'],
    };
  }
}
```

---

### `/utils/styleExtractionClient.ts`

```typescript
export interface StyleExtractionRequest {
  imageUrls: string[];
  userGuidance?: string;
}

export interface StyleExtractionResponse {
  success: boolean;
  stylePrompt?: string;
  error?: string;
  imageCount?: number;
}

export async function postStyleExtraction({
  imageUrls,
  userGuidance,
}: StyleExtractionRequest): Promise<StyleExtractionResponse> {
  try {
    const response = await fetch('/api/style-extraction', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        imageUrls,
        userGuidance,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[styleExtractionClient] HTTP error:', response.status, errorText);
      
      return {
        success: false,
        error: `Request failed: ${response.statusText}`,
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('[styleExtractionClient] Network error:', error);
    
    return {
      success: false,
      error: error instanceof Error 
        ? error.message 
        : 'Network error. Please check your connection and try again.',
    };
  }
}
```

---

## 4. React Components

### Main Wizard Container (Simplified)

```typescript
'use client';

import { useState } from 'react';

type Step = 'upload' | 'analyzing' | 'result';

interface ExtractedResult {
  stylePrompt: string;
  imageUrls: string[];
}

export function StyleExtractorWizard() {
  const [step, setStep] = useState<Step>('upload');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [guidance, setGuidance] = useState('');
  const [result, setResult] = useState<ExtractedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (files: File[]) => {
    // Validate
    if (files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    
    // Create previews
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImages(files);
    setPreviews(newPreviews);
    setError(null);
  };

  const handleExtract = async () => {
    if (images.length === 0) return;
    
    setStep('analyzing');
    setError(null);
    
    try {
      // 1. Upload images
      const { uploadMultipleImages } = await import('@/utils/uploadImage');
      const uploadResult = await uploadMultipleImages(images);
      
      if (!uploadResult.success || !uploadResult.urls) {
        throw new Error(uploadResult.errors?.[0] || 'Upload failed');
      }
      
      // 2. Extract style
      const { postStyleExtraction } = await import('@/utils/styleExtractionClient');
      const extractResult = await postStyleExtraction({
        imageUrls: uploadResult.urls,
        userGuidance: guidance || undefined,
      });
      
      if (!extractResult.success || !extractResult.stylePrompt) {
        throw new Error(extractResult.error || 'Extraction failed');
      }
      
      setResult({
        stylePrompt: extractResult.stylePrompt,
        imageUrls: uploadResult.urls,
      });
      setStep('result');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('upload');
    }
  };

  const handleCopy = async () => {
    if (!result?.stylePrompt) return;
    await navigator.clipboard.writeText(result.stylePrompt);
    // Show toast notification
  };

  const handleReset = () => {
    // Cleanup
    previews.forEach(url => URL.revokeObjectURL(url));
    setStep('upload');
    setImages([]);
    setPreviews([]);
    setGuidance('');
    setResult(null);
    setError(null);
  };

  return (
    <div>
      {step === 'upload' && (
        <UploadStep
          images={images}
          previews={previews}
          guidance={guidance}
          error={error}
          onUpload={handleUpload}
          onGuidanceChange={setGuidance}
          onContinue={handleExtract}
        />
      )}
      
      {step === 'analyzing' && (
        <AnalyzingStep imageCount={images.length} />
      )}
      
      {step === 'result' && result && (
        <ResultStep
          stylePrompt={result.stylePrompt}
          onCopy={handleCopy}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
```

---

### Upload Step Component

```typescript
'use client';

import { useState } from 'react';

interface UploadStepProps {
  images: File[];
  previews: string[];
  guidance: string;
  error: string | null;
  onUpload: (files: File[]) => void;
  onGuidanceChange: (guidance: string) => void;
  onContinue: () => void;
}

const MAX_IMAGES = 5;

export function UploadStep({
  images,
  previews,
  guidance,
  error,
  onUpload,
  onGuidanceChange,
  onContinue,
}: UploadStepProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 5 * 1024 * 1024) return false;
      return true;
    });
    
    onUpload([...images, ...validFiles].slice(0, MAX_IMAGES));
    e.target.value = '';
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onUpload(newImages);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Upload Reference Images</h2>
        <p className="text-muted-foreground">
          Upload 1-{MAX_IMAGES} images to extract their common style.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {previews.length === 0 ? (
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
          <span className="text-4xl mb-2">📤</span>
          <span className="font-medium">Select 1-{MAX_IMAGES} reference images</span>
          <span className="text-sm text-muted-foreground">JPG, PNG, or WebP • 5MB each</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {previews.map((preview, idx) => (
            <div key={idx} className="relative aspect-square group">
              <img
                src={preview}
                alt={`Reference ${idx + 1}`}
                className="w-full h-full object-cover rounded-lg border"
              />
              <button
                onClick={() => handleRemove(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
          
          {images.length < MAX_IMAGES && (
            <label className="aspect-square flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
              <span className="text-2xl">+</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      {images.length > 0 && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">
              Optional: Guide the AI
            </label>
            <textarea
              value={guidance}
              onChange={(e) => onGuidanceChange(e.target.value)}
              placeholder="Focus on the warm color palette and soft lighting..."
              className="w-full p-3 border rounded-lg min-h-[80px] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Help the AI understand what style aspects to focus on
            </p>
          </div>

          <button
            onClick={onContinue}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium"
          >
            Extract Style →
          </button>
        </>
      )}
    </div>
  );
}
```

---

### Analyzing Step Component

```typescript
'use client';

interface AnalyzingStepProps {
  imageCount: number;
}

export function AnalyzingStep({ imageCount }: AnalyzingStepProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="px-4 py-2 bg-violet-100 text-violet-800 rounded-full text-sm font-medium">
        🤖 Claude Sonnet 4.5
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-medium">Analyzing your images...</h3>
        <p className="text-muted-foreground">
          Extracting visual style, color palette, mood, composition, and lighting
          from {imageCount} {imageCount === 1 ? 'image' : 'images'}...
        </p>
      </div>

      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />

      <p className="text-sm text-muted-foreground">Please wait...</p>
    </div>
  );
}
```

---

### Result Step Component

```typescript
'use client';

import { useState } from 'react';

interface ResultStepProps {
  stylePrompt: string;
  onCopy: () => void;
  onReset: () => void;
}

export function ResultStep({ stylePrompt, onCopy, onReset }: ResultStepProps) {
  const [editedPrompt, setEditedPrompt] = useState(stylePrompt);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-xl">✨</span>
        <h2 className="text-xl font-semibold">Extracted Style</h2>
        <span className="px-2 py-1 bg-violet-100 text-violet-800 rounded text-xs">
          Claude Sonnet 4.5
        </span>
      </div>

      <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded">
        ✓ Claude analyzed your images and extracted the style patterns
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Style Description
        </label>
        <textarea
          value={editedPrompt}
          onChange={(e) => setEditedPrompt(e.target.value)}
          className="w-full p-3 border rounded-lg min-h-[200px] resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          You can edit this prompt before copying
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-3 border rounded-lg font-medium"
        >
          ← Extract Another
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
        >
          {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
        </button>
      </div>
    </div>
  );
}
```

---

## 5. Package Dependencies

### `package.json` (relevant dependencies)

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "ai": "^6.0.0",
    "@ai-sdk/anthropic": "^3.0.0",
    "@vercel/blob": "^1.1.0",
    "tailwindcss": "^4.1.0",
    "sonner": "^1.7.0",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/react": "^19.0.0",
    "@types/node": "^22.0.0"
  }
}
```

> **Note:** Version numbers above represent the latest stable releases as of January 2026. Always check npm for the most current versions before starting your project.

---
