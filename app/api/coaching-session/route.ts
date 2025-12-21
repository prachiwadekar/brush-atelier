import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface CoachStep {
  step_number: number;
  focus_area: string;
  coaching_point: string;
}

// Initialize a new coaching session
export async function POST(request: NextRequest) {
  console.log("=== COACHING SESSION API CALLED ===");
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
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

      // Create coaching plan
      console.log("=== CREATING COACHING PLAN ===");
      const planResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an expert art coach preparing a personalized coaching plan.

Analyze this artwork and create a step-by-step coaching plan for teaching a ${skillLevel} artist how to recreate it using ${medium}.

IMPORTANT: Return ONLY a JSON object with this exact structure:
{
  "overview": "brief description of the artwork",
  "steps": [
    {
      "step_number": 1,
      "focus_area": "brief title",
      "coaching_point": "specific observation or technique to teach"
    }
  ]
}

Create 5-8 steps that:
- Progress logically from foundation to details
- Each step focuses on ONE specific aspect
- Are phrased as coaching points, not instructions
- Build on previous steps

Example coaching points:
- "Notice how the light source creates strong shadows on the left side"
- "The horizon line sits at about one-third from the bottom"
- "The artist used loose, confident strokes for the background"

Return ONLY valid JSON, no other text.`,
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType as any,
                  data: base64,
                },
              },
            ],
          },
        ],
      });

      const planText = planResponse.content[0]?.type === "text" ? planResponse.content[0].text : "{}";

      // Parse the coaching plan
      let coachPlan: CoachStep[] = [];
      try {
        const parsed = JSON.parse(planText);
        coachPlan = parsed.steps || [];
      } catch (e) {
        console.error("Failed to parse coaching plan:", e);
        // Fallback plan
        coachPlan = [
          { step_number: 1, focus_area: "Initial Observation", coaching_point: "Let's start by observing this artwork together." }
        ];
      }

      // Generate quick guide first
      console.log("=== GENERATING QUICK GUIDE ===");
      let quickGuide = await generateQuickGuide(base64, mimeType, medium);
      console.log("=== QUICK GUIDE RESULT ===", quickGuide);

      // Generate estimated time
      console.log("=== GENERATING ESTIMATED TIME ===");
      const estimatedTime = await generateEstimatedTime(base64, mimeType, medium, skillLevel);

      // Create session in database with all data
      const sessionId = randomBytes(16).toString("hex");

      // Store complete guide including coaching plan
      const completeGuide = {
        coachPlan: coachPlan,
        quickGuide: quickGuide
      };

      await prisma.coachingSession.create({
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
            otherMaterials: ["Canvas 16x20", "Easel", "Palette knife"]
          },
          steps: [
            {
              stepNumber: 1,
              stepTitle: "Sketch the Composition",
              instructionText: "Lightly sketch the main shapes and composition with a pencil or thin brush. Focus on proportions and placement.",
              materials: ["Pencil or thin brush", "Canvas"],
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
              name: "Liquitex BASICS Acrylic Paint Set",
              category: "paintColors",
              amazonUrl: "https://www.amazon.com/dp/B00HIHWJUI"
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

      return NextResponse.json({
        session_id: sessionId,
        message: firstMessage,
        step: 0,
        total_steps: coachPlan.length,
        quick_guide: quickGuide,
        estimated_time: estimatedTime,
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

  // Generate contextual first message using Claude
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 150,
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

  return response.content[0]?.type === "text" ? response.content[0].text : step.coaching_point;
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

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 200,
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

  return response.content[0]?.type === "text" ? response.content[0].text : "Let's continue.";
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
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are creating a structured painting guide for recreating this artwork using ${medium}.

CRITICAL: Return ONLY valid JSON with this EXACT structure:

{
  "supplies": {
    "paintColors": ["Titanium White", "Ultramarine Blue", "etc"],
    "brushes": ["Round #6", "Flat 1-inch", "etc"],
    "palette": ["Palette for mixing colors", "Paper towels", "Water cup (for watercolor/acrylic)"],
    "otherMaterials": ["Canvas 16x20", "Easel", "etc"]
  },
  "steps": [
    {
      "stepNumber": 1,
      "stepTitle": "Brief title (max 4 words)",
      "instructionText": "One clear, actionable instruction. Maximum 2 sentences, under 240 characters.",
      "materials": ["Specific items needed for THIS step only"],
      "whyItMatters": "One sentence explaining why this step is important"
    }
  ],
  "productLinks": [
    {
      "name": "Specific product name",
      "category": "paintColors|brushes|palette|canvas|other",
      "amazonUrl": "https://www.amazon.com/dp/PRODUCTID"
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

Product Links Requirements:
- Recommend 5-8 high-quality, beginner-friendly products available on Amazon
- For ${medium}, include paint sets, brush sets, canvas/paper, palette, and essential accessories
- Use real, popular Amazon products (search for best-selling art supplies)
- Format: https://www.amazon.com/dp/[ASIN] (ASIN is Amazon Standard Identification Number)
- Prioritize starter sets and value packs for beginners
- Category must be one of: "paintColors", "brushes", "palette", "canvas", "other"

Example product links for Acrylic:
- Liquitex BASICS Acrylic Paint Set (48 colors): https://www.amazon.com/dp/B00HIHWJUI
- Royal & Langnickel Variety Paint Brush Set: https://www.amazon.com/dp/B000BQLWLU
- U.S. Art Supply Wood Palette: https://www.amazon.com/dp/B00251AYNE

Return ONLY the JSON object, no other text.`,
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as any,
              data: imageBase64,
            },
          },
        ],
      },
    ],
  });

  const responseText = response.content[0]?.type === "text" ? response.content[0].text : "{}";
  console.log("=== RAW API RESPONSE TEXT ===");
  console.log(responseText);

  try {
    const guide = JSON.parse(responseText) as PaintingGuide;
    console.log("=== PARSED GUIDE ===", guide);
    return guide;
  } catch (e) {
    console.error("Failed to parse painting guide:", e);
    console.error("Response text was:", responseText);
    return null;
  }
}

async function generateEstimatedTime(imageBase64: string, mediaType: string, medium: string, skillLevel: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert art instructor estimating how long it will take to complete this painting.

Analyze this artwork and estimate completion time for a ${skillLevel} artist using ${medium}.

Consider:
- Complexity of the composition
- Number of colors and color mixing required
- Level of detail and refinement needed
- Drying time for ${medium}
- Artist's skill level: ${skillLevel}

Return ONLY a time estimate in this exact format: "X-Y hours" or "X-Y days"
Examples: "2-3 hours", "4-6 hours", "1-2 days"

Be realistic and account for breaks, drying time, and the learning curve.`,
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as any,
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const estimate = response.content[0]?.type === "text" ? response.content[0].text.trim() : "2-4 hours";
    console.log("=== ESTIMATED TIME ===", estimate);
    return estimate;
  } catch (e) {
    console.error("Failed to generate estimated time:", e);
    return "2-4 hours";
  }
}
