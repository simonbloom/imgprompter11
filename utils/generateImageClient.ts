export type GeneratePlatform = "flux" | "nano_banana" | "seedream";

export interface GenerateImageRequest {
  prompt: string;
  platform: GeneratePlatform;
  apiKey: string;
}

export interface GenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  platform?: string;
  error?: string;
}

export async function generateImage({
  prompt,
  platform,
  apiKey,
}: GenerateImageRequest): Promise<GenerateImageResponse> {
  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        platform,
        apiKey,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[generateImageClient] HTTP error:", response.status, errorText);

      try {
        const errorJson = JSON.parse(errorText);
        return {
          success: false,
          error: errorJson.error || `Request failed: ${response.statusText}`,
        };
      } catch {
        return {
          success: false,
          error: `Request failed: ${response.statusText}`,
        };
      }
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("[generateImageClient] Network error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Network error. Please check your connection and try again.",
    };
  }
}
