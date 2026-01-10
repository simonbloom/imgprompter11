import Replicate from "replicate";

// ============================================================================
// PASS 1: CLASSIFICATION PROMPT
// ============================================================================
const CLASSIFICATION_PROMPT = `Classify this image into ONE of these categories based on how it was created:

1. PHOTOGRAPHY - Real camera capture (film or digital photograph)
2. TRADITIONAL_ILLUSTRATION - Hand-drawn with pen, ink, pencil, charcoal, markers
3. PAINTING - Traditional paint media (oil, watercolor, acrylic, gouache, pastel)
4. DIGITAL_ART - Created digitally (digital painting, vector art, concept art)
5. 3D_RENDER - Computer-generated 3D imagery (CGI, 3D modeling)
6. MIXED_MEDIA - Combination of techniques, collage, photo manipulation

Respond with ONLY the category name in caps (e.g., "PHOTOGRAPHY"). Nothing else.`;

export type ImageMediumType = 
  | "PHOTOGRAPHY" 
  | "TRADITIONAL_ILLUSTRATION" 
  | "PAINTING" 
  | "DIGITAL_ART" 
  | "3D_RENDER" 
  | "MIXED_MEDIA";

// ============================================================================
// PASS 2: SPECIALIZED ANALYSIS PROMPTS
// ============================================================================
const SPECIALIZED_PROMPTS: Record<ImageMediumType, string> = {
  PHOTOGRAPHY: `You are an expert at analyzing photographs and extracting their technical and aesthetic characteristics.

ANALYZE THESE SPECIFIC ELEMENTS:

CAMERA & FORMAT:
- Camera type feel: DSLR, mirrorless, medium format (shallow DOF, smooth tonal transitions, creamy bokeh), large format, film camera (35mm/120), phone camera, instant/Polaroid
- Sensor/film size characteristics visible in the image

FILM VS DIGITAL:
- If film, identify stock characteristics:
  * Color negative: Kodak Portra (warm skin tones, pastel shadows), Fuji Pro 400H (cooler greens, lifted shadows), Kodak Gold (saturated, contrasty), Ektar (vivid, fine grain)
  * B&W: Ilford HP5 (punchy contrast, visible grain), Tri-X (classic grain structure), T-Max (fine grain, smooth tones), Delta (modern, sharp)
  * Slide: Kodachrome (saturated reds/yellows, archival feel), Velvia (hypersaturated landscapes), Ektachrome (neutral, clean)
- If digital: clean sensor look, highlight recovery style, digital noise pattern

LENS CHARACTER:
- Focal length feel: wide angle (environmental, distortion), normal 35-50mm (natural perspective), portrait 85mm (flattering compression), telephoto (background compression, shallow DOF)
- Bokeh quality: smooth/creamy, busy/nervous, swirly vintage (Helios), cat-eye at edges
- Vintage vs modern: soft glow and flare vs clinical sharpness, coating characteristics
- Aperture feel: wide open softness vs stopped-down sharpness

ERA/AESTHETIC:
- Decade feel: 60s (high contrast B&W), 70s (warm grain, soft focus, earth tones), 80s (flash, saturated), 90s (point-and-shoot, casual), 2000s (early digital), modern (clean, edited)
- Color grading style: film emulation, LOG flat, high contrast, faded/lifted blacks

LIGHTING:
- Quality: hard/soft, natural/artificial, golden hour, overcast, studio
- Direction and mood

OUTPUT FORMAT:
Output 4 platform-optimized prompts capturing these photographic characteristics.
Use EXACTLY this format:

GPT_IMAGE: [structured paragraph: lighting/atmosphere, then camera/lens feel, then film/processing style, ~60-80 words]
FLUX: [subject-first format: photographic style + technical feel, 30-80 words]
NANO_BANANA: [camera-first: shot type + focal length feel + DOF, then composition, then lighting + color palette from film/processing, ~80-100 words]
SEEDREAM: [priority-ordered: most distinctive photographic elements first, 30-100 words]

Focus ONLY on transferable style characteristics, not subject matter.`,

  TRADITIONAL_ILLUSTRATION: `You are an expert at analyzing hand-drawn illustrations and extracting their technique and material characteristics.

ANALYZE THESE SPECIFIC ELEMENTS:

LINE CHARACTER:
- Weight variation: uniform thickness throughout, tapered strokes (thick-to-thin), naturally varied pressure, consistent technical pen width
- Line confidence: bold/decisive single strokes, sketchy/searching multiple passes, hesitant broken lines, loose gestural marks
- Organic quality: visible hand wobble (natural imperfection), human touch irregularities vs mechanical precision
- Edge treatment: clean/crisp defined edges, feathered soft edges, broken/interrupted lines, varied edge quality

TOOL IDENTIFICATION:
- Pen type: fine liner (Micron 0.1-0.8mm, Staedtler Pigment), dip pen with flexible nib (varied line weight), brush pen (expressive thick-thin), felt tip marker, ballpoint (scratchy consistent), technical pen (Rotring, uniform), crow quill (fine detail), fountain pen
- Ink characteristics: India ink (dense opaque black), fountain pen ink (varied saturation), marker (translucent layerable), sepia/brown ink
- If pencil: graphite grade feel (H hard/light vs B soft/dark), colored pencil texture, charcoal (soft, smudgeable), conte crayon

HATCHING/SHADING TECHNIQUE:
- Type: crosshatching (layered angles), parallel hatching (single direction), stippling/pointillism (dots), scribble shading (loose circular), contour hatching (following form)
- Density: tight/close spacing (dark values), loose/open spacing (light values), graduated density for smooth tonal transition
- Regularity: precise/mechanical even spacing vs organic/irregular hand-drawn spacing
- Direction: consistent angle (45°, horizontal, vertical), form-following curved, random expressive
- Layering: single pass hatching vs built-up multiple layers for depth

SURFACE/PAPER INFLUENCE:
- Paper texture: smooth bristol (crisp clean lines), cold press texture (broken stroke edges), hot press (smooth), toned/colored paper (mid-tone base)
- White space usage: how untouched paper creates highlights and breathing room
- Paper color showing through: cream, white, gray, tan

OUTPUT FORMAT:
Output 4 platform-optimized prompts capturing these illustration characteristics.
Use EXACTLY this format:

GPT_IMAGE: [structured paragraph: line quality description, then tool/medium feel, then hatching/shading technique, ~60-80 words]
FLUX: [illustration style + technique descriptors, 30-80 words]
NANO_BANANA: [composition framing, then line work style, then shading technique, then medium feel, ~80-100 words]
SEEDREAM: [priority-ordered: most distinctive illustration elements first - line quality, hatching style, tool feel, 30-100 words]

Focus ONLY on transferable style characteristics, not subject matter.`,

  PAINTING: `You are an expert at analyzing paintings and extracting their medium and technique characteristics.

ANALYZE THESE SPECIFIC ELEMENTS:

MEDIUM IDENTIFICATION:
- Paint type: oil (slow-drying, rich blendable, lustrous), watercolor (transparent washes, wet edges, paper texture), acrylic (fast-drying, versatile opacity), gouache (opaque matte watercolor), pastel (chalky, soft edges), encaustic (waxy), tempera
- Medium behavior: how the paint sits on surface, transparency/opacity, texture buildup

BRUSH/APPLICATION TECHNIQUE:
- Stroke visibility: visible impasto (thick textured strokes), smooth blended invisible strokes, dry brush scratchy texture, wet flowing strokes
- Brush type feel: flat brush angular strokes, round brush organic marks, filbert soft edges, palette knife sharp ridges, sponge dabbed texture, finger blended
- Technique: wet-on-wet (soft blending), wet-on-dry (crisp edges), glazing (transparent layers), alla prima (single session), scumbling (broken color), impasto (thick buildup)
- Edge quality: soft lost edges, hard found edges, lost-and-found variety

SURFACE TEXTURE:
- Canvas weave visibility: fine, medium, coarse texture showing through
- Paper texture for watercolor: cold press rough, hot press smooth
- Paint thickness: thin transparent washes, medium body, heavy impasto peaks
- Surface sheen: matte, satin, glossy varnished

COLOR & MIXING:
- Palette approach: limited harmonious palette, full spectrum, complementary contrast, analogous subtle
- Mixing style: optical mixing (separate strokes blend visually), physical blending on surface, layered glazes for depth
- Color temperature: warm dominant, cool dominant, balanced
- Value structure: high key (light), low key (dark), full range contrast

ARTISTIC MOVEMENT/INFLUENCE (if apparent):
- Style echoes: impressionist (visible strokes, light), expressionist (emotional, bold), realist (detailed), abstract, etc.

OUTPUT FORMAT:
Output 4 platform-optimized prompts capturing these painting characteristics.
Use EXACTLY this format:

GPT_IMAGE: [structured paragraph: medium/technique, then brush work, then color approach, ~60-80 words]
FLUX: [painting style + medium + technique descriptors, 30-80 words]
NANO_BANANA: [composition, then painting medium feel, then brush technique, then color palette, ~80-100 words]
SEEDREAM: [priority-ordered: medium, technique, color approach, 30-100 words]

Focus ONLY on transferable style characteristics, not subject matter.`,

  DIGITAL_ART: `You are an expert at analyzing digital artwork and extracting its style and technique characteristics.

ANALYZE THESE SPECIFIC ELEMENTS:

DIGITAL APPROACH:
- Style category: digital painting (painterly), vector illustration (clean shapes), concept art (atmospheric), anime/manga style, pixel art, photo-bashing, matte painting
- Software feel: painterly Photoshop/Procreate (textured brushes), clean vector Illustrator (sharp edges), Clip Studio (manga tools), 3D-assisted 2D (perfect perspective)

TRADITIONAL MIMICRY (if present):
- Which traditional medium it emulates: oil painting texture, watercolor washes, ink illustration, pencil sketch, charcoal
- Convincingness level: highly realistic traditional feel vs obviously digital
- What reveals digital origin: too-perfect gradients, impossibly smooth blending, layer effects, undo-perfect lines

RENDERING TECHNIQUE:
- Shading style: cel-shaded (flat color blocks with hard shadow edges), soft gradient (smooth airbrushed), painterly (visible brush texture), realistic (detailed lighting)
- Line work: clean vector lines (uniform, perfect curves), sketchy digital lines (textured, varied), lineless (shapes only), thick outlines (cartoon)
- Edge treatment: anti-aliased smooth, crisp pixel-perfect, soft feathered, textured brush edges
- Form rendering: flat 2D shapes, soft 3D form, highly rendered volumetric

DIGITAL-SPECIFIC ELEMENTS:
- Effects: glow/bloom, lens flares, particle effects, chromatic aberration
- Texture overlays: noise/grain additions, paper texture, canvas overlay
- Blend modes visible: multiply shadows, screen/add highlights, overlay color
- Layer composition: visible layer stacking, adjustment layer color grading

COLOR & LIGHTING:
- Digital color: saturated/vibrant, muted/desaturated, neon/glowing
- Lighting approach: dramatic rim lights, soft ambient, multiple colored light sources

OUTPUT FORMAT:
Output 4 platform-optimized prompts capturing these digital art characteristics.
Use EXACTLY this format:

GPT_IMAGE: [structured paragraph: digital style category, then rendering technique, then effects/color, ~60-80 words]
FLUX: [digital art style + rendering approach, 30-80 words]
NANO_BANANA: [composition, then digital rendering style, then color/lighting approach, ~80-100 words]
SEEDREAM: [priority-ordered: style category, rendering technique, distinctive digital elements, 30-100 words]

Focus ONLY on transferable style characteristics, not subject matter.`,

  "3D_RENDER": `You are an expert at analyzing 3D rendered images and extracting their style and technical characteristics.

ANALYZE THESE SPECIFIC ELEMENTS:

RENDERING STYLE:
- Realism level: photorealistic (indistinguishable from photo), semi-realistic, stylized/cartoon, low-poly aesthetic, NPR non-photorealistic (toon shading)
- Engine/software feel: Unreal Engine (cinematic, film grain), Blender Cycles (clean, artistic), Octane (vibrant, artistic), V-Ray (architectural, accurate), Arnold (film quality), real-time game engine look

MATERIALS & SURFACES:
- Shader types: PBR physically-based realistic, subsurface scattering (skin, wax, leaves), metallic (reflective, brushed), glass/transparent, cloth/fabric simulation
- Texture quality: high-resolution detailed maps, hand-painted stylized textures, procedural generated, clean untextured
- Surface detail: normal maps for fine detail, displacement for geometry, wear/weathering, pristine clean

LIGHTING SETUP:
- Type: studio three-point (key/fill/rim), HDRI environment (natural wrap), dramatic single source, multiple colored lights
- Quality: ray-traced accurate (soft shadows, GI), stylized (hard shadows), volumetric fog/atmosphere/god rays
- Mood: bright and clean, moody and dramatic, warm golden, cool blue

CAMERA/RENDER SETTINGS:
- Depth of field: shallow cinematic DOF, deep everything-sharp, tilt-shift miniature effect
- Motion blur: present/absent
- Post-processing: color grading, bloom, lens effects, film grain overlay, chromatic aberration

STYLE CATEGORY:
- Application feel: product visualization (clean, floating), architectural (realistic, contextual), character render (posed, lit), game asset, VFX/film, abstract artistic

OUTPUT FORMAT:
Output 4 platform-optimized prompts capturing these 3D characteristics.
Use EXACTLY this format:

GPT_IMAGE: [structured paragraph: render style, then materials/lighting, then camera/post effects, ~60-80 words]
FLUX: [3D style + rendering approach + lighting, 30-80 words]
NANO_BANANA: [camera/composition, then render style, then lighting setup, then material feel, ~80-100 words]
SEEDREAM: [priority-ordered: render style, lighting, materials, post-processing, 30-100 words]

Focus ONLY on transferable style characteristics, not subject matter.`,

  MIXED_MEDIA: `You are an expert at analyzing mixed media artwork and extracting its component techniques and combination style.

ANALYZE THESE SPECIFIC ELEMENTS:

IDENTIFIED COMPONENTS:
- List each distinct medium/technique present in the work
- Examples: photography + illustration overlay, painting + collage, digital + traditional elements, multiple traditional media combined

COMBINATION METHOD:
- How elements are integrated: layered/overlapping, side-by-side, seamlessly blended, intentionally contrasting
- Digital compositing: photo manipulation, digital collage, mixed traditional scanned and combined
- Physical combination: actual collage, mixed media on single surface

DOMINANT TECHNIQUE:
- Which medium leads/dominates the visual style
- Supporting/accent elements and their role
- Balance between components

INTEGRATION QUALITY:
- Seamless blend: elements feel unified
- Intentional contrast: deliberate visual tension between media
- Textural variety: how different surfaces/techniques interact

UNIQUE CHARACTERISTICS:
- What makes this combination distinctive
- Unexpected juxtapositions
- Technical innovation in combination

OUTPUT FORMAT:
Output 4 platform-optimized prompts capturing this mixed media aesthetic.
Use EXACTLY this format:

GPT_IMAGE: [structured paragraph: primary medium, then secondary elements, then combination style, ~60-80 words]
FLUX: [mixed media style description + component techniques, 30-80 words]
NANO_BANANA: [composition, then dominant technique, then secondary elements, then integration style, ~80-100 words]
SEEDREAM: [priority-ordered: dominant medium, combination approach, distinctive mixed elements, 30-100 words]

Focus ONLY on transferable style characteristics, not subject matter.`
};

function buildUserPrompt(imageCount: number, userGuidance?: string, mediumType?: ImageMediumType): string {
  const mediumContext = mediumType ? `\nDetected medium: ${mediumType}\n` : "";
  
  if (imageCount === 1) {
    return `Analyze this image and extract its visual style characteristics.${mediumContext}
${userGuidance ? `\nUser notes: "${userGuidance}"\nPay special attention to the aspects the user mentioned while maintaining focus on style over content.\n` : ""}
Output 4 platform-optimized prompts as specified in the format above.`;
  } else {
    return `Analyze these ${imageCount} images and extract their COMMON style characteristics.${mediumContext}
${userGuidance ? `\nUser notes: "${userGuidance}"\nPay special attention to the aspects the user mentioned.\n` : ""}
Focus on style patterns that appear across multiple images. Output 4 platform-optimized prompts as specified in the format above.`;
  }
}

export interface StyleExtractionRequest {
  imageUrls: string[];
  userGuidance?: string;
  apiKey: string;
}

export type PlatformKey = "gpt_image" | "flux" | "nano_banana" | "seedream";

export interface PlatformPrompts {
  gpt_image: string;
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
  const platformLabels: Record<PlatformKey, string[]> = {
    gpt_image: ["GPT_IMAGE:", "**GPT_IMAGE:**", "GPT Image:", "GPT_IMAGE :", "GPT IMAGE:"],
    flux: ["FLUX:", "**FLUX:**", "Flux:"],
    nano_banana: ["NANO_BANANA:", "**NANO_BANANA:**", "Nano Banana:", "NANO BANANA:"],
    seedream: ["SEEDREAM:", "**SEEDREAM:**", "Seedream:", "SEEDREAM :"],
  };

  const result: Partial<PlatformPrompts> = {};
  const platforms: PlatformKey[] = ["gpt_image", "flux", "nano_banana", "seedream"];

  // Find all label positions
  const labelPositions: { platform: PlatformKey; position: number }[] = [];
  
  for (const platform of platforms) {
    const labels = platformLabels[platform];
    for (const label of labels) {
      const pos = rawOutput.indexOf(label);
      if (pos !== -1) {
        labelPositions.push({ platform, position: pos });
        break;
      }
    }
  }

  // Sort by position
  labelPositions.sort((a, b) => a.position - b.position);

  // Extract content between labels
  for (let i = 0; i < labelPositions.length; i++) {
    const current = labelPositions[i];
    const nextPosition = i + 1 < labelPositions.length 
      ? labelPositions[i + 1].position 
      : rawOutput.length;

    // Find the label that was matched
    const labels = platformLabels[current.platform];
    let labelEnd = current.position;
    for (const label of labels) {
      if (rawOutput.indexOf(label) === current.position) {
        labelEnd = current.position + label.length;
        break;
      }
    }

    const content = rawOutput.slice(labelEnd, nextPosition).trim();
    if (content) {
      result[current.platform] = content;
    }
  }

  // Log for debugging if parsing fails
  if (Object.keys(result).length !== 4) {
    console.error("[parsePlatformPrompts] Failed to parse all platforms. Found:", Object.keys(result));
    console.error("[parsePlatformPrompts] Raw output:", rawOutput.slice(0, 500));
  }

  if (Object.keys(result).length === 4) {
    return result as PlatformPrompts;
  }

  // Fallback: if we got at least one prompt, fill missing ones with a generic message
  if (Object.keys(result).length > 0) {
    const firstFound = Object.values(result)[0];
    for (const platform of platforms) {
      if (!result[platform]) {
        result[platform] = firstFound || "Style extraction incomplete. Please try again.";
      }
    }
    return result as PlatformPrompts;
  }

  return null;
}

// ============================================================================
// PASS 1: CLASSIFY IMAGE MEDIUM
// ============================================================================
async function classifyImageMedium(
  imageUrl: string,
  replicate: Replicate
): Promise<ImageMediumType> {
  console.log("[styleExtraction] Pass 1: Classifying image medium...");
  
  const output = await replicate.run("anthropic/claude-4.5-sonnet", {
    input: {
      prompt: CLASSIFICATION_PROMPT,
      image: imageUrl,
      max_tokens: 1024, // Replicate API minimum
      temperature: 0.1, // Low temperature for consistent classification
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

  // Parse the classification response
  const validTypes: ImageMediumType[] = [
    "PHOTOGRAPHY",
    "TRADITIONAL_ILLUSTRATION", 
    "PAINTING",
    "DIGITAL_ART",
    "3D_RENDER",
    "MIXED_MEDIA"
  ];

  // Clean up response and find matching type
  const cleanedResponse = rawOutput.toUpperCase().replace(/[^A-Z_]/g, "");
  
  for (const type of validTypes) {
    if (cleanedResponse.includes(type.replace("_", ""))) {
      console.log(`[styleExtraction] Detected medium: ${type}`);
      return type;
    }
  }

  // More flexible matching for partial matches
  if (cleanedResponse.includes("PHOTO")) return "PHOTOGRAPHY";
  if (cleanedResponse.includes("ILLUSTRATION") || cleanedResponse.includes("DRAWING") || cleanedResponse.includes("INK") || cleanedResponse.includes("SKETCH")) return "TRADITIONAL_ILLUSTRATION";
  if (cleanedResponse.includes("PAINT") || cleanedResponse.includes("WATERCOLOR") || cleanedResponse.includes("OIL")) return "PAINTING";
  if (cleanedResponse.includes("DIGITAL") || cleanedResponse.includes("VECTOR")) return "DIGITAL_ART";
  if (cleanedResponse.includes("3D") || cleanedResponse.includes("RENDER") || cleanedResponse.includes("CGI")) return "3D_RENDER";
  if (cleanedResponse.includes("MIXED") || cleanedResponse.includes("COLLAGE")) return "MIXED_MEDIA";

  // Default fallback
  console.log(`[styleExtraction] Could not classify, defaulting to DIGITAL_ART. Raw: ${rawOutput}`);
  return "DIGITAL_ART";
}

// ============================================================================
// MAIN EXTRACTION FUNCTION (TWO-PASS)
// ============================================================================
export async function extractStyleFromImage({
  imageUrls,
  userGuidance,
  apiKey,
}: StyleExtractionRequest): Promise<StyleExtractionResponse> {
  try {
    const replicate = new Replicate({ auth: apiKey });

    // ========================================
    // PASS 1: Classify the image medium
    // ========================================
    const mediumType = await classifyImageMedium(imageUrls[0], replicate);

    // ========================================
    // PASS 2: Specialized style extraction
    // ========================================
    console.log(`[styleExtraction] Pass 2: Extracting style with ${mediumType} specialization...`);
    
    const specializedPrompt = SPECIALIZED_PROMPTS[mediumType];
    const userPrompt = buildUserPrompt(imageUrls.length, userGuidance, mediumType);
    const fullPrompt = `${specializedPrompt}\n\n${userPrompt}`;

    const output = await replicate.run("anthropic/claude-4.5-sonnet", {
      input: {
        prompt: fullPrompt,
        image: imageUrls[0],
        max_tokens: 1500, // Increased for more detailed analysis
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

    console.log(`[styleExtraction] Successfully extracted style (${mediumType})`);
    
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
