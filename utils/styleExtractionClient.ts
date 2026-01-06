export interface StyleExtractionRequest {
  imageUrls: string[];
  userGuidance?: string;
  apiKey: string;
}

export interface PlatformPrompts {
  midjourney: string;
  chatgpt: string;
  flux: string;
  nano_banana: string;
  seedream: string;
}

export type PlatformKey = keyof PlatformPrompts;

export interface StyleExtractionResponse {
  success: boolean;
  prompts?: PlatformPrompts;
  error?: string;
  imageCount?: number;
}

export async function postStyleExtraction({
  imageUrls,
  userGuidance,
  apiKey,
}: StyleExtractionRequest): Promise<StyleExtractionResponse> {
  try {
    const response = await fetch("/api/style-extraction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrls,
        userGuidance,
        apiKey,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[styleExtractionClient] HTTP error:",
        response.status,
        errorText
      );

      return {
        success: false,
        error: `Request failed: ${response.statusText}`,
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("[styleExtractionClient] Network error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Network error. Please check your connection and try again.",
    };
  }
}
