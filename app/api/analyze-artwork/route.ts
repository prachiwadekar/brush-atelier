import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log("=== API ROUTE CALLED ===");
  try {
    const session = await auth();
    console.log("Session check:", session?.user ? "Authenticated" : "Not authenticated");

    if (!session?.user) {
      console.log("ERROR: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Parsing form data...");
    const formData = await request.formData();
    const imageUrl = formData.get("imageUrl") as string | null;
    const file = formData.get("file") as File | null;
    console.log("imageUrl:", imageUrl);
    console.log("file:", file ? `${file.name} (${file.size} bytes)` : "null");

    // Helper function to normalize media type
    const normalizeMediaType = (type: string): "image/jpeg" | "image/png" | "image/gif" | "image/webp" => {
      const lowerType = type.toLowerCase();
      if (lowerType.includes("jpeg") || lowerType.includes("jpg")) return "image/jpeg";
      if (lowerType.includes("png")) return "image/png";
      if (lowerType.includes("gif")) return "image/gif";
      if (lowerType.includes("webp")) return "image/webp";
      // Default to jpeg if unknown
      return "image/jpeg";
    };

    let imageContent: any;

    // Max file size: 5MB (Claude's recommended limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    if (file) {
      console.log("Processing uploaded file...");
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        console.log("ERROR: File too large");
        return NextResponse.json(
          { error: "Image file is too large. Please use an image smaller than 5MB." },
          { status: 400 }
        );
      }

      console.log("Converting file to base64...");
      // Convert file to base64 for Claude API
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      const mimeType = normalizeMediaType(file.type);
      console.log("File converted. MIME type:", mimeType);

      imageContent = {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mimeType,
          data: base64,
        },
      };
    } else if (imageUrl) {
      console.log("Processing image URL...");

      // For URL, we need to fetch and convert to base64
      const imageResponse = await fetch(imageUrl);

      if (!imageResponse.ok) {
        return NextResponse.json(
          { error: "Failed to fetch image from URL. Please check the URL and try again." },
          { status: 400 }
        );
      }

      const imageBuffer = await imageResponse.arrayBuffer();

      // Check size
      if (imageBuffer.byteLength > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Image is too large. Please use an image smaller than 5MB." },
          { status: 400 }
        );
      }

      const base64 = Buffer.from(imageBuffer).toString("base64");
      const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
      const mimeType = normalizeMediaType(contentType);

      imageContent = {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mimeType,
          data: base64,
        },
      };
    } else {
      return NextResponse.json(
        { error: "Please provide an image URL or upload an image" },
        { status: 400 }
      );
    }

    // Call Claude with vision capabilities
    console.log("=== CALLING CLAUDE API ===");
    console.log("Model: claude-sonnet-4-20250514");
    const apiStartTime = Date.now();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert art instructor and coach. Analyze this artwork in detail and provide comprehensive guidance on how to recreate it.

Your analysis should include:

1. **Overview**: Brief description of the artwork (subject, style, medium if identifiable)

2. **Composition Analysis**:
   - Layout and arrangement of elements
   - Use of space and balance
   - Focal points and visual flow

3. **Technical Elements**:
   - Color palette (specific colors used)
   - Lighting and shadows
   - Perspective and proportions
   - Texture and details
   - Brush strokes or techniques (if visible)

4. **Step-by-Step Recreation Instructions**:
   Provide detailed, numbered steps an artist should follow to recreate this artwork, including:
   - Materials needed
   - Initial sketch/foundation steps
   - Layer-by-layer building process
   - Color mixing and application techniques
   - Finishing touches and details

5. **Tips and Considerations**:
   - Common pitfalls to avoid
   - Key techniques to master
   - Suggested practice exercises

Be specific, practical, and encouraging. Assume the reader wants to learn how to create something similar.`,
            },
            imageContent,
          ],
        },
      ],
    });

    const apiEndTime = Date.now();
    console.log(`=== CLAUDE API RESPONSE RECEIVED (${apiEndTime - apiStartTime}ms) ===`);
    console.log("Response content type:", response.content[0]?.type);

    const analysis = response.content[0]?.type === "text"
      ? response.content[0].text
      : "Unable to analyze the artwork.";

    console.log("Analysis length:", analysis.length, "characters");
    console.log("=== RETURNING SUCCESS ===");

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("=== ERROR IN API ROUTE ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: error.message || "Failed to analyze artwork" },
      { status: 500 }
    );
  }
}
