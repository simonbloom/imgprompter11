import { NextRequest, NextResponse } from "next/server";
import { extractStyleFromImage } from "@/services/styleExtraction";

const MAX_GUIDANCE_LENGTH = 500;
const ALLOWED_URL_PATTERNS = [
  /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//,
  /^https:\/\/[a-z0-9-]+\.blob\.vercel-storage\.com\//,
];

function sanitizeUserGuidance(input: unknown): string | undefined {
  if (!input || typeof input !== "string") return undefined;
  
  // Trim and limit length
  let sanitized = input.trim().slice(0, MAX_GUIDANCE_LENGTH);
  
  // Remove any potential injection patterns
  sanitized = sanitized
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>]/g, ""); // Remove angle brackets
  
  return sanitized || undefined;
}

function isAllowedUrl(url: string): boolean {
  return ALLOWED_URL_PATTERNS.some((pattern) => pattern.test(url));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrls, userGuidance, apiKey } = body;

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { success: false, error: "Replicate API key is required" },
        { status: 400 }
      );
    }

    // Validate API key format (Replicate keys start with r8_)
    if (!apiKey.startsWith("r8_") || apiKey.length < 10) {
      return NextResponse.json(
        { success: false, error: "Invalid API key format" },
        { status: 400 }
      );
    }

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one image URL is required" },
        { status: 400 }
      );
    }

    if (imageUrls.length > 5) {
      return NextResponse.json(
        { success: false, error: "Maximum 5 images allowed" },
        { status: 400 }
      );
    }

    // Validate and check each URL
    for (const url of imageUrls) {
      if (typeof url !== "string") {
        return NextResponse.json(
          { success: false, error: "All image URLs must be strings" },
          { status: 400 }
        );
      }

      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid URL format" },
          { status: 400 }
        );
      }

      // Only allow URLs from Vercel Blob storage
      if (!isAllowedUrl(url)) {
        return NextResponse.json(
          { success: false, error: "Images must be uploaded through this application" },
          { status: 400 }
        );
      }
    }

    // Sanitize user guidance
    const sanitizedGuidance = sanitizeUserGuidance(userGuidance);

    const result = await extractStyleFromImage({
      imageUrls,
      userGuidance: sanitizedGuidance,
      apiKey,
    });

    return NextResponse.json(
      {
        ...result,
        imageCount: imageUrls.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[style-extraction API] Unexpected error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again.",
      },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;
