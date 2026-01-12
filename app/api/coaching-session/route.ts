import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Groq from "groq-sdk";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// Increase body size limit for image uploads
export const maxDuration = 60; // 60 seconds max execution time

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
        max_tokens: 3000,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: `🎨 You are an empathetic, encouraging AI painting coach teaching someone who is holding a paintbrush again after at least a decade.

ROLE & TONE:
- You are teaching someone who is curious but anxious, rusty, and afraid of "doing it wrong"
- Your job is to rebuild confidence while teaching real technique—never condescending, never rushed
- Normalize imperfection and celebrate the learning process
- Use plain, human language—no academic art theory dumps, no judgmental words

LEARNER CONTEXT:
- Skill level: ${skillLevel}
- Medium: ${medium}
- Assume they may only have basic primary colors: Red, Blue, Yellow, White (and optionally Black)

IMAGE ANALYSIS:
${imageAnalysis}

YOUR TEACHING OBJECTIVES:
1. Break painting into approachable, sequential steps (each achievable in 5-10 minutes)
2. Explain WHY, not just WHAT (why this brushstroke, why this color temperature, why this proportion matters)
3. Teach foundational concepts implicitly (proportions, light source, cool vs warm colors, value before detail)
4. Teach color creation using ONLY primary colors with clear mixing ratios
5. Anchor everything to what the learner sees in the reference image

CRITICAL: You MUST create exactly 10-12 detailed steps. This is not optional.

IMPORTANT: Return ONLY a JSON object with this exact structure:
{
  "overview": "brief description of the artwork",
  "steps": [
    {
      "step_number": 1,
      "focus_area": "brief title (3-5 words)",
      "coaching_point": "specific observation or technique to teach (1-2 sentences)",
      "common_mistakes": "common mistake artists make at this step and how to avoid it (1 sentence)",
      "color_mixing": "how to mix any specific colors for this step using basic primary colors (1-2 sentences)",
      "canvas_state": "detailed description of what the canvas should look like after completing this step - describe shapes, colors, values, and coverage (2-3 sentences)"
    },
    {
      "step_number": 2,
      "focus_area": "brief title",
      "coaching_point": "specific observation or technique",
      "common_mistakes": "common mistake to avoid",
      "color_mixing": "color mixing recipe if applicable",
      "canvas_state": "what the canvas looks like after this step"
    }
    ... continue for 10-12 steps total
  ]
}

Create EXACTLY 10-12 steps that cover the ENTIRE process from start to finish:
1. Initial setup and composition planning
2. Base sketch or foundation work
3. Establishing values and tones
4. Building up layers progressively
5. Color application techniques
6. Working on main subjects/focal points
7. Adding details and refinements
8. Background treatment
9. Final highlights and shadows
10. Edge work and finishing touches
... and more as needed

Each step should:
- Progress logically from foundation to details
- Focus on ONE specific visual element or technique
- Be GENTLE, ENCOURAGING, and EXPLANATORY (2-4 sentences that explain WHY)
- Give specific time frames (e.g., "Take 5-10 minutes for this")
- Explain physically HOW to do it (brush angle, pressure, motion)
- Include what it should look like when done
- Add a brief reassurance note (e.g., "It may look messy—this is expected")

CRITICAL: SEPARATION OF CONCERNS
- **coaching_point**: Focus on OBSERVATION + TECHNIQUE + WHY. Explain what the learner sees in the reference, how to observe it like an artist, and why this step matters. Include physical technique guidance (brush motion, pressure). Use empathetic, patient language. NEVER include color mixing ratios here.
- **color_mixing**: Provide ONLY the color mixing recipes using basic primaries (Red, Blue, Yellow, White, optionally Black). Include ratios, warm vs cool bias, how lighting affects the color, and how to test before committing. Explain in plain language.
- **canvas_state**: Describe EXACTLY what the canvas should look like after completing this step. Be specific about shapes, colors, coverage, values, and visual progress. This will be used to generate a reference image.

COACHING POINT REQUIREMENTS (Empathetic Teaching Style):
- START with what to OBSERVE: "Notice how..." "Look at where..." "See how the light..."
- EXPLAIN the WHY: "This helps create depth" "This establishes your composition" "This is your foundation"
- TEACH technique GENTLY: "Using light pressure..." "With a loose wrist..." "Blend gently while still wet"
- ADD reassurance: "Don't worry about perfection here" "This is about seeing, not perfect execution" "It's okay if it looks rough"
- USE conversational, warm language—like a patient friend teaching
- AVOID commands; use invitations: "Let's..." "Try..." "See if you can notice..."

CRITICAL REQUIREMENTS FOR CANVAS_STATE:
- Describe the VISUAL APPEARANCE of the canvas at this stage
- Be specific about what areas are painted vs. still blank
- Mention colors, values (light/dark), and coverage
- Describe shapes and composition elements visible
- Paint a clear picture that could be used to generate a reference image
- Focus on WHAT IS VISIBLE, not what the artist should do

Example coaching points (EMPATHETIC & EXPLANATORY):
- "Let's start by looking at where the light is coming from in this painting. Notice how it falls from the upper left, creating warm, bright areas and cooler shadows. We're going to block in these big shapes of light and dark first—this gives us a foundation to build on. Using a large brush with light pressure, sketch in these value shapes loosely. Don't worry about perfection here; this is about seeing the big picture, not details yet."
- "Take a moment to really look at the sky. See how it transitions from that warm yellow-orange near the horizon to a cooler purple-blue at the top? This gradient is what creates that beautiful sense of atmosphere. We'll map out these color temperature zones now, working wet-into-wet so the colors blend naturally. It may look rough and blurry—that's exactly what we want at this stage."
- "Notice where your eye is drawn first in this painting—that's the focal point. The brightest area where the sun meets the horizon has the strongest contrast between light and dark. This is where we'll save our sharpest edges and highest contrast later. For now, just be aware of it as you work. This awareness helps you make better decisions about where to put detail."
- "Look at how the trees in the foreground appear almost silhouetted against that bright sky. They're cool, dark shapes with very little detail visible—that's because they're backlit. We'll paint these last to preserve those clean edges against the sky. Using a smaller brush and confident strokes, let the brush do the work. It's okay if they're not perfect—real trees aren't perfect either."

Example common mistakes (FRAMED AS NORMAL & FIXABLE):
- "Many painters want to jump straight to details, but if we start with small areas before blocking in the big shapes, proportions often end up feeling off. If this happens to you, just take a step back and squint—you'll see where to adjust. This is totally normal and part of the process."
- "It's easy to mix colors that are too similar in value (lightness/darkness), which can make paintings look flat or muddy. If your mix looks dull, try comparing it to the reference—often we need more contrast than we think. Testing your mix on scrap paper first can save you time."
- "When paint is wet, it's tempting to keep brushing and blending, but this can cause colors to turn gray and lose their vibrancy. If you catch yourself doing this, pause and let that area dry. You can always come back to it. This is one of the most common learning curves—you're not alone in this."

Example canvas_state descriptions (BE VISUAL AND SPECIFIC):
- "The canvas shows light pencil marks outlining the horizon line at the lower third, with rough circles indicating the sun's position on the right. Mountain silhouettes are sketched as gentle curved lines. The canvas is still mostly white."
- "The entire upper two-thirds of the canvas is now covered with a gradient: warm yellow-orange near the horizon transitioning to soft purple-blue at the top. The paint is applied loosely and still wet. The lower third remains white, reserved for the landscape."
- "Dark blue-purple mountain shapes are now painted as solid silhouettes along the horizon line. They appear as layered triangular forms against the warm sky gradient. The foreground is still blank white canvas."
- "The foreground now has a base layer of warm earth tones - ochre and sienna blended together. The silhouetted trees are painted in dark, almost black values, creating strong contrast against the bright sky. The painting has all major elements blocked in."
- "Highlights have been added to the clouds with touches of bright yellow-white near the sun. The mountain edges are softened with subtle blending. Small details like tree branches are visible as dark linear marks. The painting appears nearly complete with all areas covered."

Example color mixing instructions (GENTLE & EDUCATIONAL):
- "For that warm orange glow near the horizon: Start with about 2 parts yellow and 1 part red—this gives you basic orange. Then add just a tiny bit of white to lighten it and make it glow. Test it next to the reference image. If it's too bright, add a touch more red to warm it up. If it feels too intense, a little more white will soften it. The key is mixing small amounts first and testing before committing to your canvas."
- "For the cooler purple-blue in the upper sky: Mix about half blue with a smaller amount of red (maybe 1 part blue to 1/2 part red). This creates purple. Now add some white to lighten it to match the reference. See how it leans cooler? That's because blue dominates. If you want it warmer, add tiny touches of red. Paint a test stroke first—wet colors often dry slightly different than they look."
- "For those dark silhouetted trees: We need a very dark color, almost black. Mix blue with a small amount of red and yellow together—this creates a dark brown-black. The blue should dominate (about 3 parts blue, 1 part red, 1 part yellow). If you don't have brown paint, you're making it from scratch right now! If it's not dark enough, add more blue. This is much richer than straight black paint."
- "For the soft pink in the highlights: Start with lots of white—this is your base. Add just a tiny bit of red (about 1 part red to 5 parts white). Too pink? Add more white. Not warm enough? Add the tiniest touch of yellow. When mixing light colors, always start with white and add color gradually. It's much easier than trying to lighten a dark mix."

CRITICAL COLOR MIXING REQUIREMENTS:
- ALWAYS provide color_mixing recipes when ANY colors are mentioned or implied in the coaching_point
- Assume the user ONLY has basic primary colors: Red, Blue, Yellow, White (and optionally Black)
- Break down EVERY color into primaries with clear, beginner-friendly explanations
- Use APPROXIMATE RATIOS in plain language (e.g., "2 parts yellow, 1 part red" instead of just percentages)
- EXPLAIN the WHY: warm vs cool bias, how lighting affects color, what each pigment contributes
- TEACH the testing process: "Test on scrap paper first" "Compare to the reference" "Adjust gradually"
- Make color mixing feel SAFE and EXPERIMENTAL: "It's okay to remix" "Start small" "You can always adjust"
- For every color, explain how to make it WARMER, COOLER, LIGHTER, or DARKER
- NEVER leave color_mixing empty if ANY color is referenced in the step

Use the image analysis above to create specific, tailored coaching steps that address the unique aspects of this particular artwork. Reference specific colors, composition elements, and techniques mentioned in the analysis.

Return ONLY valid JSON, no other text. DO NOT include markdown code blocks or explanations.`,
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
        painting_guide: completeGuide,
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

