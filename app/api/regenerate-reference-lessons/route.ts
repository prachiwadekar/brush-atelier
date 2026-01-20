import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Groq from "groq-sdk";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { headers } from "next/headers";

export const maxDuration = 300; // 5 minutes max execution time

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CoachStep {
  step_number: number;
  focus_area: string;
  coaching_point: string;
  common_mistakes?: string;
  color_mixing?: string;
  recommended_brush?: string;
  canvas_state?: string;
  visual_description?: string;
  step_image_url?: string;
}

interface PaintingStep {
  stepNumber: number;
  stepTitle: string;
  instructionText: string;
  materials?: string[];
  whyItMatters?: string;
}

interface ProductLink {
  name: string;
  category: string;
  amazonUrl: string;
  isPrimary?: boolean;
}

interface PaintingGuide {
  supplies: {
    paintColors: string[];
    brushes: string[];
    palette: string[];
    otherMaterials: string[];
  };
  steps: PaintingStep[];
  productLinks?: ProductLink[];
}

// Generate an intelligent title based on image analysis
async function generateArtworkTitle(imageData: string): Promise<string> {
  try {
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

async function generateQuickGuide(imageBase64: string, mediaType: string, medium: string): Promise<PaintingGuide | null> {
  // Step 1: Analyze image with GPT-4o
  const visionResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this artwork and provide a brief description focusing on:
1. Main subject and composition
2. Color palette (list specific colors)
3. Level of detail and complexity
4. Recommended supplies for ${medium}

Be concise and specific.`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mediaType};base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
  });

  const imageAnalysis = visionResponse.choices[0]?.message?.content || "Unable to analyze image.";

  // Step 2: Generate guide with LLaMA based on analysis
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    max_tokens: 3000,
    temperature: 0.7,
    messages: [
      {
        role: "user",
        content: `You are creating a structured painting guide for ${medium} based on this artwork analysis:

IMAGE ANALYSIS:
${imageAnalysis}

CRITICAL: Return ONLY valid JSON with this EXACT structure:

{
  "supplies": {
    "paintColors": ["Titanium White", "Ultramarine Blue", "etc"],
    "brushes": ["Round #6", "Flat 1-inch", "etc"],
    "palette": ["Palette for mixing colors", "Paper towels", "Water cup (for watercolor/acrylic)"],
    "otherMaterials": ["Canvas 16x20", "Easel", "Sketching pencils (HB or 2B)", "Kneaded eraser", "etc"]
  },
  "steps": [
    {
      "stepNumber": 1,
      "stepTitle": "Brief title (max 4 words)",
      "instructionText": "One clear, actionable instruction. Maximum 2 sentences, under 240 characters.",
      "materials": ["Sketching pencil (HB or 2B)", "Canvas or paper", "Other items needed for THIS step"],
      "whyItMatters": "One sentence explaining why this step is important"
    }
  ],
  "productLinks": [
    {
      "name": "Specific product name",
      "category": "paintColors|brushes|palette|canvas|other",
      "amazonUrl": "https://www.amazon.com/dp/PRODUCTID",
      "isPrimary": true|false
    }
  ]
}

Requirements:
- Create 6-8 painting steps
- Each instructionText must be 1-2 sentences max, under 240 characters
- Each stepTitle must be 4 words or less
- Steps progress from foundation to final details
- Each step should be completable in one sitting
- Be specific and actionable
- IMPORTANT: Always include "palette" in the supplies with items like "Palette for mixing colors", "Paper towels", and "Water cup (for watercolor/acrylic)" or "Odorless mineral spirits (for oil paints)"
- IMPORTANT: Always include sketching supplies in "otherMaterials": "Sketching pencil (HB or 2B)" and "Kneaded eraser" since students will use these to sketch before painting
- CRITICAL: Step 1 MUST be about sketching the initial composition with a pencil
- CRITICAL: Step 1's "materials" array MUST start with a SPECIFIC pencil type like "Sketching pencil (HB or 2B)" or "Graphite pencil (2B)" - NEVER just say "pencil" without specifying the type
- The instructionText for Step 1 should mention using the specific pencil type

Product Links Requirements:
- Recommend 5-8 high-quality, beginner-friendly products available on Amazon
- For ${medium}, include paint sets, brush sets, canvas/paper, palette, and essential accessories
- Use real, popular Amazon products (search for best-selling art supplies)
- Format: https://www.amazon.com/dp/[ASIN] (ASIN is Amazon Standard Identification Number)
- Prioritize starter sets and value packs for beginners
- Category must be one of: "paintColors", "brushes", "palette", "canvas", "other"
- For paint color product links, set "isPrimary": true for primary color sets (Red, Blue, Yellow, White, Black)
- Set "isPrimary": false for additional/specialty color sets

Return ONLY the JSON object, no other text.`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const responseText = response.choices[0]?.message?.content || "{}";

  try {
    // Strip markdown code blocks if present
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("\`\`\`")) {
      cleanedText = cleanedText.replace(/^\`\`\`(?:json)?\s*\n?/, '');
      cleanedText = cleanedText.replace(/\n?\`\`\`\s*$/, '');
    }

    const guide = JSON.parse(cleanedText) as PaintingGuide;

    // Ensure productLinks exists
    if (!guide.productLinks) {
      guide.productLinks = [];
    }

    // Add default affiliate links if none were generated for paint colors
    if (!guide.productLinks.some((p: ProductLink) => p.category === 'paintColors' && p.isPrimary)) {
      guide.productLinks.unshift({
        name: "Primary Acrylic Paint Set (Red, Blue, Yellow, White, Black)",
        category: "paintColors",
        amazonUrl: "https://www.amazon.com/dp/B07RKVK8MG",
        isPrimary: true
      });
    }
    if (!guide.productLinks.some((p: ProductLink) => p.category === 'paintColors' && !p.isPrimary)) {
      guide.productLinks.push({
        name: "Extended Acrylic Paint Set (24 Colors)",
        category: "paintColors",
        amazonUrl: "https://www.amazon.com/dp/B07YD7QHTM",
        isPrimary: false
      });
    }

    return guide;
  } catch (e) {
    console.error("Failed to parse painting guide:", e);
    console.error("Response text was:", responseText);
    return null;
  }
}

async function generateEstimatedTime(imageBase64: string, mediaType: string, medium: string, skillLevel: string): Promise<string> {
  try {
    // Step 1: Analyze complexity with GPT-4o
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this artwork's complexity. Rate on scale 1-10:
1. Detail level (1=simple, 10=extremely detailed)
2. Color complexity (1=few colors, 10=many colors/gradients)
3. Technical difficulty (1=beginner, 10=expert)

Provide brief reasoning for each rating.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mediaType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    });

    const complexityAnalysis = visionResponse.choices[0]?.message?.content || "Medium complexity";

    // Step 2: Calculate time estimate with LLaMA
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: 200,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: `You are an expert art instructor estimating how long it will take to complete a ${medium} painting.

COMPLEXITY ANALYSIS:
${complexityAnalysis}

Estimate completion time for a ${skillLevel} artist using ${medium}.

Consider:
- The complexity analysis above
- Drying time for ${medium}
- Artist's skill level: ${skillLevel}
- Include breaks and learning time

Return ONLY a time estimate in this exact format: "X-Y hours" or "X-Y days"
Examples: "2-3 hours", "4-6 hours", "1-2 days"`,
        },
      ],
    });

    const estimate = response.choices[0]?.message?.content?.trim() || "2-4 hours";
    console.log("=== ESTIMATED TIME ===", estimate);
    return estimate;
  } catch (e) {
    console.error("Failed to generate estimated time:", e);
    return "2-4 hours";
  }
}

async function getNextCoachingMessage(
  _imageBase64: string,
  _mediaType: string,
  medium: string,
  _skillLevel: string,
  coachPlan: CoachStep[],
  currentStep: number
): Promise<string> {
  const step = coachPlan[currentStep];
  if (!step) {
    return "Great work! We've completed all the coaching steps. Would you like to try painting this now, or do you have any questions?";
  }

  // Generate contextual first message using Groq
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    max_tokens: 150,
    temperature: 0.7,
    messages: [
      {
        role: "user",
        content: `You are a warm, encouraging art coach starting a lesson.

Current coaching point: "${step.coaching_point}"
Focus area: "${step.focus_area}"
Medium: ${medium}

Generate ONE opening question or observation to begin this step. Keep it:
- Conversational and friendly
- Focused on observation
- Maximum 2 sentences
- Ask what THEY notice, don't tell them yet

Example: "Take a look at the overall composition. What do you notice about where the main subject is positioned?"`,
      },
    ],
  });

  return response.choices[0]?.message?.content || step.coaching_point;
}

export async function POST(request: NextRequest) {
  console.log("=== REGENERATE REFERENCE LESSONS API CALLED ===");

  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imageFile, medium, skillLevel } = body;

    if (!imageFile) {
      return NextResponse.json({ error: "No image file specified" }, { status: 400 });
    }

    // Fetch the image via HTTP (works in both dev and production/Vercel)
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const fullUrl = `${protocol}://${host}/${imageFile}`;

    console.log(`Fetching image from: ${fullUrl}`);

    const imageResponse = await fetch(fullUrl);
    if (!imageResponse.ok) {
      console.error(`Failed to fetch image: ${imageResponse.status}`);
      return NextResponse.json({ error: `Image not found: ${imageFile}` }, { status: 404 });
    }

    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(imageArrayBuffer).toString("base64");

    // Determine mime type from content-type header or extension
    const contentType = imageResponse.headers.get('content-type');
    let mimeType: string;
    if (contentType) {
      mimeType = contentType;
    } else {
      // Fallback to extension-based detection
      const ext = imageFile.split('.').pop()?.toLowerCase() || '';
      if (ext === "png") mimeType = "image/png";
      else if (ext === "webp") mimeType = "image/webp";
      else if (ext === "gif") mimeType = "image/gif";
      else mimeType = "image/jpeg";
    }

    const imageUrl = `data:${mimeType};base64,${base64}`;

    // Step 1: Use GPT-4o to analyze the image
    console.log("=== STEP 1: ANALYZING IMAGE WITH GPT-4o ===");
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this artwork and provide a detailed, structured description for an art coach. Include:
1. Subject matter and composition
2. Color palette (specific colors visible)
3. Lighting and values (light/dark areas)
4. Technique and style observations
5. Key features that make this artwork unique
6. Difficulty level and complexity

Be specific about colors, proportions, and techniques. This description will be used to create a coaching plan.`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });

    const imageAnalysis = visionResponse.choices[0]?.message?.content || "Unable to analyze image.";
    console.log("=== IMAGE ANALYSIS COMPLETE ===");

    // Step 2: Use LLaMA to create coaching plan based on the image analysis
    console.log("=== STEP 2: CREATING COACHING PLAN WITH LLaMA ===");
    const planResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: 5000,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are a painting instructor. Create detailed, personalized painting tutorials based on the image analysis provided. Write specific instructions using the actual objects, colors, and composition from the artwork - never use placeholder text or brackets.`
        },
        {
          role: "user",
          content: `Create a painting tutorial for this artwork.

IMAGE ANALYSIS:
${imageAnalysis}

STUDENT INFO:
- Skill level: ${skillLevel || 'beginner'}
- Medium: ${medium || 'Acrylic'}

REQUIRED STEP STRUCTURE (follow this order exactly):

STEP 1 - "Composition Observation": Guide the student to study the reference image. Describe ALL the specific objects you see in the image analysis (e.g., "a stack of bread slices", "a blue ceramic vase"), their exact positions (left, right, center, foreground, background), their sizes relative to each other, where the light source is, and the main colors. This step is about LOOKING, not drawing.

STEP 2 - "Pencil Sketch": Give specific sketching instructions based on the actual objects in the artwork. Tell them exactly what shapes to draw (e.g., "draw an oval for the bread", "draw a tall rectangle for the vase"), where to position each shape on the canvas, and how large each should be relative to others.

STEP 3 - "Light Wash / Underpainting": Describe which specific colors to use for the wash based on the artwork's color palette. Name the actual areas (e.g., "wash the background with diluted warm gray", "wash the bread area with pale yellow-orange").

STEP 4 - "Drying Time & Background": Tell them to wait for the wash to dry, then paint the background using specific colors from the artwork.

STEPS 5+: Paint each object ONE AT A TIME, from background to foreground. Use the actual object names from the image (e.g., "The bread slices", "The butter dish", "The ceramic cup").

Return this JSON structure:

{
  "overview": "Brief description of what's in the artwork",
  "colors_needed": ["List every color you mention in the tutorial"],
  "steps": [
    {
      "step_number": 1,
      "focus_area": "Composition Observation",
      "coaching_point": "Write the actual observation guidance here - describe the specific objects, their placement, proportions, light source, and colors from the image analysis",
      "common_mistakes": "Rushing to draw without really seeing",
      "color_mixing": "No mixing yet - observation only",
      "recommended_brush": "None - observation only",
      "canvas_state": "Blank canvas",
      "visual_description": "Reference image being studied"
    },
    {
      "step_number": 2,
      "focus_area": "Pencil Sketch",
      "coaching_point": "Write specific sketching instructions - what shapes to draw for each object, where to place them, relative sizes",
      "common_mistakes": "Pressing too hard with pencil",
      "color_mixing": "No paint yet",
      "recommended_brush": "HB pencil",
      "canvas_state": "Light pencil outline",
      "visual_description": "Pencil sketch of composition"
    },
    ...continue for all steps...
  ]
}

IMPORTANT RULES:
1. NEVER use brackets like [describe...] or [specific color] - write the actual content
2. Use the REAL objects from the image analysis (bread, vase, table, etc.)
3. Use REAL colors based on what you see in the analysis
4. Steps 5+ should each focus on ONE specific object
5. Include brush type, stroke direction, and pressure for painting steps
6. Create 12-18 total steps

Return ONLY valid JSON, no other text.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const planText = planResponse.choices[0]?.message?.content || "{}";

    // Parse the coaching plan
    let coachPlan: CoachStep[] = [];
    try {
      const parsed = JSON.parse(planText);
      coachPlan = parsed.steps || [];
      console.log('=== COACHING PLAN GENERATED ===');
      console.log('Number of steps:', coachPlan.length);
    } catch (e) {
      console.error("Failed to parse coaching plan:", e);
      coachPlan = [
        { step_number: 1, focus_area: "Initial Observation", coaching_point: "Let's start by observing this artwork together." }
      ];
    }

    // Generate quick guide
    let quickGuide = await generateQuickGuide(base64, mimeType, medium || 'Acrylic');

    // If quickGuide generation failed, provide a minimal fallback
    if (!quickGuide) {
      console.error("Quick guide generation failed, using fallback");
      quickGuide = {
        supplies: {
          paintColors: [],
          brushes: [],
          palette: [],
          otherMaterials: []
        },
        steps: [],
        productLinks: []
      };
    }

    // Generate estimated time
    const estimatedTime = await generateEstimatedTime(base64, mimeType, medium || 'Acrylic', skillLevel || 'beginner');

    // Generate AI-powered title based on image content
    console.log("Generating AI title for artwork...");
    const aiTitle = await generateArtworkTitle(imageUrl);
    console.log(`Generated title: "${aiTitle}"`);

    // Create session in database
    const sessionId = randomBytes(16).toString("hex");

    // Store complete guide including coaching plan
    const completeGuide = {
      coachPlan: coachPlan,
      quickGuide: quickGuide
    };

    const coachingSessionRecord = await prisma.coachingSession.create({
      data: {
        sessionId,
        userId: session.user.id,
        imageUrl: `/${imageFile}`, // Use the public path
        imageMediaType: mimeType,
        medium: medium || 'Acrylic',
        skillLevel: skillLevel || 'beginner',
        paintingGuide: JSON.stringify(completeGuide),
        estimatedTime,
        artworkStatus: "IN_PROGRESS",
        currentStep: 0,
        totalSteps: coachPlan.length,
      },
    });

    // Save initial bot greeting message
    await prisma.chatMessage.create({
      data: {
        coachingSessionId: coachingSessionRecord.id,
        role: "bot",
        message: `Perfect! I can see your image. Let's create your lesson.\nWhat medium do you prefer?`,
      },
    });

    // Create or update portfolio item for this coaching session
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        studentProfile: {
          select: { id: true },
        },
      },
    });

    if (user?.studentProfile) {
      const publicImageUrl = `/${imageFile}`;

      // Check if a portfolio item already exists with this imageUrl
      const existingPortfolioItem = await prisma.portfolioItem.findFirst({
        where: {
          studentProfileId: user.studentProfile.id,
          imageUrl: publicImageUrl,
        },
      });

      if (existingPortfolioItem) {
        // Update existing portfolio item with coaching session info and AI title
        await prisma.portfolioItem.update({
          where: { id: existingPortfolioItem.id },
          data: {
            title: aiTitle,
            description: null,
            coachingSessionId: coachingSessionRecord.id,
          },
        });
        console.log("✅ Updated existing portfolio item with coaching session");
      } else {
        // Create new portfolio item with AI-generated title
        await prisma.portfolioItem.create({
          data: {
            title: aiTitle,
            description: null,
            imageUrl: publicImageUrl,
            studentProfileId: user.studentProfile.id,
            coachingSessionId: coachingSessionRecord.id,
          },
        });
        console.log("✅ Created new portfolio item with coaching session");
      }
    }

    // Generate first coaching message
    const firstMessage = await getNextCoachingMessage(base64, mimeType, medium || 'Acrylic', skillLevel || 'beginner', coachPlan, 0);

    return NextResponse.json({
      session_id: sessionId,
      message: firstMessage,
      step: 0,
      total_steps: coachPlan.length,
      painting_guide: completeGuide,
      estimated_time: estimatedTime,
      artwork_title: aiTitle,
    });

  } catch (error: any) {
    console.error("=== ERROR IN REGENERATE REFERENCE LESSONS ===", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate lesson for reference image" },
      { status: 500 }
    );
  }
}
