import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from "next/headers";

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

    // Check if milestones already exist
    if (guide.milestoneImages?.sketch && guide.milestoneImages?.underpainting && guide.milestoneImages?.nearComplete) {
      console.log("✅ Milestone images already exist, returning cached");
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

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    // Milestone 1: Pencil sketch
    console.log("🎨 Generating milestone 1: Pencil sketch...");
    const sketchPrompt = `Create a simple pencil sketch showing ONLY the outlines and contours of this artwork.
Requirements:
- Show ONLY clean line work - no shading, no hatching, no tonal values
- Just the basic shapes and outlines
- Light pencil lines on white paper/canvas
- No painting, no color - pure line drawing only
- Clear structural lines showing the composition

This is for teaching beginners how to start a ${medium} painting by sketching first.`;

    const sketchResult = await model.generateContent([
      sketchPrompt,
      { inlineData: { data: base64, mimeType } }
    ]);

    let milestone1 = null;
    const sketchParts = sketchResult.response.candidates?.[0]?.content?.parts;
    if (sketchParts) {
      for (const part of sketchParts) {
        if (part.inlineData) {
          const base64Image = part.inlineData.data;
          const imgMimeType = part.inlineData.mimeType || "image/png";
          milestone1 = `data:${imgMimeType};base64,${base64Image}`;
          console.log("✅ Milestone 1 generated (pencil sketch)");
          break;
        }
      }
    }

    // Milestone 2: Very early wash stage
    console.log("🎨 Generating milestone 2: Light wash...");
    const underpaintingPrompt = `Create an image showing this ${medium} painting at a VERY EARLY stage - just the initial light wash.
Requirements:
- Pencil sketch clearly visible underneath the wash
- Only the most basic, diluted washes of color applied
- About 20-25% complete - barely any paint on canvas
- Very thin, transparent color covering maybe half the canvas
- Large areas of white canvas/paper still showing through
- No detail work at all - just the lightest color tones
- Focus on one or two main color areas being blocked in loosely
- Looks like the painter just started adding the first touches of color

This is the very beginning of the painting process - mostly sketch with hints of color.`;

    const underpaintingResult = await model.generateContent([
      underpaintingPrompt,
      { inlineData: { data: base64, mimeType } }
    ]);

    let milestone2 = null;
    const underpaintingParts = underpaintingResult.response.candidates?.[0]?.content?.parts;
    if (underpaintingParts) {
      for (const part of underpaintingParts) {
        if (part.inlineData) {
          const base64Image = part.inlineData.data;
          const imgMimeType = part.inlineData.mimeType || "image/png";
          milestone2 = `data:${imgMimeType};base64,${base64Image}`;
          console.log("✅ Milestone 2 generated (light wash)");
          break;
        }
      }
    }

    // Milestone 3: Early-mid stage painting
    console.log("🎨 Generating milestone 3: Early-mid stage...");
    const finalPrompt = `Create an image showing this ${medium} painting at an EARLY-MID STAGE - only about 35-40% complete. It must look OBVIOUSLY UNFINISHED.

CRITICAL - This painting should look INCOMPLETE:
- Background has rough color blocking but is NOT refined - visible brush strokes and uneven coverage
- Only 1-2 objects have started to take shape, others are just rough color shapes
- Large areas still have thin, patchy paint coverage
- MANY areas show the white canvas/paper peeking through
- Colors are muted and flat - no depth, no shadows properly rendered yet
- Edges are soft and undefined - nothing has crisp outlines
- NO details whatsoever - no textures, no highlights, no reflections
- Looks like the painter stopped halfway through blocking in colors
- Should be CLEARLY different from the finished reference - much rougher and less complete

DO NOT make it look close to finished. This should look like someone put down their brush after 30-40 minutes of a multi-hour painting session.`;

    const finalResult = await model.generateContent([
      finalPrompt,
      { inlineData: { data: base64, mimeType } }
    ]);

    let milestone3 = null;
    const finalParts = finalResult.response.candidates?.[0]?.content?.parts;
    if (finalParts) {
      for (const part of finalParts) {
        if (part.inlineData) {
          const base64Image = part.inlineData.data;
          const imgMimeType = part.inlineData.mimeType || "image/png";
          milestone3 = `data:${imgMimeType};base64,${base64Image}`;
          console.log("✅ Milestone 3 generated (early-mid stage)");
          break;
        }
      }
    }

    // Save milestone images to database
    const milestoneImages = {
      sketch: milestone1,
      underpainting: milestone2,
      nearComplete: milestone3
    };

    guide.milestoneImages = milestoneImages;

    await prisma.coachingSession.update({
      where: { sessionId },
      data: { paintingGuide: JSON.stringify(guide) }
    });

    console.log("✅ Milestone images saved to database");

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
