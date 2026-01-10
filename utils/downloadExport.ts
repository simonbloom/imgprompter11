import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { PlatformPrompts, PlatformKey } from "./styleExtractionClient";

export interface GeneratedImage {
  url: string;
  platform: PlatformKey;
  timestamp: number;
}

interface PlatformConfig {
  label: string;
  fullModelName?: string;
}

const PLATFORM_CONFIG: Record<PlatformKey, PlatformConfig> = {
  chatgpt: { label: "ChatGPT" },
  flux: { label: "Flux", fullModelName: "Black Forest Labs Flux 2 Pro" },
  nano_banana: { label: "Nano Banana", fullModelName: "Google Imagen 3 (Nano Banana Pro)" },
  seedream: { label: "Seedream", fullModelName: "ByteDance Seedream 4.5" },
};

const PLATFORM_ORDER: PlatformKey[] = ["flux", "nano_banana", "seedream", "chatgpt"];

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDateTime(date: Date): string {
  return date.toISOString().replace("T", " ").split(".")[0];
}

function getPlatformFilename(platform: PlatformKey): string {
  return platform.replace(/_/g, "-");
}

function generatePromptTextFile(platform: PlatformKey, prompt: string): string {
  const config = PLATFORM_CONFIG[platform];
  const modelName = config.fullModelName ? ` (${config.fullModelName})` : "";
  const now = new Date();

  return `Platform: ${config.label}${modelName}
Generated: ${formatDateTime(now)}

PROMPT:
${prompt}
`;
}

export interface ExportOptions {
  prompts: PlatformPrompts;
  generatedImages: GeneratedImage[];
}

export async function createExportZip(options: ExportOptions): Promise<void> {
  const { prompts, generatedImages } = options;
  const zip = new JSZip();
  const dateStr = formatDate(new Date());

  // Create folders
  const imagesFolder = zip.folder("images");
  const promptsFolder = zip.folder("prompts");

  if (!imagesFolder || !promptsFolder) {
    throw new Error("Failed to create ZIP folders");
  }

  // Add images
  for (const image of generatedImages) {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const filename = `${getPlatformFilename(image.platform)}-${image.timestamp}.png`;
      imagesFolder.file(filename, blob);
    } catch (error) {
      console.error(`Failed to fetch image for ${image.platform}:`, error);
    }
  }

  // Add prompt text files for all platforms
  for (const platform of PLATFORM_ORDER) {
    const prompt = prompts[platform];
    if (prompt) {
      const filename = `${getPlatformFilename(platform)}.txt`;
      const content = generatePromptTextFile(platform, prompt);
      promptsFolder.file(filename, content);
    }
  }

  // Generate and download ZIP
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `style-prompts-${dateStr}.zip`);
}
