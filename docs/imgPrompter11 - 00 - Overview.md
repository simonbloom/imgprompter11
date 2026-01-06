# imgPrompter11 - Product Requirements Document

## Executive Summary

**imgPrompter11** is a standalone AI-powered image style extraction tool that transforms reference images into detailed, actionable style prompts for AI image generation. Users can upload 1-5 reference images, and the tool uses Claude Sonnet 4.5's advanced vision capabilities to analyze and articulate the common visual style characteristics.

---

## Document Index

This PRD is organized into focused documents for easy reference:

| Document | Description |
|----------|-------------|
| **[01 - UX Journey](./imgPrompter11%20-%2001%20-%20UX%20Journey.md)** | Complete user flow with ASCII wireframes, step-by-step breakdown, mobile considerations, and error states |
| **[02 - Tech Stack](./imgPrompter11%20-%2002%20-%20Tech%20Stack.md)** | Architecture overview, recommended technologies, file structure, API specs, and deployment guide |
| **[03 - AI Prompts](./imgPrompter11%20-%2003%20-%20AI%20Prompts.md)** | Complete prompt reference including system prompt, user prompts for single/multiple images, and expected outputs |
| **[04 - Implementation Code](./imgPrompter11%20-%2004%20-%20Implementation%20Code.md)** | Production-ready code for services, API routes, utilities, and React components |

---

## Problem Statement

Creators and designers often see images with styles they love but struggle to articulate those styles into effective AI image generation prompts. The gap between "I know it when I see it" and "I can describe it precisely" limits creative expression and leads to frustrating trial-and-error with AI tools.

---

## Solution

Bloom in Pronto bridges this gap by:

1. **Accepting visual input** - Users upload the images that inspire them
2. **Leveraging AI vision** - Claude 4.5 analyzes the visual characteristics
3. **Producing actionable output** - A detailed, natural-language style prompt ready for any AI image generator

---

## Core User Flow

```
Upload Images (1-5) → Optional Guidance → AI Analysis → Style Prompt → Copy/Use
```

**Time to value:** < 30 seconds from upload to usable prompt

---

## Key Features (MVP)

### Must Have
- [ ] Multi-image upload (1-5 images)
- [ ] Drag-and-drop interface
- [ ] Optional user guidance input
- [ ] Claude 4.5 vision analysis
- [ ] Editable result
- [ ] Copy to clipboard
- [ ] Mobile-responsive design

### Nice to Have (V1.1)
- [ ] User accounts (save history)
- [ ] Style library
- [ ] Share/export options

### Future (V2+)
- [ ] Preview generation (test style with built-in generators)
- [ ] Style comparison
- [ ] API access
- [ ] Team features

---

## Target Users

1. **Digital Artists** - Want to maintain consistent styles across projects
2. **Content Creators** - Need brand-consistent visuals
3. **Designers** - Extracting styles from mood boards
4. **AI Art Enthusiasts** - Exploring and replicating styles
5. **Marketers** - Creating on-brand imagery quickly

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Extraction completion rate | > 90% |
| Time to first extraction | < 30 seconds |
| Copy-to-clipboard rate | > 70% |
| Return usage (7-day) | > 30% |
| Error rate | < 5% |

---

## Technical Requirements

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI:** Claude Sonnet 4.5 (via Vercel AI SDK)
- **Storage:** Vercel Blob for temporary image storage
- **Hosting:** Vercel

See [02 - Tech Stack](./Bloom%20in%20Pronto%20-%2002%20-%20Tech%20Stack.md) for complete details.

---

## Competitive Landscape

| Competitor | Approach | Weakness |
|------------|----------|----------|
| Manual prompting | Users write prompts themselves | Time-consuming, requires expertise |
| Prompt marketplaces | Buy pre-made prompts | Not customized to user's vision |
| Style transfer tools | Apply style to specific images | Not extractable as text prompts |

**imgPrompter11's advantage:** Extract your own custom style prompts from any inspiration images.

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| API rate limits | Implement queuing, show clear status |
| Poor quality images | Client-side validation, helpful error messages |
| Inconsistent AI output | Refined prompts, temperature control |
| High API costs | Monitor usage, consider caching similar images |

---

## Timeline Estimate

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| MVP Development | 2-3 weeks | Core flow, basic UI |
| Polish & Testing | 1 week | Error handling, mobile, edge cases |
| Soft Launch | 1 week | Limited release, gather feedback |
| Public Launch | - | Marketing, monitoring |

---

## Open Questions

1. **Authentication:** Should MVP require auth or be fully anonymous?
2. **Pricing:** Free with limits? Freemium? Pay-per-use?
3. **Image retention:** How long to keep uploaded images?
4. **Analytics:** What events to track beyond core metrics?

---

## Appendix

### Source Implementation

This PRD is based on the proven image style wizard from the content11-v2 project. The prompts and architecture have been tested and refined in production.

### Related Documents

- Original implementation: `src/components/image-wizard/`
- Style extraction service: `src/services/styleExtraction.ts`
- API routes: `app/api/style-extraction/`, `app/api/upload-reference-image/`
