# Building a Full-Stack AI App in 70 Minutes with an AI Coding Agent

*How I used Droid (Factory AI) to build imgPrompter11 from Linear tickets to deployed app*

---

## What We Built

**imgPrompter11** is an AI-powered tool that extracts style prompts from images. Upload reference images, and Claude 4.5 Sonnet analyzes their visual characteristics to generate prompts you can use with Midjourney, DALL-E, or Stable Diffusion.

The twist? It uses a **BYOK (Bring Your Own Key)** model - users provide their own Replicate API key, so I only pay for hosting.

**Live at:** [imgprompter11.bloomindesign.com](https://imgprompter11.bloomindesign.com)

---

## The Stats That Blew My Mind

| Metric | Value |
|--------|-------|
| Total Linear tickets | **27** (25 planned + 2 bugs) |
| Lines of code added | **~2,270** |
| Files created/modified | **17** |
| Git commits | **3** |
| Total build time | **~70 minutes** |
| Manual code written by me | **0 lines** |

---

## The Prompts I Used

Here are the actual prompts I gave the AI agent during this build session:

### Starting the Build
```
Okay, let's start the project then. Let's start building. Where do we start?
```

### Keeping Linear Updated
```
Could you update the linear board as you do this?
```

### Completing All Work
```
Let's finish all the tickets please.
```

### Setting Up Infrastructure
```
Also, I think we need to set up a GitHub repo to commit this to and connect 
that to Vercel. Can you create the GitHub repo for me and name it the same 
as the project?
```

### Handling Bugs (Real-time)
When I hit a Vercel Blob error, I simply pasted the error:
```
Vercel Blob: No token found. Either configure the `BLOB_READ_WRITE_TOKEN` 
environment variable...
```

The agent created a Linear ticket (VOL-84), explained the fix, and I provided my token.

### Feature Request Mid-Session
```
This was the output prompt that I was given, and it actually worked very well. 
The only thing about the output prompt is that it doesn't seem to have any 
instructions on how to use it...
```

The agent spec'd the feature, I approved it, and VOL-85 was implemented and shipped.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.1.1 (Turbopack) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS 4.x |
| Runtime | Bun |
| AI Model | Claude 4.5 Sonnet via Replicate |
| Storage | Vercel Blob |
| Hosting | Vercel |
| Icons | Lucide React |
| Notifications | Sonner |
| Project Management | Linear |
| Version Control | GitHub |

---

## The 27 Linear Tickets

### Setup (5 tickets)
- VOL-59: Initialize project with dependencies
- VOL-60: Configure Tailwind CSS 4.x with design system
- VOL-61: Install and configure shadcn/ui components
- VOL-72: Create root layout with providers
- VOL-81: Create lib/utils.ts with helper functions

### Backend (5 tickets)
- VOL-62: Create image upload API endpoint
- VOL-63: Create style extraction API endpoint
- VOL-64: Create uploadImage client utility
- VOL-65: Implement Claude style extraction service
- VOL-66: Create styleExtractionClient utility

### UI Components (6 tickets)
- VOL-67: Create UploadStep component
- VOL-68: Create StyleExtractorWizard container
- VOL-69: Create AnalyzingStep component
- VOL-71: Create ResultStep component
- VOL-82: Implement drag-and-drop file upload
- VOL-83: Create API Key input and management

### Pages (1 ticket)
- VOL-70: Create landing page with hero section

### Quality & Polish (8 tickets)
- VOL-73: Implement error handling and toast notifications
- VOL-74: Implement mobile responsive design
- VOL-75: End-to-end testing of extraction flow
- VOL-76: Input validation and sanitization
- VOL-78: Optimize image upload and processing
- VOL-79: Add loading states and micro-interactions
- VOL-80: Ensure accessibility compliance
- VOL-77: Configure Vercel deployment

### Bugs & Features (2 tickets - created during build)
- VOL-84: Vercel Blob token not configured (bug)
- VOL-85: Add usage instructions to style prompt output (feature)

---

## Key Takeaways (Mind-Blowing Moments)

### 1. From Tickets to Deployed App in 70 Minutes
The agent read all 25 Linear tickets, understood the requirements, and systematically implemented each one while updating their status in real-time. I watched my Linear board go from "Backlog" to "Done" without touching the code.

### 2. BYOK Architecture Was Decided Mid-Project
The original tickets assumed I'd use my own Anthropic API key. The agent researched and suggested switching to Replicate's hosted Claude 4.5 Sonnet with a "Bring Your Own Key" model. This means:
- Users pay for their own AI usage
- I only pay ~$0.15/GB for Vercel Blob storage
- No API key management on my server

### 3. Real-Time Bug Fixing
When I hit the Vercel Blob token error, I literally just pasted the error message. The agent:
1. Created a Linear ticket (VOL-84)
2. Explained the root cause
3. Told me exactly what to do
4. Marked it done when I provided the token

### 4. Feature Requests During the Session
I noticed the output needed usage instructions. Instead of filing a ticket manually:
1. I described what was missing
2. Agent created VOL-85 with full spec
3. I said "yes please"
4. Feature was implemented and pushed in under 2 minutes

### 5. Full Accessibility Out of the Box
The agent added ARIA labels, keyboard navigation, focus states, and screen reader support without me asking. It just... did it because VOL-80 was in the tickets.

### 6. Security Wasn't an Afterthought
Input sanitization, URL validation, API key format checking - all implemented as part of VOL-76. The agent even restricted image URLs to only allow Vercel Blob storage domains.

---

## The BYOK Architecture

```
User Browser                    Server                      Replicate
     │                            │                            │
     │  1. Enter API key          │                            │
     │  (stored in localStorage)  │                            │
     │                            │                            │
     │  2. Upload images ─────────▶  Store in Vercel Blob     │
     │                            │                            │
     │  3. Extract style ─────────▶  Pass user's API key ─────▶
     │     (includes API key)     │  (never stored)            │
     │                            │                            │
     │  ◀───────────────────────── Style prompt ◀──────────────
     │                            │                            │
```

**Why this matters:**
- Zero API costs for me (users pay Replicate directly)
- No API key storage liability
- Users can see their own usage in Replicate dashboard
- If a key is compromised, only that user is affected

---

## Files Created

```
lib/utils.ts
app/globals.css
app/layout.tsx
app/page.tsx
app/api/upload-image/route.ts
app/api/style-extraction/route.ts
services/styleExtraction.ts
utils/uploadImage.ts
utils/styleExtractionClient.ts
components/ApiKeyInput.tsx
components/UploadStep.tsx
components/AnalyzingStep.tsx
components/ResultStep.tsx
components/StyleExtractorWizard.tsx
vercel.json
.env.example
```

---

## Conclusion

This wasn't a demo or a toy project. This is a production application with:
- Real error handling
- Mobile responsive design
- Accessibility compliance
- Security best practices
- CI/CD via Vercel

All built in 70 minutes by describing what I wanted and letting an AI agent do the work.

The future of software development isn't about writing less code. It's about **describing intent** and letting AI handle the implementation details.

---

*Built with [Factory AI](https://factory.ai) (Droid) + [Linear](https://linear.app) + [Vercel](https://vercel.com)*

*Repository: [github.com/simonbloom/imgprompter11](https://github.com/simonbloom/imgprompter11)*
