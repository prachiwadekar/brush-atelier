// Pre-generated coaching lessons for reference images
// These are used when users click on recommended reference images
// to avoid regenerating AI content for every user

export interface ReferenceLesson {
  imageUrl: string;
  imageName: string;
  medium: string;
  estimatedTime: string;
  materialsGuide: string;
  coachPlan: Array<{
    coaching_point: string;
    common_mistakes: string;
    color_mixing: string;
    canvas_state: string;
  }>;
  firstMessage: string;
}

export const REFERENCE_LESSONS: Record<string, ReferenceLesson> = {
  'jenston.jpeg': {
    imageUrl: '/jenston.jpeg',
    imageName: 'Portrait Study',
    medium: 'Acrylic',
    estimatedTime: '3-4 hours',
    materialsGuide: `**Brushes Needed:**
- Small round brush (#2 or #4) for facial details
- Medium flat brush (#6 or #8) for blocking in shapes
- Soft filbert brush for blending skin tones

**Primary Colors:**
- Titanium White
- Cadmium Red (or similar warm red)
- Ultramarine Blue (or similar cool blue)
- Cadmium Yellow (or similar warm yellow)
- Burnt Sienna (for skin tone warmth)
- Raw Umber (for shadows)

**Canvas:** 11x14" or 16x20" canvas panel or stretched canvas`,
    coachPlan: [
      {
        coaching_point: "Start by sketching the basic proportions and placement of facial features using a thin mix of Raw Umber. Focus on getting the eyes at the halfway point of the head, and the nose-to-chin distance equal to the forehead-to-nose distance. This foundation is critical—rushing it leads to a likeness that feels 'off' even if everything else is perfect.",
        common_mistakes: "Many beginners place the eyes too high on the head or make the head shape too narrow. Take your time measuring proportions with your brush held at arm's length.",
        color_mixing: "Raw Umber + lots of water (for a thin, sketch-like consistency)",
        canvas_state: "Light sketch of head shape and facial feature placement visible on canvas"
      },
      {
        coaching_point: "Block in the darkest shadow areas of the face and hair using a mid-value mix. Don't worry about details yet—you're establishing the value structure. Squint at your reference to see where the darkest darks live. This step teaches you to see values rather than just colors.",
        common_mistakes: "Avoiding going dark enough in the shadows. Remember, you can always lighten, but building up darks gradually creates muddy results.",
        color_mixing: "Burnt Sienna + Ultramarine Blue + touch of Red (creates a warm dark brown for shadows)",
        canvas_state: "Shadow areas blocked in with mid-dark values, creating dimension"
      },
      {
        coaching_point: "Mix your base skin tone and block in the mid-tone areas of the face. The key is to mix a color that's slightly lighter than the mid-tones you see—it's easier to darken than lighten. Apply this with confident, deliberate strokes following the planes of the face.",
        common_mistakes: "Making skin tones too pink or too orange. Real skin has subtle variations with yellow, red, and even blue undertones.",
        color_mixing: "White + Red + Yellow + tiny touch of Blue (adjust proportions until it matches the reference's mid-tone)",
        canvas_state: "Face has three distinct value zones: darks, mid-tones, and areas left for highlights"
      },
      {
        coaching_point: "Refine the eyes by carefully painting the iris, pupil, and adding the catchlight (that sparkle in the eye). The eyes are the focal point, so take your time here. Notice that eyes are not perfect circles—the top lid usually covers part of the iris.",
        common_mistakes: "Making both eyes look in slightly different directions, or making the whites of the eyes pure white (they should be slightly tinted with warm or cool tones).",
        color_mixing: "For brown eyes: Burnt Sienna + Ultramarine Blue + touch of Yellow. For catchlight: Pure White",
        canvas_state: "Eyes have defined iris, pupil, and catchlight, bringing life to the portrait"
      },
      {
        coaching_point: "Work on the nose by defining its planes—the bridge, tip, and nostrils. The nose catches a lot of light on its bridge and tip. Use a cooler tone for shadows under the nose and in the nostrils, and a warm highlight on the tip.",
        common_mistakes: "Outlining the nose with lines instead of painting it with planes of color and value. Real noses are defined by light and shadow, not lines.",
        color_mixing: "Highlight: Base skin tone + White + tiny Yellow. Shadow: Base skin tone + Blue + touch of Red",
        canvas_state: "Nose has dimensional form with clear light and shadow planes"
      },
      {
        coaching_point: "Paint the mouth with attention to the upper and lower lip's different values—the upper lip is usually darker. The corners of the mouth recede into shadow. Add a subtle highlight to the center of the lower lip where light hits.",
        common_mistakes: "Making lips too red or too defined with hard edges. Lips should blend naturally into the surrounding skin.",
        color_mixing: "Lips: Base skin + more Red + touch of Blue for depth. Highlight: Base skin + White",
        canvas_state: "Mouth has form with darker upper lip, lighter lower lip, and subtle highlight"
      },
      {
        coaching_point: "Block in the hair using broad strokes that follow the direction of hair growth. Don't paint individual hairs yet—focus on the overall shape and the darkest and lightest areas. Hair has shine and movement, which you capture through value contrast.",
        common_mistakes: "Trying to paint every strand of hair. Instead, paint hair in masses with highlights and shadows suggesting form and texture.",
        color_mixing: "Dark hair: Raw Umber + Ultramarine Blue. Highlights: Add White + Yellow to the base hair color",
        canvas_state: "Hair blocked in with directional strokes showing overall form and major light/dark areas"
      },
      {
        coaching_point: "Blend and soften the transitions between light and shadow on the face, especially on the cheeks, forehead, and around the eyes. Use a clean, slightly damp brush or a soft dry brush to gently merge adjacent colors. This is what creates smooth, realistic skin.",
        common_mistakes: "Over-blending everything into a smooth, flat surface with no dimension. Some edges should stay crisp (like the shadow under the chin), while others soften.",
        color_mixing: "No new mixing needed—use your existing colors and blend with a clean brush",
        canvas_state: "Face has smooth transitions between values while retaining dimensional form"
      },
      {
        coaching_point: "Add the brightest highlights to the high points of the face: the forehead, cheekbones, bridge and tip of the nose, and chin. These should be mixed lighter than anything else on the canvas. Use these sparingly—too many highlights flatten the form.",
        common_mistakes: "Adding white highlights everywhere. Highlights should only go where light directly hits raised surfaces.",
        color_mixing: "White + tiny touch of Yellow (warm highlight) or White + tiny touch of Blue (cool highlight, depending on lighting)",
        canvas_state: "Portrait has bright highlights on forehead, cheekbones, nose, and chin"
      },
      {
        coaching_point: "Refine edges and add final details like eyelashes, subtle texture in the skin, wisps of hair, and any jewelry or clothing. Step back frequently to assess the overall balance. Details should enhance, not overwhelm the portrait.",
        common_mistakes: "Adding too much detail, especially in areas that should remain soft and out of focus. Remember, not everything needs to be in sharp focus—your eye should be drawn to the face.",
        color_mixing: "Use your existing palette, possibly adding darker mixes for fine lines: Raw Umber + Blue for very dark details",
        canvas_state: "Portrait is complete with refined details, balanced values, and a cohesive focal point on the face"
      }
    ],
    firstMessage: "Welcome to your portrait painting session! 🎨 I'm so glad you chose this beautiful portrait reference to work with. Portraits can feel intimidating, but I'm here to guide you through every step with patience and encouragement.\n\nWe'll be working in acrylics, taking our time to build up this portrait layer by layer—just like the masters did. This session will take around 3-4 hours, but remember: there's no rush. The joy is in the journey of creating.\n\nBefore we begin, make sure you have your materials ready (check the Materials Guide on the left). Take a deep breath, and let's create something beautiful together. I'll be here to answer any questions as we go!\n\nReady to start with Step 1?"
  },

  'study10-1.jpg': {
    imageUrl: '/study10-1.jpg',
    imageName: 'Still Life Study',
    medium: 'Acrylic',
    estimatedTime: '2-3 hours',
    materialsGuide: `**Brushes Needed:**
- Medium flat brush (#8 or #10) for background and larger objects
- Small round brush (#4 or #6) for details
- Filbert brush for blending and soft edges

**Primary Colors:**
- Titanium White
- Cadmium Red
- Ultramarine Blue
- Cadmium Yellow
- Burnt Sienna
- Yellow Ochre

**Canvas:** 11x14" or 9x12" canvas panel`,
    coachPlan: [
      {
        coaching_point: "Sketch the basic composition lightly with a thin mix of neutral color. Focus on the overall shapes and placement of objects, not details. Use simple geometric forms—circles for round objects, rectangles for boxes. This gives you a roadmap for the painting ahead.",
        common_mistakes: "Drawing too small or cramming everything into one corner. Use the full canvas and leave breathing room around your objects.",
        color_mixing: "Burnt Sienna + Ultramarine Blue + lots of water (thin wash for sketching)",
        canvas_state: "Light sketch showing placement and basic shapes of still life objects"
      },
      {
        coaching_point: "Block in the background with a flat, even color. This establishes the space your objects sit in and helps you judge the values and colors of the objects themselves. Don't worry about making it perfect—you can refine later.",
        common_mistakes: "Leaving the background for last. Painting the background early helps you see the objects more clearly and creates cleaner edges.",
        color_mixing: "For neutral background: White + touch of Blue + touch of Burnt Sienna (adjust for warmth/coolness)",
        canvas_state: "Background filled in with a solid, even color surrounding the sketched objects"
      },
      {
        coaching_point: "Begin blocking in the darkest shadows on your objects using bold, confident strokes. Shadows anchor objects to the surface and create dimension. Look for the darkest darks in your reference and match that value—don't be shy about going dark.",
        common_mistakes: "Making shadows too light or too colorful. Shadows should be darker than you think and often have a cooler temperature.",
        color_mixing: "Ultramarine Blue + Burnt Sienna + touch of Red (creates a rich, dark neutral)",
        canvas_state: "Objects have dark shadow areas blocked in, creating initial sense of form"
      },
      {
        coaching_point: "Paint the mid-tone colors of your objects. This is the 'local color'—the actual color you see on the objects in average lighting. Apply these confidently with directional brush strokes that follow the form of each object.",
        common_mistakes: "Using the same color straight from the tube without adjusting for light and environment. Real colors are influenced by surrounding colors and lighting.",
        color_mixing: "Varies by object: For reds: Red + White + tiny Yellow. For yellows: Yellow + White. For earth tones: Yellow Ochre + White",
        canvas_state: "Objects have mid-tone colors blocked in, with clear separation from shadows"
      },
      {
        coaching_point: "Add the table or surface the objects sit on, paying attention to how it meets the background. This grounds your composition. Notice how the surface may be lighter or darker than the background, and how objects cast shadows onto it.",
        common_mistakes: "Making the table edge a hard, straight line. Real edges have variation and aren't perfectly straight or hard.",
        color_mixing: "For tabletop: Base background color + more White (or darker with Burnt Sienna), adjusted based on your reference",
        canvas_state: "Tabletop or surface painted in, grounding the objects in space"
      },
      {
        coaching_point: "Paint cast shadows on the table from your objects. These shadows should be cooler and slightly transparent, not pure black. They connect objects to the surface and add realism. Notice how shadows stretch and change shape based on the light source.",
        common_mistakes: "Making cast shadows too dark or too opaque. Cast shadows should allow some of the surface color to show through.",
        color_mixing: "Table color + Ultramarine Blue + touch of Burnt Sienna (keep it translucent by not adding too much paint)",
        canvas_state: "Cast shadows painted onto the table, connecting objects to the surface"
      },
      {
        coaching_point: "Add highlights to the objects where light directly hits them. These are your brightest values and should be saved for the very end or near-end of the painting. Use these sparingly—too many highlights flatten the form. Look for smooth, shiny surfaces that reflect light strongly.",
        common_mistakes: "Highlighting every object equally. Not all surfaces reflect light the same way—matte objects have softer highlights than glossy ones.",
        color_mixing: "Object's local color + lots of White + tiny touch of Yellow (for warm light) or Blue (for cool light)",
        canvas_state: "Objects have bright highlights on their lightest surfaces, creating shine and dimension"
      },
      {
        coaching_point: "Refine the edges between objects and the background. Some edges should be soft and blended (where objects recede or are out of focus), while others should be crisp and defined (where light hits and creates clear separation). This creates depth.",
        common_mistakes: "Making every edge the same sharpness. Varying edge quality is what makes a painting look sophisticated and three-dimensional.",
        color_mixing: "Use existing colors, blending wet-into-wet for soft edges, or using clean, decisive strokes for hard edges",
        canvas_state: "Edges are refined with a mix of soft and hard transitions, creating depth and focus"
      },
      {
        coaching_point: "Add reflected light to the shadow areas of objects. This is the subtle light that bounces from the table or nearby objects back into the shadows. It's lighter than the main shadow but darker than the mid-tones. This makes objects look more three-dimensional and natural.",
        common_mistakes: "Making reflected light too bright, which flattens the shadow. Reflected light should be subtle and stay within the shadow's value range.",
        color_mixing: "Shadow color + White + touch of the color being reflected (e.g., if the table is warm, add a warm tone)",
        canvas_state: "Shadow areas have subtle reflected light, making objects appear more rounded and realistic"
      },
      {
        coaching_point: "Final details and adjustments: step back and look at your painting from a distance. Add any small details like texture on fruit, reflections, or tiny highlights. Check your values by squinting—the darks should still read as dark, lights as light. Make any final tweaks to color temperature or value to unify the painting.",
        common_mistakes: "Over-working the painting by adding too many details. Sometimes less is more—know when to stop and call it complete.",
        color_mixing: "Use your existing palette. For fine details: thin your paint slightly with water for more control",
        canvas_state: "Still life complete with balanced values, colors, and thoughtful details bringing the composition together"
      }
    ],
    firstMessage: "Welcome to your still life painting session! 🍎 Still life paintings are a wonderful way to practice color mixing, value relationships, and creating the illusion of three-dimensional form on a flat canvas.\n\nWe'll be working in acrylics, building this painting step-by-step over the next 2-3 hours. I'll guide you through blocking in shapes, establishing shadows, and adding those final touches that bring everything to life.\n\nGather your materials (check the Materials Guide) and let's dive in. Remember, painting is as much about observation as it is about technique. Let's create something you'll be proud of!\n\nReady for Step 1?"
  },

  '3.jpg': {
    imageUrl: '/3.jpg',
    imageName: 'Landscape Study',
    medium: 'Acrylic',
    estimatedTime: '2.5-3.5 hours',
    materialsGuide: `**Brushes Needed:**
- Large flat brush (#12 or larger) for sky and large areas
- Medium flat brush (#8) for mid-sized areas like trees and ground
- Small round brush (#4) for details and branches
- Fan brush (optional) for foliage texture

**Primary Colors:**
- Titanium White
- Ultramarine Blue
- Cadmium Yellow
- Cadmium Red
- Burnt Sienna
- Yellow Ochre
- Sap Green (or mix Yellow + Blue)

**Canvas:** 11x14" or 16x20" canvas`,
    coachPlan: [
      {
        coaching_point: "Start by sketching the horizon line and major compositional elements—mountains, trees, and foreground. Use a thin, neutral wash to lightly indicate where everything will go. Keep it loose and simple. This is your compositional blueprint.",
        common_mistakes: "Placing the horizon line in the dead center of the canvas, which creates a static composition. Aim for the upper or lower third for more visual interest.",
        color_mixing: "Burnt Sienna + Ultramarine Blue + lots of water (thin wash for sketching)",
        canvas_state: "Light sketch showing horizon line, major landscape elements, and composition"
      },
      {
        coaching_point: "Paint the sky starting from the top and working downward. Skies are usually darker and more saturated at the top, gradually lightening toward the horizon. Work quickly while the paint is wet to blend the gradient smoothly. This creates atmospheric perspective and depth.",
        common_mistakes: "Making the sky one flat color or too dark overall. Real skies have variation and are often lighter near the horizon due to atmospheric haze.",
        color_mixing: "Top of sky: Ultramarine Blue + White. Horizon: White + tiny Blue + tiny Yellow (creates a pale, warm sky near the horizon)",
        canvas_state: "Sky painted with a gradient from darker blue at top to lighter, warmer blue near horizon"
      },
      {
        coaching_point: "Block in distant mountains or hills using cooler, lighter colors. Distant elements appear more blue and less detailed due to atmospheric perspective. Use broad, simple shapes without details. The farther away something is, the lighter and cooler it appears.",
        common_mistakes: "Making distant mountains too dark or too detailed. They should be soft and muted compared to foreground elements.",
        color_mixing: "Ultramarine Blue + White + tiny touch of Red (creates a soft, cool purple-blue for distant mountains)",
        canvas_state: "Distant mountains or hills blocked in with soft, cool, light values"
      },
      {
        coaching_point: "Paint the middle-ground elements like trees or fields using slightly warmer and darker values than the background. These should have more definition than the distant elements but still remain somewhat simplified. Build up the forms with broad strokes following the natural shapes.",
        common_mistakes: "Jumping straight to fine details. Keep middle-ground elements simplified and focus on overall shapes and values first.",
        color_mixing: "For greenery: Yellow + Blue + touch of White (adjust to create various greens). For earth: Yellow Ochre + Burnt Sienna + White",
        canvas_state: "Middle-ground elements like trees or fields blocked in with warmer, darker values than background"
      },
      {
        coaching_point: "Block in the foreground using the darkest and warmest colors in your painting. Foreground elements should have the most detail and strongest color saturation. This area anchors the viewer and creates depth by contrast with the lighter, cooler background.",
        common_mistakes: "Making the foreground the same value as the middle ground, which flattens the painting. Foreground should be noticeably darker and more saturated.",
        color_mixing: "Darker greens: Yellow + Blue + touch of Burnt Sienna. Darker earth: Burnt Sienna + Yellow Ochre + touch of Blue",
        canvas_state: "Foreground blocked in with dark, warm, saturated colors creating strong contrast with background"
      },
      {
        coaching_point: "Add shadows to your landscape elements—under trees, on the ground, on the sides of mountains. Shadows should be cooler in temperature and help define the forms. Notice how shadows anchor objects and create a sense of weight and dimension.",
        common_mistakes: "Making shadows pure black or the same temperature as the object casting them. Shadows should be cooler and have color variation.",
        color_mixing: "Base color + Ultramarine Blue + touch of Burnt Sienna (keep shadows cooler than the lit areas)",
        canvas_state: "Shadows added to trees, ground, and landscape features, creating form and dimension"
      },
      {
        coaching_point: "Begin adding texture to trees and foliage using a stippling or dabbing motion. Don't paint every leaf—suggest foliage through varied brushwork. Use different greens to show light hitting the tops of trees and shadows underneath. This layering creates depth within the foliage itself.",
        common_mistakes: "Using only one green or painting foliage too uniformly. Real trees have many shades of green and varied textures.",
        color_mixing: "Light foliage: Yellow + tiny Blue + White. Shadow foliage: Blue + Yellow + Burnt Sienna. Highlight: Yellow + White",
        canvas_state: "Trees and foliage have textured, varied greens showing light and shadow, creating realistic form"
      },
      {
        coaching_point: "Add details to the foreground like grasses, flowers, or texture in the dirt. Use a smaller brush and varied strokes—vertical flicks for grasses, dabs for flowers. These details should be most prominent in the foreground and fade as you move back in space.",
        common_mistakes: "Adding the same level of detail everywhere, which flattens the sense of depth. Keep details strongest in the foreground.",
        color_mixing: "For grasses: Yellow + Blue + White in varying ratios. For flowers: Red + White, Yellow + White, etc.",
        canvas_state: "Foreground has detailed grasses, flowers, or texture creating visual interest and depth"
      },
      {
        coaching_point: "Add highlights to the tops of trees, hills, and anywhere sunlight directly hits. These should be your lightest, warmest values in the painting. Use these strategically to guide the viewer's eye and create a sense of sunlight and atmosphere.",
        common_mistakes: "Highlighting everything evenly. Highlights should create a focal point and suggest a direction of light.",
        color_mixing: "Yellow + White + tiny touch of the base color (creates a warm, luminous highlight)",
        canvas_state: "Highlights added to tree tops, hills, and sunlit areas, creating a sense of light and atmosphere"
      },
      {
        coaching_point: "Final refinements: step back and evaluate the overall painting. Check that your values create depth (light background, darker foreground). Adjust any edges that are too harsh or too soft. Add any final details like distant birds, tree branches, or texture. Trust your instincts and know when the painting is complete.",
        common_mistakes: "Overworking the painting by adding unnecessary details. Sometimes a painting is stronger with less.",
        color_mixing: "Use existing palette colors for final adjustments and details",
        canvas_state: "Landscape complete with atmospheric perspective, varied textures, and a cohesive sense of depth and light"
      }
    ],
    firstMessage: "Welcome to your landscape painting session! 🌄 There's something so peaceful about painting the natural world—the rolling hills, the trees, the play of light across the land.\n\nWe'll be working in acrylics over the next 2.5-3.5 hours to capture this beautiful landscape. I'll guide you through building atmospheric perspective (that sense of depth where distant things look lighter and cooler), creating texture in foliage, and balancing your composition.\n\nGrab your materials (see the Materials Guide) and let's create a landscape you'll be proud to hang on your wall. Take a deep breath and enjoy the process!\n\nReady to start with Step 1?"
  }
};
