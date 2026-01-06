import Replicate from "replicate";

const SYSTEM_PROMPT = `You are an expert at analyzing images and extracting their artistic and stylistic characteristics.

When analyzing an image, focus EXCLUSIVELY on style elements, NOT the subject matter or content.

ANALYZE AND DESCRIBE:
1. Visual style (e.g., photorealistic, watercolor, oil painting, digital art, anime, sketch, 3D render, pixel art)
2. Color palette and lighting (e.g., warm tones, cool blues, dramatic shadows, soft lighting, high contrast, muted colors)
3. Composition techniques (e.g., rule of thirds, centered, symmetrical, dynamic angles, negative space)
4. Mood and atmosphere (e.g., serene, energetic, mysterious, cheerful, dramatic, melancholic)
5. Artistic techniques (e.g., brush strokes, textures, filters, grain, blur effects, sharp details)
6. Distinctive visual elements (e.g., bokeh, film grain, vintage look, minimalist, maximalist, glitch effects)

OUTPUT REQUIREMENTS:
- Keep output under 100 words (strict limit)
- Do NOT include titles, headers, or section labels
- Use descriptive adjectives and artistic terminology
- Format as 1-2 concise paragraphs (NOT bullet points or lists)
- Avoid repeating descriptive terms
- Output must be suitable as an AI image generation prompt
- Focus ONLY on transferable style characteristics`;

function buildUserPrompt(imageCount: number, userGuidance?: string): string {
  if (imageCount === 1) {
    return `Analyze this image and extract its visual style characteristics into a detailed prompt that could be used to generate new images in the same style.

${userGuidance ? `User notes: "${userGuidance}"\n\nPay special attention to the aspects the user mentioned while maintaining focus on style over content.` : ""}

Focus exclusively on style elements, not the subject matter. Output a natural, flowing description suitable as an image generation prompt.`;
  } else {
    return `Analyze these ${imageCount} images and extract their COMMON style characteristics into a detailed prompt that could be used to generate new images in the same style.

${userGuidance ? `User notes: "${userGuidance}"\n\nPay special attention to the aspects the user mentioned.` : ""}

Focus on style patterns that appear across multiple images, not unique elements of individual images. Output a unified style description suitable as an image generation prompt.`;
  }
}

export interface StyleExtractionRequest {
  imageUrls: string[];
  userGuidance?: string;
  apiKey: string;
}

export interface StyleExtractionResponse {
  success: boolean;
  stylePrompt?: string;
  error?: string;
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

    let stylePrompt: string;
    if (typeof output === "string") {
      stylePrompt = output.trim();
    } else if (Array.isArray(output)) {
      stylePrompt = output.join("").trim();
    } else {
      stylePrompt = String(output).trim();
    }

    if (!stylePrompt) {
      return {
        success: false,
        error: "No style description generated",
      };
    }

    return {
      success: true,
      stylePrompt,
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
