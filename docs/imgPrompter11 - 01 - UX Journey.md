# imgPrompter11 - UX Journey

## Product Overview

**imgPrompter11** is a standalone AI-powered image style extraction tool that analyzes uploaded reference images and generates detailed style prompts for AI image generation. Users upload 1-5 reference images, optionally provide guidance, and receive a comprehensive style description that can be used with any AI image generator.

---

## User Journey Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              imgPrompter11                                       │
│                         AI Image Style Extractor                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: LANDING / ENTRY                                                         │
│  ─────────────────────────                                                       │
│  • Hero section explaining the value proposition                                 │
│  • "Extract AI-ready style prompts from any image"                               │
│  • Clear CTA: "Start Extracting" or "Upload Images"                              │
│  • Example before/after showing reference image → style prompt → generated image │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: IMAGE UPLOAD                                                            │
│  ────────────────────────                                                        │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                     📤 SELECT REFERENCE IMAGES                             │  │
│  │                                                                            │  │
│  │      ┌─────────────────────────────────────────────────────────────┐      │  │
│  │      │                                                             │      │  │
│  │      │          ☁️ Drag & drop or click to upload                  │      │  │
│  │      │                                                             │      │  │
│  │      │            Select 1-5 reference images                      │      │  │
│  │      │          JPG, PNG, or WebP • 5MB each max                   │      │  │
│  │      │                                                             │      │  │
│  │      └─────────────────────────────────────────────────────────────┘      │  │
│  │                                                                            │  │
│  │  💡 TIP: Hold Cmd (Mac) or Ctrl (Windows) to select multiple files         │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: IMAGE PREVIEW & GUIDANCE (after upload)                                 │
│  ───────────────────────────────────────────────────────────────────────────     │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  Uploaded Images:                                                          │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                             │  │
│  │  │ IMG1 │ │ IMG2 │ │ IMG3 │ │ [+]  │ │      │                             │  │
│  │  │  ✕   │ │  ✕   │ │  ✕   │ │ Add  │ │      │                             │  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                             │  │
│  │                                                                            │  │
│  │  ┌───────────────────────────────────────────────────────────────────┐    │  │
│  │  │ Optional: Add guidance for the AI                                  │    │  │
│  │  │ ┌─────────────────────────────────────────────────────────────┐   │    │  │
│  │  │ │ Focus on the warm color palette and soft lighting...        │   │    │  │
│  │  │ │                                                             │   │    │  │
│  │  │ └─────────────────────────────────────────────────────────────┘   │    │  │
│  │  │ Help the AI understand what aspects you want to emphasize         │    │  │
│  │  └───────────────────────────────────────────────────────────────────┘    │  │
│  │                                                                            │  │
│  │                              [ Extract Style → ]                           │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: ANALYZING (Loading State)                                               │
│  ─────────────────────────────────                                               │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                            │  │
│  │                         🤖 Claude Sonnet 4.5                                      │  │
│  │                                                                            │  │
│  │                   Analyzing your images...                                 │  │
│  │                                                                            │  │
│  │   Extracting visual style, color palette, mood, composition,               │  │
│  │                    and lighting...                                         │  │
│  │                                                                            │  │
│  │                     ◐ Uploading images...                                  │  │
│  │                     ◐ Analyzing style with Claude 4.5...                   │  │
│  │                                                                            │  │
│  │                        Please wait...                                      │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 5: RESULTS - EXTRACTED STYLE PROMPT                                        │
│  ───────────────────────────────────────────                                     │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  ✨ Extracted Style                                    🤖 Claude Sonnet 4.5       │  │
│  │                                                                            │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ ✓ Claude analyzed your images and extracted the style patterns      │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                            │  │
│  │  Style Description:                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Soft watercolor illustration with delicate pastel colors,           │  │  │
│  │  │ predominantly pink and cream tones. Loose, flowing brush strokes    │  │  │
│  │  │ with visible water bleeding effects. Dreamy, ethereal atmosphere    │  │  │
│  │  │ with high key lighting and subtle gradients. Minimalist             │  │  │
│  │  │ composition with lots of negative space. Gentle, calming mood       │  │  │
│  │  │ with organic, natural textures.                                     │  │  │
│  │  │                                                                     │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  │  You can edit this prompt before copying                                   │  │
│  │                                                                            │  │
│  │  [ ← Back ]                                      [ Copy to Clipboard 📋 ]  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 6: SUCCESS / COMPLETION                                                    │
│  ────────────────────────────                                                    │
│  • Toast notification: "Style prompt copied to clipboard!"                       │
│  • Option to "Extract Another Style" (reset flow)                                │
│  • Optional: Save to account (if authenticated)                                  │
│  • Optional: Share link to result                                                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Step Breakdown

### Step 1: Landing Page
**Purpose:** Introduce the tool and its value proposition

**Elements:**
- Hero headline: "Turn Any Image Into an AI Style Prompt"
- Subheadline: "Upload reference images. Get detailed style descriptions. Generate consistent AI art."
- Primary CTA: "Start Extracting" button
- Visual demo: Animated or static example showing the transformation
- Trust indicators: "Powered by Claude Sonnet 4.5 Vision AI"

**User Actions:**
- Click "Start Extracting" → Navigate to upload step

---

### Step 2: Image Upload
**Purpose:** Allow users to upload 1-5 reference images

**Elements:**
- Drag-and-drop zone with cloud upload icon
- File browser button as alternative
- Supported formats: JPG, PNG, WebP
- Size limit: 5MB per image
- Multi-select tip for power users

**Validation:**
- File type validation (image/* only)
- File size validation (max 5MB each)
- Count validation (max 5 images)

**User Actions:**
- Drag files into zone OR click to browse
- System creates preview thumbnails
- Progress to Step 3 automatically when files are selected

---

### Step 3: Image Preview & Guidance
**Purpose:** Review uploads and optionally guide the AI

**Elements:**
- Grid of uploaded image thumbnails (4 columns)
- Remove button (X) on each thumbnail hover
- "Add" button to add more images (if < 5)
- Optional guidance textarea
- "Extract Style" CTA button

**Guidance Textarea:**
- Placeholder: "Focus on color palette and mood..."
- Helper text: "Help Claude understand what aspects of the style you want to focus on"
- Character limit: ~500 characters (soft limit)

**User Actions:**
- Remove unwanted images
- Add more images
- Enter optional guidance
- Click "Extract Style" → Proceed to Step 4

---

### Step 4: Analyzing (Loading State)
**Purpose:** Keep user informed during AI processing

**Processing Stages:**
1. "Uploading images..." (images to blob storage)
2. "Analyzing style with Claude Sonnet 4.5..." (AI vision analysis)

**Elements:**
- Claude Sonnet 4.5 badge/indicator
- Processing message
- Animated spinner
- Status text updates
- "Please wait..." message

**Duration:** Typically 5-15 seconds depending on image count

---

### Step 5: Results
**Purpose:** Display extracted style prompt and allow editing

**Elements:**
- Success banner: "Claude analyzed your images and extracted the style patterns"
- Claude Sonnet 4.5 badge
- Editable textarea with extracted style prompt
- Helper text: "You can edit this prompt before copying"
- Back button
- "Copy to Clipboard" primary CTA

**Style Prompt Characteristics:**
- 100-150 words
- Natural, flowing language (not bullet points)
- Focuses on transferable style elements:
  - Visual style (watercolor, photorealistic, etc.)
  - Color palette and lighting
  - Composition techniques
  - Mood and atmosphere
  - Artistic techniques
  - Distinctive visual elements

---

### Step 6: Success State
**Purpose:** Confirm action and provide next steps

**Elements:**
- Toast notification: "Style prompt copied to clipboard!"
- "Extract Another Style" button (resets flow)
- Optional: Save to account (for authenticated users)
- Optional: Download as text file

---

## Mobile Considerations

```
┌─────────────────────────────┐
│  MOBILE LAYOUT              │
│  ───────────────            │
│                             │
│  ┌───────────────────────┐  │
│  │   📤 Tap to Upload    │  │
│  │                       │  │
│  │   1-5 images          │  │
│  │   5MB max each        │  │
│  └───────────────────────┘  │
│                             │
│  ┌─────┐ ┌─────┐ ┌─────┐   │
│  │ IMG │ │ IMG │ │ [+] │   │
│  └─────┘ └─────┘ └─────┘   │
│                             │
│  ┌───────────────────────┐  │
│  │ Optional guidance...  │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │    Extract Style →    │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

- Single column layout
- Larger touch targets
- Camera/photo library access on mobile
- 3-column image grid (vs 4 on desktop)
- Full-width buttons

---

## Error States

### Upload Errors
- "File must be an image (JPG, PNG, or WebP)"
- "File must be smaller than 5MB"
- "Maximum 5 images allowed"

### Analysis Errors
- "Rate limit exceeded. Please try again in a moment."
- "API authentication error. Please contact support."
- "Failed to extract style. Please try again."
- "Network error. Please check your connection and try again."

### Recovery
- All errors show toast notifications
- User returned to upload step with images preserved
- Clear error message with actionable guidance

---

## Success Metrics

1. **Completion Rate:** % of users who complete extraction after starting
2. **Time to Extract:** Average time from upload to result
3. **Copy Rate:** % of users who copy the extracted prompt
4. **Repeat Usage:** Users who return to extract additional styles
5. **Error Rate:** % of extractions that fail

---

## Future Enhancements (V2+)

1. **Preview Generation:** Test the style prompt with built-in image generators
2. **Style Library:** Save and organize extracted styles
3. **Style Comparison:** Upload multiple style sets to compare
4. **Prompt Refinement:** AI-powered editing suggestions
5. **Export Options:** Export to Midjourney, DALL-E, Stable Diffusion formats
6. **Team Sharing:** Share styles with team members
7. **API Access:** Developer API for integrations
