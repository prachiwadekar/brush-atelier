import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from "next/headers";

// System prompt for all milestone generations - emphasizes SAME PAINTING evolving
const SYSTEM_PROMPT = `You are generating ONE CONTINUOUS PAINTING at different stages of completion.

MOST IMPORTANT RULE - THIS IS THE SAME PAINTING EVOLVING:
Think of this as photographing a single canvas at different points in time. The painting on the canvas doesn't change identity — it just gets more complete. If you painted the left eye blue at 20%, that same blue left eye must be there at 40%, 50%, and 75% — just more refined.

RULE #1 - EXACT REFERENCE MATCH:
- Study the reference image CAREFULLY before generating anything
- The subject must be IDENTICAL to the reference — same person, same pose, same composition
- If it's a portrait of a girl with brown hair and green eyes, every stage must show THAT SAME girl
- Match: face shape, eye shape, nose shape, lip shape, hair color, skin tone, expression
- DO NOT generate a generic or different person at any stage

RULE #2 - STRICT COMPOSITION FIDELITY:
- Match the EXACT framing and crop of the reference
- If it's a close-up headshot, DO NOT add shoulders or body
- If background is plain, keep it plain — no invented scenery
- The boundaries of your image must match the reference boundaries

RULE #3 - CUMULATIVE PROGRESS (CRITICAL):
- Each stage builds DIRECTLY on the previous stage
- Paint that was applied in an earlier stage MUST remain visible
- Example: If you painted the hair brown at 40%, at 50% the hair is STILL brown — you don't repaint it or lose it
- Example: If you painted the eyes at 20%, at 40% those same eyes are still there, just more refined
- Progress is ONLY additive — areas get MORE complete, never less
- NEVER show an area reverting to blank canvas or losing detail

WHAT MAKES EACH STAGE LOOK INCOMPLETE:
- Uneven development: some areas far ahead of others
- Visible brushstrokes, sketch lines showing through
- Soft/undefined edges in less-developed areas
- Muted colors that haven't reached full saturation
- Missing final highlights and deepest shadows`;

const HARD_STOP = `

FINAL CHECKLIST:
1. Does this look like the SAME painting as the previous stage, just more complete? If no, REDO.
2. Is the subject IDENTICAL to the reference image (same person, same features)? If no, REDO.
3. Are all previously painted areas still painted? If any area regressed, REDO.
4. Does the composition match the reference exactly (same crop, same framing)? If no, REDO.
5. Does it look appropriately incomplete for this percentage? If too finished, REDO.`;

// Milestone definitions with progress percentages
// Stages: 10%, 20%, 40%, 50%, 75%
const MILESTONES = [
  {
    key: "stage10",
    percent: 10,
    label: "10%",
    prompt: (medium: string) => `${SYSTEM_PROMPT}

Reference image: provided inline
Medium: ${medium}
Stage: 10% — Initial Sketch

You are creating the FIRST stage of this painting — a pencil sketch on canvas.

WHAT TO GENERATE:
Create a light pencil sketch that maps out the composition of the reference image.

CRITICAL - SKETCH THE ACTUAL REFERENCE:
- This sketch must be of THE SPECIFIC subject in the reference
- If the reference is a portrait, sketch THAT person's unique face shape and proportions
- The placement of features (eyes, nose, mouth, hairline) must match where they appear in the reference
- This is the foundation — all future stages will build on exactly these lines

VISUAL REQUIREMENTS:
- Pencil/graphite lines only — NO color, NO paint
- White or cream canvas visible (90%+ of the surface)
- Light, loose sketch lines indicating major shapes and proportions
- Key features positioned correctly relative to the reference
- No shading, no detail — just placement and proportion

THIS STAGE IS MISSING:
- Any color
- Any paint
- Shading or values
- Fine details
- Depth

Think: "An artist just spent 3 minutes sketching out where everything goes before painting."${HARD_STOP}`
  },
  {
    key: "stage20",
    percent: 20,
    label: "20%",
    prompt: (medium: string) => `${SYSTEM_PROMPT}

Reference image: provided inline
Medium: ${medium}
Stage: 20% — Very Early Color (BUILDING ON THE 10% SKETCH)

You are continuing THE SAME PAINTING from the 10% stage. The sketch is still there — now we're adding the VERY FIRST hints of color.

CRITICAL - THIS IS BARELY STARTED:
- The canvas should still be MOSTLY WHITE/UNPAINTED (60-70% bare canvas)
- Only a few small areas have received any color at all
- This looks like the artist just started adding color and stopped after 5 minutes

WHAT MUST BE PRESERVED FROM 10%:
- The pencil sketch lines are still clearly visible
- The composition and proportions established in the sketch remain unchanged
- This is the SAME canvas, the SAME subject

WHAT TO ADD AT THIS STAGE:
- VERY thin, watery washes in just 1-2 areas (maybe just the face area, or just the hair)
- Colors are muted and diluted — not saturated
- Most of the canvas is still white/cream with visible sketch lines
- Paint coverage: only 20-30% of canvas has any color at all
- Large areas remain completely untouched (just sketch)

VISUAL CHARACTERISTICS:
- Dominant white/cream canvas with sketch showing
- A few patches of pale, watery color
- Extremely patchy — big gaps between colored areas
- No forms, no edges, no detail anywhere
- Looks like someone put down their brush after just starting

THIS STAGE IS MISSING:
- Most of the color (80% of final colors not yet applied)
- Any form or volume
- Any shadows or highlights
- Any defined edges
- Any detail whatsoever
- Color in most areas of the canvas

Think: "The artist literally just started. A few brushstrokes of pale color, mostly bare canvas."${HARD_STOP}`
  },
  {
    key: "stage40",
    percent: 40,
    label: "40%",
    prompt: (medium: string) => `${SYSTEM_PROMPT}

Reference image: provided inline
Medium: ${medium}
Stage: 40% — Building the Foundation (BUILDING ON THE 20% START)

You are continuing THE SAME PAINTING. The early color from 20% is still there — now we're adding more coverage but it's still clearly incomplete.

CRITICAL - SIGNIFICANT UNPAINTED AREAS REMAIN:
- About 40-50% of the canvas still shows bare canvas or just sketch
- The painting is noticeably patchy and uneven
- Some areas have color blocking, others are still white/sketch only

WHAT MUST BE PRESERVED FROM PREVIOUS STAGES:
- The areas that had color at 20% still have that same color (now slightly more developed)
- The underlying sketch is still visible in unpainted areas
- This is the SAME painting evolving — not a new painting

WHAT TO ADD AT THIS STAGE:
- More areas now have color blocked in (but still flat, approximate colors)
- The focal area (usually face) is starting to get attention — basic forms emerging
- Colors are still muted and not fully saturated
- Background and edges of the subject may still be largely unpainted

CRITICAL - REFERENCE MATCHING:
- The subject must be recognizable as the same person/thing from the reference
- Even though it's rough, the proportions and placement match the reference

VISUAL CHARACTERISTICS:
- 40-50% of canvas still unpainted (white/sketch visible)
- Colors are blocked in but flat — no refined modeling yet
- Focal area has basic form but is NOT refined
- Large portions (background, edges, secondary areas) still bare or just sketch
- Visible brushstrokes, rough edges everywhere
- No highlights, minimal shadows

THIS STAGE IS MISSING:
- Paint on 40-50% of the canvas
- Refined forms anywhere
- Accurate colors (still approximations)
- Any highlights
- Consistent shadows
- Detail of any kind
- Finished edges anywhere

Think: "The artist has been working for a bit. Main colors blocked in patches, but half the canvas is still bare."${HARD_STOP}`
  },
  {
    key: "stage50",
    percent: 50,
    label: "50%",
    prompt: (medium: string) => `${SYSTEM_PROMPT}

Reference image: provided inline
Medium: ${medium}
Stage: 50% — Halfway There (BUILDING ON THE 40% FOUNDATION)

You are continuing THE SAME PAINTING. The blocked colors from 40% are still there — now we're filling in more and developing the focal area.

CRITICAL - STILL CLEARLY INCOMPLETE:
- About 25-35% of canvas may still show bare canvas or very rough areas
- The painting is halfway done — noticeably more complete than 40% but clearly not finished
- Focal area is more developed, but secondary areas are still rough

WHAT MUST BE PRESERVED FROM PREVIOUS STAGES:
- All colored areas from 40% are still there with the same colors
- The subject identity remains consistent
- This is the SAME painting — building on what was there

WHAT TO ADD AT THIS STAGE:
- Most major areas now have color (but colors still not fully accurate)
- The focal area (face/eyes) now has actual form and modeling
- Secondary areas (hair, background) have color but remain flat/rough
- Some areas may still be bare canvas or very sketchy
- Early shadows appearing in the focal area

CRITICAL - SAME SUBJECT, MORE COMPLETE:
- This must still be the EXACT SAME person/subject as the reference
- The face is now recognizable as THAT specific person
- Hair color, eye color, skin tone — consistent with reference

VISUAL CHARACTERISTICS:
- 65-75% of canvas has color (25-35% still bare/rough)
- Focal area: forms emerging, basic shadows, ~50-60% complete
- Secondary areas: color blocked but flat, ~30-40% complete
- Some edges still undefined, some areas still patchy
- No highlights anywhere yet
- Colors still somewhat muted/approximate

THIS STAGE IS MISSING:
- Full coverage (significant bare/rough areas remain)
- Highlights (too early)
- Refined details
- Accurate final colors
- Consistent edges
- Development in secondary areas
- Any sense of "finish"

Think: "Halfway done. The face is coming together, main colors are in, but lots still rough or bare."${HARD_STOP}`
  },
  {
    key: "stage75",
    percent: 75,
    label: "75%",
    prompt: (medium: string) => `${SYSTEM_PROMPT}

Reference image: provided inline
Medium: ${medium}
Stage: 75% — Colors Filled In But Unfinished (BUILDING ON THE 50% PROGRESS)

You are continuing THE SAME PAINTING. Everything from 50% is preserved — now we're filling in all the colors but the painting should still look CLEARLY UNFINISHED.

CRITICAL - COLORS COMPLETE BUT PAINTING IS NOT:
- NOW the entire canvas has color (no more bare canvas)
- But it should NOT look like the finished reference — it's still rough and unrefined
- This is 75% done, NOT 95% done — there's obvious work remaining

WHAT MUST BE PRESERVED FROM PREVIOUS STAGES:
- EVERYTHING painted at 50% is still here — same colors, same forms
- The subject identity is unchanged
- This is the SAME painting progressing

WHAT TO ADD AT THIS STAGE:
- All areas of the canvas now have paint coverage (no more white/bare canvas)
- Colors are more accurate but still not at final vibrancy
- Forms are readable throughout but edges are still soft/rough
- Basic shadows present but not deep enough
- NO bright highlights yet — the painting looks "flat" without that pop

CRITICAL - OBVIOUSLY UNFINISHED:
- Must NOT look like the reference image — clearly still needs work
- Colors are duller/more muted than the reference
- Edges are softer/rougher than the reference
- Missing the "life" and "pop" that final highlights bring
- Details are suggested but not refined (no individual hairs, no skin texture)
- Overall looks like it needs "one more session" to finish

VISUAL CHARACTERISTICS:
- 100% color coverage (no bare canvas)
- Forms readable but not crisp
- Colors at ~70-80% of final accuracy/vibrancy
- Soft, undefined edges throughout
- Basic shadows but no deep darks
- NO highlights (this is what makes it look unfinished)
- Rough brushwork still visible
- Details are vague/suggested, not refined

THIS STAGE IS MISSING (the final 25%):
- ALL highlights (the "pop" and "life")
- Deep, rich shadows
- Final color vibrancy/saturation
- Crisp, refined edges
- Fine details (eyelashes, hair strands, skin texture)
- The overall "finished" look
- Contrast and punch

Think: "All the colors are in place, but it looks flat and dull. No sparkle in the eyes, no shine on the hair. Needs highlights and refinement."${HARD_STOP}`
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

    // Check if all 5 milestones already exist (format: 10%, 20%, 40%, 50%, 75%)
    if (guide.milestoneImages?.stage10 && guide.milestoneImages?.stage20 &&
        guide.milestoneImages?.stage40 && guide.milestoneImages?.stage50 &&
        guide.milestoneImages?.stage75) {
      console.log("✅ All 5 milestone images already exist, returning cached");
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
    console.log(`🎨 Generating 5 milestone images at 10%, 20%, 40%, 50%, 75%`);

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
