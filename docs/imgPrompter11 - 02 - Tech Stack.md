# imgPrompter11 - Tech Stack & Architecture

## Technology Overview

This document outlines the technical stack required to build imgPrompter11 as a standalone product, based on the proven implementation from the content11-v2 project.

> **Last Updated:** January 2026 - All versions verified against latest npm releases.

---

## Recommended Tech Stack

### Frontend

| Technology | Version | Purpose | Why This Choice |
|------------|---------|---------|-----------------|
| **Next.js** | 16.x | Framework | Server components, excellent DX, built-in API routes, React 19.2 support |
| **React** | 19.2.x | UI Library | Latest features including `<Activity />`, `useEffectEvent`, improved performance |
| **TypeScript** | 5.x | Language | Type safety, better developer experience |
| **Tailwind CSS** | 4.1.x | Styling | 5x faster builds, CSS-first config, modern CSS features |
| **shadcn/ui** | 3.6.x | Component Library | High-quality, customizable components, Tailwind v4 compatible |
| **TanStack Query** | 5.x | State Management | Server state, caching, optimistic updates |
| **Sonner** | 1.x | Toast Notifications | Lightweight, beautiful notifications |
| **Lucide React** | 0.400+ | Icons | Consistent, customizable icon set |

### Backend

| Technology | Version | Purpose | Why This Choice |
|------------|---------|---------|-----------------|
| **Next.js API Routes** | 16.x | API Layer | Serverless, colocated with frontend |
| **Vercel AI SDK** | 6.x | AI Integration | Agent-first architecture, full MCP support, 100+ model providers |
| **@ai-sdk/anthropic** | 2.x / 3.x | Claude Integration | Direct Anthropic API support for AI SDK |
| **Claude Sonnet 4.5** | Latest | Vision AI | Best-in-class image understanding, 200K context |
| **Vercel Blob** | 1.1.x | File Storage | Simple blob storage, CDN-backed, up to 5TB files |

### Infrastructure

| Technology | Purpose | Why This Choice |
|------------|---------|-----------------|
| **Vercel** | Hosting | Excellent Next.js support, edge network |
| **Vercel Blob** | Image Storage | Integrated storage, automatic CDN |

### Optional (for authenticated features)

| Technology | Purpose | Why This Choice |
|------------|---------|-----------------|
| **Supabase** | Auth & Database | Quick setup, PostgreSQL, Row Level Security |
| **Supabase Auth** | Authentication | OAuth, magic links, session management |

### Additional Dependencies

| Package | Purpose |
|---------|---------|
| **tw-animate-css** | Animation utilities for Tailwind v4 |

---

## Design System & Styling

### Global CSS (`globals.css`)

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-mono);
  --font-mono: var(--font-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: 0;
  --radius-md: 0;
  --radius-lg: 0;
  --radius-xl: 0;
  --radius-2xl: 0;
  --radius-3xl: 0;
  --radius-4xl: 0;
}

:root {
  --radius: 0;

  /* Technical Architect Color Palette */
  --bg-primary: #faf9f7;
  --bg-secondary: #f5f4f2;
  --grid-lines: #d8d6d3;
  --border-color: #d4d2cf;
  --text-primary: #1a1a1a;
  --text-secondary: #555555;
  --text-muted: #888888;
  --accent-gold: #f5a623;
  --accent-ai: #6366f1;

  /* Spacing System (24px base) */
  --space-xs: 6px;
  --space-sm: 12px;
  --space-md: 24px;
  --space-lg: 48px;
  --space-xl: 72px;
  --space-2xl: 120px;
  --container-max: 1152px;

  /* Tailwind variable mappings */
  --background: var(--bg-primary);
  --foreground: var(--text-primary);
  --card: var(--bg-secondary);
  --card-foreground: var(--text-primary);
  --popover: var(--bg-secondary);
  --popover-foreground: var(--text-primary);
  --primary: var(--text-primary);
  --primary-foreground: var(--bg-primary);
  --secondary: var(--bg-secondary);
  --secondary-foreground: var(--text-primary);
  --muted: var(--bg-secondary);
  --muted-foreground: var(--text-muted);
  --accent: var(--bg-secondary);
  --accent-foreground: var(--text-primary);
  --destructive: #dc2626;
  --border: var(--border-color);
  --input: var(--border-color);
  --ring: var(--text-muted);
  --chart-1: var(--accent-gold);
  --chart-2: var(--accent-ai);
  --chart-3: var(--text-secondary);
  --chart-4: var(--text-muted);
  --chart-5: var(--border-color);
  --sidebar: var(--bg-primary);
  --sidebar-foreground: var(--text-primary);
  --sidebar-primary: var(--text-primary);
  --sidebar-primary-foreground: var(--bg-primary);
  --sidebar-accent: var(--bg-secondary);
  --sidebar-accent-foreground: var(--text-primary);
  --sidebar-border: var(--border-color);
  --sidebar-ring: var(--text-muted);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

html, body, * {
  font-family: var(--font-mono), 'Courier New', monospace;
}

.mono-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.mono-tag {
  font-size: 12px;
  padding: 2px 8px;
  border: 1px solid var(--border-color);
}

.accent-gold { color: var(--accent-gold); }
.accent-ai { color: var(--accent-ai); }
```

### Design Principles

| Aspect | Implementation |
|--------|----------------|
| **Border Radius** | Zero (all `--radius-*` set to 0) - sharp, technical aesthetic |
| **Typography** | Monospace throughout (`--font-mono`) |
| **Color Palette** | Warm neutrals (#faf9f7 base) with gold (#f5a623) and indigo (#6366f1) accents |
| **Spacing** | 24px base grid system |
| **shadcn/ui Style** | New York variant |

### Color Reference

```
Background:   #faf9f7 (warm off-white)
Secondary:    #f5f4f2 (light warm gray)
Border:       #d4d2cf (medium warm gray)
Text Primary: #1a1a1a (near black)
Text Muted:   #888888 (medium gray)
Accent Gold:  #f5a623 (warm gold - highlights)
Accent AI:    #6366f1 (indigo - AI/tech elements)
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              imgPrompter11                                       │
│                            Architecture Overview                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                          Next.js 16 App Router                           │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │    │
│  │  │   Landing   │  │   Upload    │  │  Analyzing  │  │   Results   │    │    │
│  │  │    Page     │  │    Step     │  │    Step     │  │    Step     │    │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │    │
│  │                                                                          │    │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │    │
│  │  │                    Shared Components                             │    │    │
│  │  │  • ImageUploader  • ProgressIndicator  • StylePromptEditor      │    │    │
│  │  │  • ImagePreview   • LoadingSpinner     • CopyButton             │    │    │
│  │  └─────────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP/HTTPS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               API LAYER                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                      Next.js API Routes (Serverless)                     │    │
│  │                                                                          │    │
│  │  ┌─────────────────────────┐    ┌─────────────────────────────────────┐│    │
│  │  │ POST /api/upload-image  │    │ POST /api/style-extraction         ││    │
│  │  │                         │    │                                     ││    │
│  │  │ • Validate file type    │    │ • Validate image URLs              ││    │
│  │  │ • Validate file size    │    │ • Call Claude Sonnet 4.5 Vision    ││    │
│  │  │ • Upload to Vercel Blob │    │ • Return style prompt              ││    │
│  │  │ • Return public URL     │    │                                     ││    │
│  │  └─────────────────────────┘    └─────────────────────────────────────┘│    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                         │                              │
                         │                              │
                         ▼                              ▼
┌────────────────────────────────┐    ┌────────────────────────────────────────────┐
│       VERCEL BLOB              │    │              ANTHROPIC API                  │
│  ┌──────────────────────────┐  │    │  ┌──────────────────────────────────────┐  │
│  │   Image Storage          │  │    │  │   Claude Sonnet 4.5 Vision Model     │  │
│  │                          │  │    │  │                                      │  │
│  │   • CDN-backed           │  │    │  │   • Image understanding              │  │
│  │   • Public URLs          │  │    │  │   • Style analysis                   │  │
│  │   • Auto-optimization    │  │    │  │   • Natural language output          │  │
│  │   • 5MB per file         │  │    │  │                                      │  │
│  └──────────────────────────┘  │    │  └──────────────────────────────────────┘  │
└────────────────────────────────┘    └────────────────────────────────────────────┘
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                           │
└─────────────────────────────────────────────────────────────────────────────────┘

1. IMAGE UPLOAD FLOW
───────────────────
User selects files → Client validates → FormData POST → API validates → 
Vercel Blob upload → Public URL returned → URLs stored in client state

2. STYLE EXTRACTION FLOW  
─────────────────────────
Client sends image URLs → API receives request → Claude Sonnet 4.5 analyzes →
Style prompt generated → Response returned → Displayed to user

┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────────────────┐   │
│   │  Client  │────▶│   API    │────▶│  Vercel  │────▶│  Public URL          │   │
│   │  (File)  │     │  Route   │     │   Blob   │     │  (CDN-backed)        │   │
│   └──────────┘     └──────────┘     └──────────┘     └──────────────────────┘   │
│                                                                                  │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────────────────┐   │
│   │  Client  │────▶│   API    │────▶│  Claude  │────▶│  Style Prompt        │   │
│   │  (URLs)  │     │  Route   │     │ Sonnet4.5│     │  (Natural Language)  │   │
│   └──────────┘     └──────────┘     └──────────┘     └──────────────────────┘   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
imgprompter11/
├── app/
│   ├── api/
│   │   ├── upload-image/
│   │   │   └── route.ts          # Image upload endpoint
│   │   └── style-extraction/
│   │       └── route.ts          # Style extraction endpoint
│   ├── page.tsx                  # Main landing/app page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── textarea.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── ImageUploader.tsx         # Drag & drop upload component
│   ├── ImagePreviewGrid.tsx      # Uploaded image thumbnails
│   ├── GuidanceInput.tsx         # Optional guidance textarea
│   ├── AnalyzingState.tsx        # Loading/processing indicator
│   ├── StyleResult.tsx           # Result display with edit/copy
│   └── WizardContainer.tsx       # Main wizard state machine
├── services/
│   └── styleExtraction.ts        # Claude integration service
├── utils/
│   ├── uploadImage.ts            # Client-side upload helper
│   └── styleExtractionClient.ts  # API client for extraction
├── lib/
│   └── utils.ts                  # Utility functions (cn, etc.)
├── hooks/
│   └── useStyleExtraction.ts     # React hook for extraction flow
├── public/
│   └── ...                       # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── .env.local                    # Environment variables
```

---

## Environment Variables

```bash
# .env.local

# Anthropic API (Required)
ANTHROPIC_API_KEY=sk-ant-...

# Vercel Blob Storage (Required)
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Optional: Supabase (for auth/database features)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## API Specifications

### POST /api/upload-image

**Request:**
```typescript
// FormData
{
  file: File,      // Image file (JPEG, PNG, WebP)
  userId?: string  // Optional user ID for path organization
}
```

**Response:**
```typescript
{
  success: boolean;
  url?: string;    // Public CDN URL
  error?: string;  // Error message if failed
}
```

**Validation:**
- File type: `image/jpeg`, `image/png`, `image/webp`
- File size: Max 5MB
- Returns 400 for validation errors, 500 for server errors

---

### POST /api/style-extraction

**Request:**
```typescript
{
  imageUrls: string[];     // Array of 1-5 public image URLs
  userGuidance?: string;   // Optional guidance text
}
```

**Response:**
```typescript
{
  success: boolean;
  stylePrompt?: string;    // Extracted style description
  imageCount?: number;     // Number of images processed
  error?: string;          // Error message if failed
}
```

**Validation:**
- `imageUrls` must be non-empty array
- Maximum 5 images
- Each URL must be valid format
- Returns 400 for validation errors, 500 for server errors

---

## Performance Considerations

### Image Upload
- Parallel upload for multiple images
- Client-side validation before upload
- Progress indicators for large files
- Automatic image optimization by Vercel Blob

### API Response Times
- Upload: ~1-3 seconds per image
- Style extraction: ~5-15 seconds (Claude Sonnet 4.5 Vision API)
- Total flow: ~10-20 seconds for 3 images

### Optimization Strategies
1. **Parallel uploads:** Upload all images simultaneously
2. **Streaming responses:** Consider streaming for long operations
3. **Caching:** Cache extracted styles for identical images (hash-based)
4. **CDN:** Vercel Blob provides automatic CDN distribution

---

## Security Considerations

1. **File Validation:** Server-side validation of file types and sizes
2. **Rate Limiting:** Implement rate limiting on API routes (Vercel provides built-in protection)
3. **CORS:** Configure appropriate CORS headers
4. **API Key Security:** Never expose API keys to client
5. **Input Sanitization:** Sanitize user guidance text
6. **URL Validation:** Validate image URLs before sending to Claude

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Setup
1. Create Vercel project
2. Add environment variables in Vercel dashboard
3. Enable Vercel Blob storage
4. Connect to GitHub for automatic deployments

---

## Cost Estimation

| Service | Pricing Model | Estimated Cost |
|---------|---------------|----------------|
| **Vercel Hosting** | Free tier / Pro $20/mo | $0-20/mo |
| **Vercel Blob** | $0.15/GB stored, $0.15/GB transferred | ~$5-20/mo |
| **Anthropic Claude** | $3/M input tokens, $15/M output | ~$0.01-0.05/extraction |

**Per Extraction Cost:** ~$0.01-0.05 (depending on image count and size)

---

## Scaling Considerations

### For High Traffic (V2+)

1. **Image Optimization:** Pre-process and resize images before Claude
2. **Queue System:** Add job queue for peak loads (e.g., Vercel KV + cron)
3. **Caching Layer:** Redis/Vercel KV for duplicate detection
4. **CDN Caching:** Aggressive caching for static assets
5. **Database:** Add Supabase for usage tracking and saved styles
