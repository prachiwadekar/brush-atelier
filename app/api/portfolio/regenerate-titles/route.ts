import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate an intelligent title based on image analysis
async function generateArtworkTitle(imageData: string): Promise<string> {
  try {
    // Extract the base64 data and mime type from the data URL
    const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return "Untitled Artwork";
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 50,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this artwork and provide a short, descriptive title (2-4 words maximum) that captures what the image depicts. Focus on the main subject matter. Examples: "Sunset Over Ocean", "Bowl of Strawberries", "Portrait Study", "Forest Landscape". Respond with ONLY the title, no explanations.`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageData,
              },
            },
          ],
        },
      ],
    });

    const generatedTitle = response.choices[0]?.message?.content?.trim() || "Untitled Artwork";
    // Remove quotes if AI wrapped the title in them
    return generatedTitle.replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error("Error generating title:", error);
    return "Untitled Artwork";
  }
}

// Regenerate titles for all existing portfolio items
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all portfolio items for the user
    const portfolioItems = await prisma.portfolioItem.findMany({
      where: {
        studentProfile: {
          userId: session.user.id,
        },
      },
      select: {
        id: true,
        imageUrl: true,
        title: true,
      },
    });

    console.log(`Regenerating titles for ${portfolioItems.length} portfolio items...`);

    let updatedCount = 0;
    const results = [];

    for (const item of portfolioItems) {
      try {
        const newTitle = await generateArtworkTitle(item.imageUrl);

        await prisma.portfolioItem.update({
          where: { id: item.id },
          data: {
            title: newTitle,
            description: null, // Remove generic description
          },
        });

        results.push({
          id: item.id,
          oldTitle: item.title,
          newTitle: newTitle,
        });

        updatedCount++;
        console.log(`Updated: "${item.title}" → "${newTitle}"`);
      } catch (error) {
        console.error(`Failed to update item ${item.id}:`, error);
        results.push({
          id: item.id,
          oldTitle: item.title,
          error: "Failed to generate title",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully regenerated ${updatedCount} of ${portfolioItems.length} titles`,
      results,
    });
  } catch (error: any) {
    console.error("Error regenerating titles:", error);
    return NextResponse.json(
      { error: error.message || "Failed to regenerate titles" },
      { status: 500 }
    );
  }
}
