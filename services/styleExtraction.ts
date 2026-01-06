import Replicate from "replicate";

const SYSTEM_PROMPT = `You are an expert at analyzing images and extracting their artistic and stylistic characteristics.

When analyzing an image, focus EXCLUSIVELY on style elements, NOT the subject matter or content.

ANALYZE THESE STYLE ELEMENTS:
1. Visual style (e.g., photorealistic, watercolor, oil painting, digital art, anime, sketch, 3D render)
2. Color palette and lighting (e.g., warm tones, cool blues, dramatic shadows, soft lighting, high contrast)
3. Composition techniques (e.g., rule of thirds, centered, symmetrical, dynamic angles, negative space)
4. Mood and atmosphere (e.g., serene, energetic, mysterious, cheerful, dramatic, melancholic)
5. Artistic techniques (e.g., brush strokes, textures, filters, grain, blur effects, sharp details)
6. Distinctive visual elements (e.g., bokeh, film grain, vintage look, minimalist, glitch effects)

OUTPUT FORMAT:
Output the style as 5 platform-optimized prompts. Each prompt must capture the SAME style but formatted optimally for that platform.
Use EXACTLY this format with the platform labels:

MIDJOURNEY: [concise comma-separated phrases, ~50 words, no sentences]
CHATGPT: [structured paragraph: scene/atmosphere, then visual style, then technical details, ~60 words]
FLUX: [subject-first format: style + context, 30-80 words, describe only what you want]
NANO_BANANA: [detailed format: composition, lighting, style, atmosphere, ~70 words]
SEEDREAM: [priority-ordered: most important style elements first, 30-100 words]

RULES:
- Do NOT include titles or headers other than the platform labels
- Avoid repeating descriptive terms across prompts
- Focus ONLY on transferable style characteristics, not subject matter
- Each prompt should be usable directly for image generation`;

function buildUserPrompt(imageCount: number, userGuidance?: string): string {
  if (imageCount === 1) {
    return `Analyze this image and extract its visual style characteristics.
${userGuidance ? `\nUser notes: "${userGuidance}"\nPay special attention to the aspects the user mentioned while maintaining focus on style over content.\n` : ""}
Output 5 platform-optimized prompts as specified in the format above.`;
  } else {
    return `Analyze these ${imageCount} images and extract their COMMON style characteristics.
${userGuidance ? `\nUser notes: "${userGuidance}"\nPay special attention to the aspects the user mentioned.\n` : ""}
Focus on style patterns that appear across multiple images. Output 5 platform-optimized prompts as specified in the format above.`;
  }
}

export interface StyleExtractionRequest {
  imageUrls: string[];
  userGuidance?: string;
  apiKey: string;
}

export type PlatformKey = "midjourney" | "chatgpt" | "flux" | "nano_banana" | "seedream";

export interface PlatformPrompts {
  midjourney: string;
  chatgpt: string;
  flux: string;
  nano_banana: string;
  seedream: string;
}

export interface StyleExtractionResponse {
  success: boolean;
  prompts?: PlatformPrompts;
  error?: string;
}

function parsePlatformPrompts(rawOutput: string): PlatformPrompts | null {
  const platforms: PlatformKey[] = ["midjourney", "chatgpt", "flux", "nano_banana", "seedream"];
  const result: Partial<PlatformPrompts> = {};

  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i];
    const label = platform.toUpperCase().replace("_", "_");
    const regex = new RegExp(`${label}:\\s*(.+?)(?=(?:MIDJOURNEY:|CHATGPT:|FLUX:|NANO_BANANA:|SEEDREAM:|$))`, "is");
    const match = rawOutput.match(regex);
    if (match && match[1]) {
      result[platform] = match[1].trim();
    }
  }

  if (Object.keys(result).length === 5) {
    return result as PlatformPrompts;
  }

  return null;
}

export async function extractStyleFromImage({
  imageUrls,
  userGuidance,
  apiKey,
}: StyleExtractionRequest): Promise<StyleExtractionResponse> {
  try {
    const replicate = new Replicate({ auth: apiKey });

    const userPrompt = buildUserPrompt(imageUrls.length, userGuidance);
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

    const output = await replicate.run("anthropic/claude-4.5-sonnet", {
      input: {
        prompt: fullPrompt,
        image: imageUrls[0],
        max_tokens: 1024,
        temperature: 0.3,
      },
    }) as unknown;

    let rawOutput: string;
    if (typeof output === "string") {
      rawOutput = output.trim();
    } else if (Array.isArray(output)) {
      rawOutput = output.join("").trim();
    } else {
      rawOutput = String(output).trim();
    }

    if (!rawOutput) {
      return {
        success: false,
        error: "No style description generated",
      };
    }

    const prompts = parsePlatformPrompts(rawOutput);
    if (!prompts) {
      return {
        success: false,
        error: "Failed to parse platform-specific prompts from response",
      };
    }

    return {
      success: true,
      prompts,
    };
  } catch (error) {
    console.error("[styleExtraction] Error:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("authentication") ||
        error.message.includes("401") ||
        error.message.includes("Invalid API")
      ) {
        return {
          success: false,
          error: "Invalid API key. Please check your Replicate API key.",
        };
      }
      if (error.message.includes("rate limit")) {
        return {
          success: false,
          error: "Rate limit exceeded. Please try again in a moment.",
        };
      }
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to extract style. Please try again.",
    };
  }
}
