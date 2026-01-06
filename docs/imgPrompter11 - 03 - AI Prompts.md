# imgPrompter11 - AI Prompts Reference

## Overview

This document contains the exact AI prompts used for the style extraction feature. These prompts have been refined and tested to produce high-quality, actionable style descriptions suitable for AI image generation.

---

## Core Prompts

### System Prompt (Style Extraction Expert)

This system prompt establishes Claude as a style analysis expert and defines the output format.

```
You are an expert at analyzing images and extracting their artistic and stylistic characteristics.

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
"Beautiful landscape with trees" ❌ (generic, describes subject not style)
```

---

### User Prompt - Single Image

Used when the user uploads exactly one image.

```
Analyze this image and extract its visual style characteristics into a detailed prompt that could be used to generate new images in the same style.

${userGuidance ? `User notes: "${userGuidance}"

Pay special attention to the aspects the user mentioned while maintaining focus on style over content.` : ''}

Focus exclusively on style elements, not the subject matter. Output a natural, flowing description suitable as an image generation prompt.
```

**Variables:**
- `userGuidance` (optional): User-provided notes about what aspects they want to focus on

---

### User Prompt - Multiple Images (2-5)

Used when the user uploads 2-5 images. The key difference is focusing on **common patterns** across images.

```
Analyze these ${imageCount} images and extract their COMMON style characteristics into a detailed prompt that could be used to generate new images in the same style.

${userGuidance ? `User notes: "${userGuidance}"

Pay special attention to the aspects the user mentioned.` : ''}

Focus on style patterns that appear across multiple images, not unique elements of individual images. Output a unified style description suitable as an image generation prompt.
```

**Variables:**
- `imageCount`: Number of images (2-5)
- `userGuidance` (optional): User-provided notes

---

## Prompt Construction Logic

### JavaScript/TypeScript Implementation

```typescript
const buildUserPrompt = (imageCount: number, userGuidance?: string) => {
  if (imageCount === 1) {
    // Single image prompt
    return `Analyze this image and extract its visual style characteristics into a detailed prompt that could be used to generate new images in the same style.

${userGuidance ? `User notes: "${userGuidance}"\n\nPay special attention to the aspects the user mentioned while maintaining focus on style over content.` : ''}

Focus exclusively on style elements, not the subject matter. Output a natural, flowing description suitable as an image generation prompt.`;
  } else {
    // Multiple images prompt
    return `Analyze these ${imageCount} images and extract their COMMON style characteristics into a detailed prompt that could be used to generate new images in the same style.

${userGuidance ? `User notes: "${userGuidance}"\n\nPay special attention to the aspects the user mentioned.` : ''}

Focus on style patterns that appear across multiple images, not unique elements of individual images. Output a unified style description suitable as an image generation prompt.`;
  }
};
```

---

## Model Configuration

### Recommended Settings

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Model** | `claude-sonnet-4-5` | Best vision understanding in Claude family (released Sep 2025, 200K context) |
| **Max Tokens** | `500` | Allows detailed response while preventing runaway generation |
| **Temperature** | `0.3` | Low temperature for consistent, focused outputs |

### Implementation

```typescript
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const result = await generateText({
  model: anthropic('claude-sonnet-4-5'),
  messages: [
    {
      role: 'system',
      content: STYLE_EXTRACTION_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: buildUserPrompt(imageUrls.length, userGuidance),
        },
        // Images are added here - Claude handles multiple images natively
        ...imageUrls.map(url => ({
          type: 'image' as const,
          image: url,
        })),
      ],
    },
  ],
  maxTokens: 500,
  temperature: 0.3,
});
```

---

## Expected Output Characteristics

### Quality Criteria

A good style prompt should:

1. **Be 100-150 words** - Detailed but concise
2. **Use natural language** - Flowing sentences, not bullet points
3. **Be style-focused** - No subject matter descriptions
4. **Use artistic terminology** - Professional vocabulary
5. **Be directly usable** - Ready to paste into AI image generators

### Output Examples

**Example 1: Watercolor Style**
```
Soft watercolor illustration with delicate pastel colors, predominantly pink and cream tones. Loose, flowing brush strokes with visible water bleeding effects. Dreamy, ethereal atmosphere with high key lighting and subtle gradients. Minimalist composition with lots of negative space. Gentle, calming mood with organic, natural textures.
```

**Example 2: Cinematic Photography**
```
Cinematic photography style with rich, saturated colors and dramatic contrast. Deep shadows and golden hour lighting create a moody, atmospheric feel. Wide aspect ratio composition with strong leading lines and depth. Film grain texture adds vintage warmth. Bokeh effects in background, sharp focus on subjects. Warm color grade with teal shadows and amber highlights.
```

**Example 3: Digital Art**
```
Vibrant digital illustration with bold, saturated colors and clean vector-like edges. High contrast lighting with dramatic rim lights and soft ambient fill. Dynamic composition with diagonal elements creating energy and movement. Smooth gradients and subtle noise texture for depth. Modern, polished aesthetic with attention to detail in highlights and reflections.
```

**Example 4: Vintage/Retro**
```
Vintage aesthetic with faded, desaturated colors and warm sepia undertones. Heavy film grain and light leaks add nostalgic texture. Soft focus with slight vignetting around edges. Muted contrast with lifted blacks and crushed highlights. Analog photography feel with occasional color bleeding and chromatic aberration. Timeless, sentimental mood.
```

---

## Error Handling

### Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Generic output | Images lack distinctive style | Prompt user to upload more stylistically consistent images |
| Content description | Model describes subjects | Reinforce system prompt; may need model fine-tuning |
| Too short | Low token limit | Increase maxTokens to 500 |
| Too long | High temperature | Reduce temperature to 0.3 |
| Bullet points | Model defaults to lists | System prompt explicitly forbids this format |

### Fallback Prompt

If extraction fails, provide a helpful error message:

```
Unable to extract style from the provided images. Tips:
- Upload images with clear, distinctive visual styles
- Avoid heavily compressed or low-resolution images
- Try images with similar aesthetic qualities
- Add guidance about what style aspects interest you
```

---

## Testing the Prompts

### Test Cases

1. **Single high-quality image** - Should produce detailed, accurate style description
2. **Multiple similar images** - Should identify common patterns
3. **Mixed style images** - Should find commonalities or note diversity
4. **Low-quality image** - Should still extract what's possible
5. **With user guidance** - Should emphasize mentioned aspects

### Validation Checklist

- [ ] Output is natural language (no bullet points)
- [ ] Output focuses on style, not content
- [ ] Output is 100-150 words
- [ ] Output uses artistic terminology
- [ ] Output is usable as an image generation prompt
- [ ] User guidance is incorporated when provided

---

## Future Prompt Enhancements

### Potential Improvements (V2+)

1. **Style Categories** - Pre-classify into photography, illustration, 3D, etc.
2. **Confidence Scores** - Rate certainty of extracted characteristics
3. **Multiple Variations** - Generate 3 style prompt variations
4. **Format Options** - Output in Midjourney, DALL-E, or SD formats
5. **Comparison Mode** - Compare styles between image sets
6. **Refinement Loop** - Iteratively improve based on user feedback
