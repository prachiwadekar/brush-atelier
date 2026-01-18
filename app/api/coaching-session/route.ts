import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Groq from "groq-sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// Increase body size limit for image uploads and allow time for image generation
export const maxDuration = 300; // 5 minutes max execution time (needed for generating 10-12 step images)

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

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

// Generate 3 milestone images showing painting progression using Google's Gemini image generation
async function generate3MilestoneImages(
  sessionId: string,
  referenceImageBase64: string,
  referenceImageMimeType: string,
  medium: string
): Promise<void> {
  console.log(`📸 Starting 3 milestone image generation for session ${sessionId}`);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    // Milestone 1: Pencil sketch (outlines only, no shading)
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
      { inlineData: { data: referenceImageBase64, mimeType: referenceImageMimeType } }
    ]);

    let milestone1 = null;
    const sketchParts = sketchResult.response.candidates?.[0]?.content?.parts;
    if (sketchParts) {
      for (const part of sketchParts) {
        if (part.inlineData) {
          const base64Image = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || "image/png";
          milestone1 = `data:${mimeType};base64,${base64Image}`;
          console.log("✅ Milestone 1 generated (pencil sketch)");
          break;
        }
      }
    }

    // Milestone 2: Very early wash stage - just starting to add color
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
      { inlineData: { data: referenceImageBase64, mimeType: referenceImageMimeType } }
    ]);

    let milestone2 = null;
    const underpaintingParts = underpaintingResult.response.candidates?.[0]?.content?.parts;
    if (underpaintingParts) {
      for (const part of underpaintingParts) {
        if (part.inlineData) {
          const base64Image = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || "image/png";
          milestone2 = `data:${mimeType};base64,${base64Image}`;
          console.log("✅ Milestone 2 generated (underpainting)");
          break;
        }
      }
    }

    // Milestone 3: Early-mid stage painting (35-45% complete) - clearly unfinished
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
      { inlineData: { data: referenceImageBase64, mimeType: referenceImageMimeType } }
    ]);

    let milestone3 = null;
    const finalParts = finalResult.response.candidates?.[0]?.content?.parts;
    if (finalParts) {
      for (const part of finalParts) {
        if (part.inlineData) {
          const base64Image = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || "image/png";
          milestone3 = `data:${mimeType};base64,${base64Image}`;
          console.log("✅ Milestone 3 generated (near completion)");
          break;
        }
      }
    }

    // Save milestone images to database
    const session = await prisma.coachingSession.findUnique({
      where: { sessionId },
      select: { id: true, paintingGuide: true },
    });

    if (session) {
      const guide = JSON.parse(session.paintingGuide);

      // Add milestone images to the guide
      guide.milestoneImages = {
        sketch: milestone1,
        underpainting: milestone2,
        nearComplete: milestone3
      };

      await prisma.coachingSession.update({
        where: { sessionId },
        data: { paintingGuide: JSON.stringify(guide) }
      });

      console.log("✅ Milestone images saved to database");
    }

    console.log("🎉 3 milestone image generation completed");
  } catch (error) {
    console.error("❌ Error generating milestone images:", error);
  }
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

// Initialize a new coaching session
export async function POST(request: NextRequest) {
  console.log("=== COACHING SESSION API CALLED ===");
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let formData;
    try {
      formData = await request.formData();
    } catch (parseError: any) {
      console.error("Failed to parse form data:", parseError);
      return NextResponse.json({
        error: "Failed to process upload. The image file may be too large. Please try a smaller image (under 5MB)."
      }, { status: 413 });
    }
    const action = formData.get("action") as string;

    // Create new session
    if (action === "create") {
      const file = formData.get("file") as File | null;
      const medium = formData.get("medium") as string;
      const skillLevel = formData.get("skillLevel") as string || "intermediate";

      if (!file) {
        return NextResponse.json({ error: "No image provided" }, { status: 400 });
      }

      // Convert image to base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      const mimeType = file.type;

      // Upload image to a temporary location (in production, use cloud storage)
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
                  url: `data:${mimeType};base64,${base64}`,
                },
              },
            ],
          },
        ],
      });

      const imageAnalysis = visionResponse.choices[0]?.message?.content || "Unable to analyze image.";
      console.log("=== IMAGE ANALYSIS COMPLETE ===");
      console.log("Analysis preview:", imageAnalysis.substring(0, 200) + "...");

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
- Skill level: ${skillLevel}
- Medium: ${medium}

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
        console.log('First 3 steps:', JSON.stringify(coachPlan.slice(0, 3), null, 2));
      } catch (e) {
        console.error("Failed to parse coaching plan:", e);
        console.error("Plan text was:", planText);
        // Fallback plan
        coachPlan = [
          { step_number: 1, focus_area: "Initial Observation", coaching_point: "Let's start by observing this artwork together." }
        ];
      }

      // Image generation will happen synchronously before returning response
      // Using Google Gemini to generate 3 milestone images (sketch, underpainting, near-complete)
      console.log("=== STEP 3: PREPARING FOR 3 MILESTONE IMAGE GENERATION ===");

      const enableImageGeneration = process.env.ENABLE_STEP_IMAGES === 'true';
      console.log("Image generation enabled:", enableImageGeneration);

      // Generate quick guide first
      let quickGuide = await generateQuickGuide(base64, mimeType, medium);

      // If quickGuide generation failed, provide a minimal fallback
      if (!quickGuide) {
        console.error("⚠️ Quick guide generation failed, using fallback");
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
      const estimatedTime = await generateEstimatedTime(base64, mimeType, medium, skillLevel);

      // Generate AI-powered title based on image content
      console.log("Generating AI title for artwork...");
      const aiTitle = await generateArtworkTitle(imageUrl);
      console.log(`Generated title: "${aiTitle}"`);

      // Create session in database with all data
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
          imageUrl,
          imageMediaType: mimeType,
          medium,
          skillLevel,
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

      // Update existing portfolio item or create new one for this coaching session
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          studentProfile: {
            select: { id: true },
          },
        },
      });

      if (user?.studentProfile) {
        // Check if a portfolio item already exists with this imageUrl
        const existingPortfolioItem = await prisma.portfolioItem.findFirst({
          where: {
            studentProfileId: user.studentProfile.id,
            imageUrl,
          },
        });

        if (existingPortfolioItem) {
          // Update existing portfolio item with coaching session info and AI title
          await prisma.portfolioItem.update({
            where: { id: existingPortfolioItem.id },
            data: {
              title: aiTitle,
              description: null, // Remove generic description
              coachingSessionId: coachingSessionRecord.id,
            },
          });
        } else {
          // Create new portfolio item with AI-generated title
          await prisma.portfolioItem.create({
            data: {
              title: aiTitle,
              description: null, // No generic description needed
              imageUrl,
              studentProfileId: user.studentProfile.id,
              coachingSessionId: coachingSessionRecord.id,
            },
          });
        }
      }

      // Generate first coaching message
      const firstMessage = await getNextCoachingMessage(sessionId, base64, mimeType, medium, skillLevel, coachPlan, 0);

      // Fallback if guide generation fails
      if (!quickGuide || !quickGuide.supplies || !quickGuide.steps) {
        console.log("=== USING FALLBACK GUIDE ===");
        quickGuide = {
          supplies: {
            paintColors: ["Titanium White", "Ultramarine Blue", "Cadmium Yellow", "Alizarin Crimson", "Burnt Sienna", "Phthalo Green"],
            brushes: ["Round #6", "Flat 1-inch", "Filbert #8", "Detail Round #2"],
            palette: ["Palette for mixing colors", "Paper towels", "Water cup"],
            otherMaterials: ["Canvas 16x20", "Easel", "Sketching pencil (HB or 2B)", "Kneaded eraser", "Palette knife"]
          },
          steps: [
            {
              stepNumber: 1,
              stepTitle: "Sketch the Composition",
              instructionText: "Lightly sketch the main shapes and composition with a pencil. Focus on proportions and placement.",
              materials: ["Sketching pencil (HB or 2B)", "Canvas"],
              whyItMatters: "This foundation ensures accurate placement before adding paint."
            },
            {
              stepNumber: 2,
              stepTitle: "Block In Colors",
              instructionText: "Apply broad areas of color to establish the overall color scheme. Use thin paint and work quickly.",
              materials: ["Large flat brush", "Primary colors"],
              whyItMatters: "Blocking in helps you see the big picture and color relationships early."
            },
            {
              stepNumber: 3,
              stepTitle: "Build Mid-tones",
              instructionText: "Add middle values between your lights and darks. Layer colors to create depth.",
              materials: ["Medium round brush", "Mixed colors"],
              whyItMatters: "Mid-tones create form and dimension in your painting."
            },
            {
              stepNumber: 4,
              stepTitle: "Add Details",
              instructionText: "Refine shapes and add finer details. Work from background to foreground.",
              materials: ["Small detail brush", "Refined color mixes"],
              whyItMatters: "Details bring your painting to life and add visual interest."
            },
            {
              stepNumber: 5,
              stepTitle: "Refine and Finish",
              instructionText: "Step back, assess, and make final adjustments. Add highlights and finishing touches.",
              materials: ["Various brushes", "White for highlights"],
              whyItMatters: "Final refinements pull the entire painting together."
            }
          ],
          productLinks: [
            {
              name: "Primary Acrylic Paint Set (Red, Blue, Yellow, White, Black)",
              category: "paintColors",
              amazonUrl: "https://www.amazon.com/dp/B07RKVK8MG",
              isPrimary: true
            },
            {
              name: "Extended Acrylic Paint Set (24 Colors)",
              category: "paintColors",
              amazonUrl: "https://www.amazon.com/dp/B07YD7QHTM",
              isPrimary: false
            },
            {
              name: "Royal & Langnickel Brush Set",
              category: "brushes",
              amazonUrl: "https://www.amazon.com/dp/B000BQLWLU"
            },
            {
              name: "U.S. Art Supply Wood Palette",
              category: "palette",
              amazonUrl: "https://www.amazon.com/dp/B00251AYNE"
            }
          ]
        };
      }

      // Milestone images are now generated on-demand when user clicks "Visual Progress Guide"
      // This saves API costs by only generating images when actually needed
      // See /api/coaching-session/milestones endpoint for on-demand generation

      const finalGuide = completeGuide;

      return NextResponse.json({
        session_id: sessionId,
        message: firstMessage,
        step: 0,
        total_steps: coachPlan.length,
        painting_guide: finalGuide,
        estimated_time: estimatedTime,
        artwork_title: aiTitle,
      });
    }

    // Continue session
    if (action === "continue") {
      const sessionId = formData.get("session_id") as string;
      const userMessage = formData.get("message") as string;

      const coachingSession = await prisma.coachingSession.findUnique({
        where: { sessionId },
        include: {
          chatMessages: {
            select: {
              role: true,
              message: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 4,
          },
        },
      });

      if (!coachingSession) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      // Save user message
      await prisma.chatMessage.create({
        data: {
          coachingSessionId: coachingSession.id,
          role: "user",
          message: userMessage,
        },
      });

      const completeGuide = JSON.parse(coachingSession.paintingGuide);
      const coachPlan = completeGuide.coachPlan || completeGuide; // Backward compatibility

      // Generate coach response
      const coachMessage = await generateCoachResponse(
        coachingSession.imageUrl,
        coachingSession.imageMediaType,
        coachingSession.medium,
        coachingSession.skillLevel,
        coachPlan,
        coachingSession.currentStep,
        coachingSession.chatMessages.reverse(),
        userMessage
      );

      // Check if we should advance to next step
      const advanceKeywords = ["yes", "i see", "got it", "understand", "makes sense", "ready", "next"];
      const shouldAdvance = advanceKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));

      let newStep = coachingSession.currentStep;
      if (shouldAdvance && coachingSession.currentStep < coachPlan.length - 1) {
        newStep++;
        await prisma.coachingSession.update({
          where: { sessionId },
          data: { currentStep: newStep },
        });
      }

      // Save coach message
      await prisma.chatMessage.create({
        data: {
          coachingSessionId: coachingSession.id,
          role: "bot",
          message: coachMessage,
        },
      });

      return NextResponse.json({
        message: coachMessage,
        step: newStep,
        total_steps: coachPlan.length,
        completed: newStep >= coachPlan.length,
      });
    }

    // Save message (for saving medium selection messages)
    if (action === "save-message") {
      const sessionId = formData.get("session_id") as string;
      const role = formData.get("role") as string;
      const message = formData.get("message") as string;

      const coachingSession = await prisma.coachingSession.findUnique({
        where: { sessionId },
      });

      if (!coachingSession) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      // Save the message
      await prisma.chatMessage.create({
        data: {
          coachingSessionId: coachingSession.id,
          role: role as "user" | "bot",
          message: message,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("=== ERROR IN COACHING SESSION ===", error);
    return NextResponse.json(
      { error: error.message || "Failed to process coaching session" },
      { status: 500 }
    );
  }
}

async function getNextCoachingMessage(
  sessionId: string,
  imageBase64: string,
  mediaType: string,
  medium: string,
  skillLevel: string,
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

async function generateCoachResponse(
  imageUrl: string,
  mediaType: string,
  medium: string,
  skillLevel: string,
  coachPlan: CoachStep[],
  currentStep: number,
  recentMessages: Array<{role: string, message: string}>,
  userMessage: string
): Promise<string> {
  const step = coachPlan[currentStep];
  const historyText = recentMessages.map(m => `${m.role}: ${m.message}`).join("\n");

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    max_tokens: 200,
    temperature: 0.7,
    messages: [
      {
        role: "user",
        content: `You are a professional art coach in an active coaching session.

Current step (${currentStep + 1}/${coachPlan.length}): ${step?.focus_area || "Conclusion"}
Coaching point: ${step?.coaching_point || "Wrapping up"}
Medium: ${medium}
Skill level: ${skillLevel}

Recent conversation:
${historyText}

Student just said: "${userMessage}"

Respond as a coach:
- ONE sentence or question at a time
- Acknowledge their response briefly if relevant
- Guide them with questions, not lectures
- If they understood this point, acknowledge it and move to the next step
- If they need clarification, give ONE specific tip
- Sound encouraging and observant

${step && currentStep < coachPlan.length - 1 ? `Next step will be: "${coachPlan[currentStep + 1].focus_area}"` : "This is the final step."}`,
      },
    ],
  });

  return response.choices[0]?.message?.content || "Let's continue.";
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

Example product links for Acrylic:
- Liquitex BASICS Acrylic Paint Set (48 colors): https://www.amazon.com/dp/B00HIHWJUI
- Royal & Langnickel Variety Paint Brush Set: https://www.amazon.com/dp/B000BQLWLU
- U.S. Art Supply Wood Palette: https://www.amazon.com/dp/B00251AYNE

Use the image analysis above to tailor the supplies and steps to this specific artwork.

Return ONLY the JSON object, no other text.`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const responseText = response.choices[0]?.message?.content || "{}";

  try {
    // Strip markdown code blocks if present (```json ... ``` or ``` ... ```)
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```")) {
      // Remove opening ``` or ```json
      cleanedText = cleanedText.replace(/^```(?:json)?\s*\n?/, '');
      // Remove closing ```
      cleanedText = cleanedText.replace(/\n?```\s*$/, '');
    }

    const guide = JSON.parse(cleanedText) as PaintingGuide;

    // Ensure productLinks exists
    if (!guide.productLinks) {
      guide.productLinks = [];
    }

    // Add default affiliate links if none were generated for paint colors
    if (!guide.productLinks.some((p: any) => p.category === 'paintColors' && p.isPrimary)) {
      guide.productLinks.unshift({
        name: "Primary Acrylic Paint Set (Red, Blue, Yellow, White, Black)",
        category: "paintColors",
        amazonUrl: "https://www.amazon.com/dp/B07RKVK8MG",
        isPrimary: true
      } as any);
    }
    if (!guide.productLinks.some((p: any) => p.category === 'paintColors' && !p.isPrimary)) {
      guide.productLinks.push({
        name: "Extended Acrylic Paint Set (24 Colors)",
        category: "paintColors",
        amazonUrl: "https://www.amazon.com/dp/B07YD7QHTM",
        isPrimary: false
      } as any);
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

