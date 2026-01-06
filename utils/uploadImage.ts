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

export async function uploadImage(file: File): Promise<UploadImageResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || "Upload failed",
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("[uploadImage] Error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image",
    };
  }
}

export async function uploadMultipleImages(
  files: File[]
): Promise<UploadMultipleImagesResult> {
  try {
    const uploadPromises = files.map((file) => uploadImage(file));
    const results = await Promise.all(uploadPromises);

    const errors = results
      .filter((r) => !r.success)
      .map((r) => r.error || "Upload failed");

    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    const urls = results.filter((r) => r.success && r.url).map((r) => r.url!);

    return {
      success: true,
      urls,
    };
  } catch (error) {
    console.error("[uploadMultipleImages] Error:", error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : "Upload failed"],
    };
  }
}
