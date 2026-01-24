import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from "next/headers";

// System prompt for all milestone generations
const SYSTEM_PROMPT = `You are generating a realistic in-progress painting, not a finished artwork.
The goal is to accurately simulate how a real artist would progress toward the final reference image over time, preserving incompleteness, imbalance, and roughness at each stage.

You MUST avoid visual cues that make the image feel finished, polished, or cohesive too early.

CRITICAL RULE - CUMULATIVE PROGRESS (MOST IMPORTANT):
- Each stage MUST preserve ALL work from previous stages
- If an area was painted in a previous stage, it MUST remain painted (not revert to blank/white/sketch)
- Progress is ADDITIVE - you are building upon previous work, not starting fresh
- If eyes were painted at 30%, they must still be painted at 50%, 75%, and 90%
- If skin tones were established, they must remain visible in subsequent stages
- NEVER show regression - a painted area should NEVER become unpainted

GLOBAL RULES (apply to ALL stages):

ABSOLUTE PROHIBITIONS (very important):
- Do NOT globally match the reference image at any stage below 90%
- Do NOT balance contrast across the entire image
- Do NOT refine all objects equally
- Do NOT resolve edges everywhere
- Do NOT add final highlights, crisp details, or visual harmony early
- Do NOT "cheat" by making things subtly finished
- Do NOT lose or erase progress from earlier stages
- Do NOT show areas reverting to blank canvas if they were previously worked on

REQUIRED CHARACTERISTICS OF ALL IN-PROGRESS WORK:
- Uneven development (some areas far behind others)
- Visible construction marks (sketch lines, blocky strokes, underpainting)
- Incomplete forms
- Awkward transitions
- Areas that look ignored or unfinished on purpose
- Clear preservation of all previous painting work`;

const HARD_STOP = `\n\nIMPORTANT REMINDERS:
1. If the image looks finished, polished, or gallery-ready, it is WRONG. Err on the side of looking unfinished.
2. NEVER show regression — if something was painted in a previous stage, it MUST remain painted. A painted eye cannot become white/blank. Painted skin cannot disappear.
3. Progress is CUMULATIVE and ADDITIVE only.`;

// Milestone definitions with progress percentages
// Stages: 10%, 20%, 30%, 50%, 75%, 90%
const MILESTONES = [
  {
    key: "stage10",
    percent: 10,
    label: "10%",
    prompt: (medium: string) => `${SYSTEM_PROMPT}

Reference image: provided inline
Medium: ${medium}
Stage: 10% — Composition Sketch (FIRST STAGE)

Generate an image that looks 10% complete. This is the starting point.

Requirements:
- Medium: pencil only (no paint, no color)
- White or cream canvas dominates at least 90%
- Loose, exploratory lines
- Incorrect proportions allowed
- No shading, no cross-hatching
- Objects indicated with minimal contour
- Feels like 2–3 minutes of work

Explicitly missing:
- Color
- Depth
- Detail
- Any sense of finish

This should look like planning, not painting.${HARD_STOP}`
  },
  {
    key: "stage20",
    percent: 20,
    label: "20%",
    prompt: (medium: string) => `${SYSTEM_PROMPT}

Reference image: provided inline
Medium: ${medium}
Stage: 20% — First Wash / Underpainting (BUILDING ON 10%)

Generate an image that looks 20% complete, building upon the 10% sketch stage.

PRESERVE FROM PREVIOUS STAGE (10%):
- The pencil sketch lines must still be visible underneath the wash
- The composition established in the sketch remains

NEW ADDITIONS for this stage:
- Very thin, translucent washes or stains of color OVER the sketch
- Only broad color placement — no forms
- At least 70% of canvas still showing sketch or blank
- Colors inaccurate and tentative
- Uneven coverage, patchy application

Explicitly missing:
- Defined objects
- Shadows
- Highlights
- Any readable realism

This should feel hesitant and exploratory, with sketch visible beneath thin color washes.${HARD_STOP}`
  },
  {
    key: "stage30",
    percent: 30,
    label: "30%",
    prompt: (medium: string) => `${SYSTEM_PROMPT}

Reference image: provided inline
Medium: ${medium}
Stage: 30% — One Area Developing (BUILDING ON 20%)

Generate an image that looks 30% complete, building upon the 20% underpainting stage.

PRESERVE FROM PREVIOUS STAGES:
- All color washes from stage 20% must remain visible
- Areas that received paint must still show that paint
- The underlying sketch structure remains in unpainted areas

NEW ADDITIONS for this stage:
- ONE focal area (e.g., face, eyes, central object) is being developed with more opaque paint
- This focal area shows actual form and color, not just wash
- Everything else remains at the 20% level (sketchy or lightly washed)

CRITICAL: If the focal area includes eyes/face, the paint applied here MUST be retained in all future stages.

Explicitly missing:
- Global coherence
- Finished edges
- Lighting logic
- Detail outside the chosen focal area

This should feel lopsided — one area clearly more developed than the rest.${HARD_STOP}`
  },
  {
    key: "stage50",
    percent: 50,
    label: "50%",
    prompt: (medium: string) => `${SYSTEM_PROMPT}

Reference image: provided inline
Medium: ${medium}
Stage: 50% — Halfway, Structurally Incomplete (BUILDING ON 30%)

Generate an image that looks EXACTLY halfway done, building upon the 30% stage.

PRESERVE FROM PREVIOUS STAGES (CRITICAL):
- The focal area developed at 30% must remain painted and visible
- If eyes were painted, they MUST still be painted (not white/blank)
- If skin was colored, it MUST still be colored
- All previous paint work is retained and potentially refined
- DO NOT regress any area to a less-painted state

NEW ADDITIONS for this stage:
- Expand painted areas beyond the single focal point
- About half the canvas now has actual paint (not just wash)
- Early shadows appearing in the developed areas
- More accurate colors in worked areas

Still incomplete:
- Other half of canvas still underdeveloped (wash/sketch level)
- No highlights anywhere
- Blurry edges everywhere
- Flat colors in newly painted areas

If you squint, this should NOT read as finished. But previously painted areas (like eyes, face) must remain painted.${HARD_STOP}`
  },
  {
    key: "stage75",
    percent: 75,
    label: "75%",
    prompt: (medium: string) => `${SYSTEM_PROMPT}

Reference image: provided inline
Medium: ${medium}
Stage: 75% — Advanced but Clearly Unfinished (BUILDING ON 50%)

Generate an image that looks 75% complete, building upon the 50% stage.

PRESERVE FROM PREVIOUS STAGES (CRITICAL):
- ALL painted areas from 50% must remain painted
- Eyes, face, skin, hair — if painted before, they stay painted
- Colors and forms established earlier are retained and built upon
- NO area should look less complete than it did at 50%
- Progress is ONLY additive — we are refining and expanding, never erasing

NEW ADDITIONS for this stage:
- Most of the canvas now has paint coverage
- Shadows present and more consistent across the painting
- Forms are readable throughout most of the image
- Colors becoming more accurate

Still incomplete:
- Some areas still noticeably behind the focal areas
- Edges uneven: some sharp, most soft
- Color mostly correct but still somewhat muted
- No bright highlights yet
- No deepest shadows yet
- No fine textures

This should look like "almost there, but not resolved." All previously painted areas remain intact.${HARD_STOP}`
  },
  {
    key: "stage90",
    percent: 90,
    label: "90%",
    prompt: (medium: string) => `${SYSTEM_PROMPT}

Reference image: provided inline
Medium: ${medium}
Stage: 90% — Near Finish, Still Missing Final Pass (BUILDING ON 75%)

Generate an image that looks 90% complete, building upon the 75% stage.

PRESERVE FROM PREVIOUS STAGES (CRITICAL):
- ALL painted areas from 75% must remain intact
- Every element that was developed stays developed
- The entire painting has been worked on — no blank areas
- All facial features, skin tones, hair, clothing etc. that were painted remain painted

NEW ADDITIONS for this stage:
- Overall image closely resembles reference
- Highlights now present (but still restrained)
- Shadows deepened
- Colors at near-final vibrancy
- Most edges resolved

Still missing (final 10%):
- Final polish and refinement
- Micro-details (eyelashes, individual hairs, texture details)
- Perfect contrast balance
- That last "snap" of photorealism

An artist would still say: "I need one more session." But nothing looks unfinished or regressed from the 75% stage.${HARD_STOP}`
  }
];

// Helper function to extract image from Gemini response
function extractImageFromResponse(result: any): string | null {
  const parts = result.response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData) {
        const base64Image = part.inlineData.data;
        const imgMimeType = part.inlineData.mimeType || "image/png";
        return `data:${imgMimeType};base64,${base64Image}`;
      }
    }
  }
  return null;
}

// Generate milestone images on-demand
export async function POST(req: NextRequest) {
  try {
    // Check for Google AI API key first
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error("❌ GOOGLE_AI_API_KEY is not configured");
      return NextResponse.json(
        { error: "Visual progress guide is temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

    // Check authentication
    const authSession = await auth();
    if (!authSession?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    // Fetch the session and verify ownership
    const session = await prisma.coachingSession.findUnique({
      where: { sessionId },
      select: {
        id: true,
        userId: true,
        paintingGuide: true,
        imageUrl: true,
        imageMediaType: true,
        medium: true
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Verify user owns this session
    if (session.userId !== authSession.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Safe JSON parsing
    let guide;
    try {
      guide = JSON.parse(session.paintingGuide);
    } catch {
      return NextResponse.json({ error: "Invalid session data" }, { status: 500 });
    }

    // Check if all 6 milestones already exist (new format: 10%, 20%, 30%, 50%, 75%, 90%)
    if (guide.milestoneImages?.stage10 && guide.milestoneImages?.stage20 &&
        guide.milestoneImages?.stage30 && guide.milestoneImages?.stage50 &&
        guide.milestoneImages?.stage75 && guide.milestoneImages?.stage90) {
      console.log("✅ All 6 milestone images already exist, returning cached");
      return NextResponse.json({
        milestoneImages: guide.milestoneImages,
        cached: true
      });
    }

    // Extract base64 from the stored image URL
    const imageUrl = session.imageUrl;
    let mimeType: string;
    let base64: string;

    if (imageUrl.startsWith('data:')) {
      // Parse the data URL to get base64 and mime type
      const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
      }
      mimeType = matches[1];
      base64 = matches[2];
    } else if (imageUrl.startsWith('/')) {
      // Handle public file path (e.g., "/jenston.jpeg")
      // In production (Vercel), we need to fetch via HTTP since fs is not available
      const headersList = await headers();
      const host = headersList.get('host') || 'localhost:3000';
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const fullUrl = `${protocol}://${host}${imageUrl}`;

      console.log(`Fetching image from: ${fullUrl}`);

      const imageResponse = await fetch(fullUrl);
      if (!imageResponse.ok) {
        console.error(`Failed to fetch image: ${imageResponse.status}`);
        return NextResponse.json({ error: `Image not found: ${imageUrl}` }, { status: 404 });
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      base64 = Buffer.from(imageBuffer).toString("base64");

      // Determine mime type from content-type header or extension
      const contentType = imageResponse.headers.get('content-type');
      if (contentType) {
        mimeType = contentType;
      } else {
        // Fallback to extension-based detection
        const ext = imageUrl.split('.').pop()?.toLowerCase() || '';
        if (ext === "png") mimeType = "image/png";
        else if (ext === "webp") mimeType = "image/webp";
        else if (ext === "gif") mimeType = "image/gif";
        else mimeType = "image/jpeg";
      }
    } else {
      return NextResponse.json({ error: "No valid image data found" }, { status: 400 });
    }

    const medium = session.medium;

    console.log(`📸 Starting on-demand milestone generation for session ${sessionId}`);
    console.log(`🎨 Generating 6 milestone images at 10%, 20%, 30%, 50%, 75%, 90%`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    // Generate all 6 milestones
    const milestoneImages: Record<string, string | null> = {};

    for (const milestone of MILESTONES) {
      console.log(`🎨 Generating milestone: ${milestone.label} (${milestone.key})...`);

      try {
        const result = await model.generateContent([
          milestone.prompt(medium),
          { inlineData: { data: base64, mimeType } }
        ]);

        const image = extractImageFromResponse(result);
        milestoneImages[milestone.key] = image;

        if (image) {
          console.log(`✅ Milestone ${milestone.label} generated successfully`);
        } else {
          console.warn(`⚠️ Milestone ${milestone.label} generated but no image in response`);
        }
      } catch (error) {
        console.error(`❌ Failed to generate milestone ${milestone.label}:`, error);
        milestoneImages[milestone.key] = null;
      }
    }

    // Save milestone images to database
    guide.milestoneImages = milestoneImages;

    await prisma.coachingSession.update({
      where: { sessionId },
      data: { paintingGuide: JSON.stringify(guide) }
    });

    console.log("✅ All milestone images saved to database");

    return NextResponse.json({
      milestoneImages,
      cached: false
    });

  } catch (error: unknown) {
    console.error("❌ Error generating milestone images:", error);
    return NextResponse.json(
      { error: "Failed to generate milestone images" },
      { status: 500 }
    );
  }
}
