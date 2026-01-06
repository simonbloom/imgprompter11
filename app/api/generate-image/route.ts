import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

type SupportedPlatform = "flux" | "nano_banana" | "seedream";

const MODEL_MAP: Record<SupportedPlatform, string> = {
  flux: "black-forest-labs/flux-2-pro",
  nano_banana: "google/nano-banana-pro",
  seedream: "bytedance/seedream-4.5",
};

const SUPPORTED_PLATFORMS: SupportedPlatform[] = ["flux", "nano_banana", "seedream"];

function getModelInput(platform: SupportedPlatform, prompt: string): Record<string, unknown> {
  switch (platform) {
    case "flux":
      return {
        prompt,
        resolution: "1 MP",
        aspect_ratio: "1:1",
        output_format: "webp",
        output_quality: 80,
        safety_tolerance: 2,
      };
    case "nano_banana":
      return {
        prompt,
        aspect_ratio: "4:3",
        output_format: "png",
      };
    case "seedream":
      return {
        prompt,
        size: "2K",
        aspect_ratio: "1:1",
        max_images: 1,
        sequential_image_generation: "disabled",
      };
    default:
      return { prompt };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, platform, apiKey } = body;

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { success: false, error: "Replicate API key is required" },
        { status: 400 }
      );
    }

    if (!apiKey.startsWith("r8_") || apiKey.length < 10) {
      return NextResponse.json(
        { success: false, error: "Invalid API key format" },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!platform || !SUPPORTED_PLATFORMS.includes(platform as SupportedPlatform)) {
      return NextResponse.json(
        { success: false, error: `Invalid platform. Supported: ${SUPPORTED_PLATFORMS.join(", ")}` },
        { status: 400 }
      );
    }

    const replicate = new Replicate({ auth: apiKey });
    const modelId = MODEL_MAP[platform as SupportedPlatform] as `${string}/${string}`;
    const input = getModelInput(platform as SupportedPlatform, prompt.trim());

    const output = await replicate.run(modelId, { input });

    let imageUrl: string | undefined;

    if (typeof output === "string") {
      imageUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      const firstOutput = output[0];
      if (typeof firstOutput === "string") {
        imageUrl = firstOutput;
      } else if (firstOutput && typeof firstOutput === "object" && "url" in firstOutput) {
        imageUrl = (firstOutput as { url: () => string }).url();
      }
    } else if (output && typeof output === "object" && "url" in output) {
      imageUrl = (output as { url: () => string }).url();
    }

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "Failed to generate image - no URL returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      platform,
    });
  } catch (error) {
    console.error("[generate-image API] Error:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("authentication") ||
        error.message.includes("401") ||
        error.message.includes("Invalid API")
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid API key. Please check your Replicate API key." },
          { status: 401 }
        );
      }
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { success: false, error: "Rate limit exceeded. Please wait a moment and try again." },
          { status: 429 }
        );
      }
      if (error.message.includes("content") || error.message.includes("safety")) {
        return NextResponse.json(
          { success: false, error: "Image could not be generated due to content policy. Try adjusting your prompt." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Failed to generate image. Please try again." },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 120;
