"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
// import { Hand } from "lucide-react"; // Removed - will be added back with chatbot later

// Image compression utility
async function compressImage(file: File, maxSizeBytes: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate new dimensions (max 2048px on longest side)
        let width = img.width;
        let height = img.height;
        const maxDimension = 2048;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Start with quality 0.85 and reduce if needed
        let quality = 0.85;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // If still too large and quality can be reduced, try again
              if (blob.size > maxSizeBytes && quality > 0.5) {
                quality -= 0.1;
                tryCompress();
                return;
              }

              // Create a new File from the blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };

        tryCompress();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

interface DashboardTabsProps {
  userWithProfile: {
    name: string;
    studentProfile?: {
      id: string;
      skillLevel: string;
      interests: string;
      bio: string | null;
    } | null;
  };
  activeView: "portfolio" | "new-artwork" | "critique" | "skills";
  onViewChange: (view: "portfolio" | "new-artwork" | "critique" | "skills") => void;
  onStartNewSession?: { current: any };
}

// Helper function to get color hex codes from paint names
const getColorHex = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    // Whites
    'titanium white': '#FFFFFF',
    'zinc white': '#F5F5F5',
    'white': '#FFFFFF',
    'pale white': '#FAFAFA',

    // Blacks
    'ivory black': '#292421',
    'mars black': '#1C1C1C',
    'black': '#000000',
    'dark black': '#0A0A0A',

    // Blues
    'ultramarine blue': '#4166F5',
    'cobalt blue': '#0047AB',
    'cerulean blue': '#2A52BE',
    'prussian blue': '#003153',
    'phthalo blue': '#000F89',
    'azure blue': '#007FFF',
    'deep blue': '#1E3A8A',
    'light blue': '#93C5FD',
    'pale blue': '#BFDBFE',
    'sky blue': '#87CEEB',
    'navy blue': '#1E3A5F',
    'blue': '#3B82F6',

    // Reds
    'cadmium red': '#E30022',
    'alizarin crimson': '#E32636',
    'vermilion': '#E34234',
    'scarlet': '#FF2400',
    'rose madder': '#E33638',
    'deep red': '#991B1B',
    'light red': '#FCA5A5',
    'pale red': '#FECACA',
    'red': '#EF4444',
    'brick red': '#CB4154',
    'dark red': '#7F1D1D',

    // Yellows
    'cadmium yellow': '#FFF600',
    'lemon yellow': '#FAFA33',
    'naples yellow': '#FADA5E',
    'yellow ochre': '#CC7722',
    'raw sienna': '#D68A59',
    'pale yellow': '#FEF9C3',
    'light yellow': '#FEF08A',
    'golden yellow': '#FACC15',
    'yellow': '#EAB308',
    'warm yellow': '#F59E0B',

    // Greens
    'phthalo green': '#123524',
    'viridian': '#40826D',
    'sap green': '#507D2A',
    'chromium oxide green': '#669900',
    'deep green': '#166534',
    'light green': '#86EFAC',
    'pale green': '#BBF7D0',
    'olive green': '#65A30D',
    'forest green': '#228B22',
    'green': '#22C55E',

    // Oranges and Browns
    'cadmium orange': '#FF6600',
    'burnt sienna': '#E97451',
    'burnt umber': '#8A3324',
    'raw umber': '#826644',
    'orange': '#F97316',
    'pale orange': '#FED7AA',
    'light orange': '#FDBA74',
    'deep orange': '#EA580C',
    'golden brown': '#996515',
    'light brown': '#A8856C',
    'dark brown': '#5D4037',
    'brown': '#92400E',
    'chocolate brown': '#7B3F00',
    'warm brown': '#8B5A2B',
    'earth brown': '#6B4423',
    'tan': '#D2B48C',
    'beige': '#F5F5DC',

    // Grays
    'warm gray': '#9CA3AF',
    'cool gray': '#94A3B8',
    'light gray': '#D1D5DB',
    'dark gray': '#4B5563',
    'pale gray': '#E5E7EB',
    'charcoal gray': '#36454F',
    'gray': '#6B7280',
    'neutral gray': '#808080',

    // Pinks
    'pink': '#EC4899',
    'pale pink': '#FBCFE8',
    'light pink': '#F9A8D4',
    'deep pink': '#BE185D',
    'rose pink': '#FB7185',
    'blush pink': '#FBB6CE',
    'salmon pink': '#FA8072',

    // Purples/Violets
    'dioxazine purple': '#5C3F70',
    'quinacridone magenta': '#8E3A59',
    'violet': '#8F00FF',
    'purple': '#A855F7',
    'deep purple': '#7E22CE',
    'light purple': '#D8B4FE',
    'pale purple': '#E9D5FF',
    'lavender': '#E6E6FA',
    'magenta': '#D946EF',

    // Creams and Skin Tones
    'cream': '#FFFDD0',
    'ivory': '#FFFFF0',
    'peach': '#FFCBA4',
    'flesh': '#FFCBA4',
    'skin tone': '#E8BEAC',
  };

  // Normalize the color name for lookup
  const normalized = colorName.toLowerCase().trim();

  // Try exact match first
  if (colorMap[normalized]) {
    return colorMap[normalized];
  }

  // Try partial match
  for (const [key, value] of Object.entries(colorMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  // Default to gray if color not found
  return '#999999';
};

export default function DashboardTabs({ userWithProfile, activeView, onViewChange, onStartNewSession }: DashboardTabsProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedMedium, setSelectedMedium] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'bot' | 'user', message: string}>>([]);
  const [userInput, setUserInput] = useState("");
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [coachingSessionId, setCoachingSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [paintingGuide, setPaintingGuide] = useState<any>(null);
  const [currentPaintingStep, setCurrentPaintingStep] = useState<number>(0);
  const [showSuppliesModal, setShowSuppliesModal] = useState<boolean>(false);
  const [showProductLinksModal, setShowProductLinksModal] = useState<boolean>(false);
  const [showSuppliesSection, setShowSuppliesSection] = useState<boolean>(true); // Expanded by default
  const [paintingComplete, setPaintingComplete] = useState<boolean>(false);
  const [showMaterialsOverview, setShowMaterialsOverview] = useState<boolean>(false); // Show materials first after analysis
  const [showMediumButtons, setShowMediumButtons] = useState<boolean>(false);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [showDuplicateMessage, setShowDuplicateMessage] = useState(false);
  const [artworkStatus, setArtworkStatus] = useState<"in-progress" | "complete" | null>(null);
  const [showCompleteConfirmation, setShowCompleteConfirmation] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
  const [showColorMixModal, setShowColorMixModal] = useState(false);
  const [selectedColorForMixing, setSelectedColorForMixing] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'thumbs-up' | 'thumbs-down' | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");

  // Critique feature state
  const [critiqueImage, setCritiqueImage] = useState<File | null>(null);
  const [critiquePreview, setCritiquePreview] = useState<string | null>(null);
  const [critiqueReferenceImage, setCritiqueReferenceImage] = useState<File | null>(null);
  const [critiqueReferencePreview, setCritiqueReferencePreview] = useState<string | null>(null);
  const [critiqueFeedback, setCritiqueFeedback] = useState<any>(null);
  const [selectedCritiqueCard, setSelectedCritiqueCard] = useState<string | null>(null);
  const [showTryThisNext, setShowTryThisNext] = useState(false);
  const [isLoadingCritique, setIsLoadingCritique] = useState(false);
  const [critiqueAnalyzing, setCritiqueAnalyzing] = useState(false);
  const [showReferenceSection, setShowReferenceSection] = useState(false);
  const [showUploadedImage, setShowUploadedImage] = useState(true);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [currentTipPage, setCurrentTipPage] = useState(0);
  const [activeSwipeScreen, setActiveSwipeScreen] = useState<'guidance' | 'chatbot'>('guidance');
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  // Chatbot removed - will be added back later
  const [isDragging, setIsDragging] = useState(false);
  const [artworkTitle, setArtworkTitle] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [progressImages, setProgressImages] = useState<string[]>([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);
  const [showVisualProgressGuide, setShowVisualProgressGuide] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const progressFileInputRef = useRef<HTMLInputElement>(null);
  // const tipChatEndRef = useRef<HTMLDivElement>(null); // Removed - will be added back with chatbot later
  const fileInputRef = useRef<HTMLInputElement>(null);
  const critiqueFileInputRef = useRef<HTMLInputElement>(null);
  const critiqueReferenceInputRef = useRef<HTMLInputElement>(null);

  // Store chat messages per session
  const sessionChatHistory = useRef<Map<string, Array<{role: 'bot' | 'user', message: string}>>>(new Map());
  const hasInitialized = useRef(false);

  // Helper to get supplies from paintingGuide (supports both old and new format)
  const getSupplies = () => {
    if (!paintingGuide) return null;
    return paintingGuide.supplies || paintingGuide.quickGuide?.supplies || null;
  };

  // Helper to extract all required colors including base colors needed for mixing
  const getAllRequiredColors = () => {
    const allColors = new Set<string>();

    // First, check for colors_needed from the coaching plan (AI-generated list of all colors used)
    const coachPlan = paintingGuide?.coachPlan;
    if (coachPlan && Array.isArray(coachPlan) && coachPlan.length > 0) {
      // Check if the first step or the plan itself has colors_needed
      const colorsNeeded = paintingGuide?.colors_needed || coachPlan[0]?.colors_needed;
      if (colorsNeeded && Array.isArray(colorsNeeded)) {
        colorsNeeded.forEach((color: string) => allColors.add(color));
      }
    }

    // Also add colors from supplies (fallback/additional colors)
    const supplies = getSupplies();
    if (supplies && supplies.paintColors) {
      supplies.paintColors.forEach((color: string) => {
        allColors.add(color);

        // Check if this color has a mixing recipe
        const recipe = colorMixingRecipes[color];
        if (recipe) {
          // Extract base colors from the recipe text
          // Recipe format: "Mix Color1 + Color2 + touch of Color3"
          const recipeText = recipe.recipe;

          // Check for each standard color in the recipe
          standardColors.forEach(standardColor => {
            if (recipeText.includes(standardColor)) {
              allColors.add(standardColor);
            }
          });

          // Also check for other named colors in the mixing recipes
          Object.keys(colorMixingRecipes).forEach(mixableColor => {
            if (recipeText.includes(mixableColor) && mixableColor !== color) {
              allColors.add(mixableColor);
            }
          });
        }
      });
    }

    // If no colors found, return empty array
    if (allColors.size === 0) return [];

    // Convert back to array and sort: standard colors first, then others
    const colorArray = Array.from(allColors);
    return colorArray.sort((a, b) => {
      const aIsStandard = isStandardColor(a);
      const bIsStandard = isStandardColor(b);
      if (aIsStandard && !bIsStandard) return -1;
      if (!aIsStandard && bIsStandard) return 1;
      return 0;
    });
  };

  // Helper to get product links from paintingGuide (supports both old and new format)
  const getProductLinks = () => {
    if (!paintingGuide) return null;
    return paintingGuide.productLinks || paintingGuide.quickGuide?.productLinks || null;
  };

  // Define standard/essential colors that users should buy
  const standardColors = [
    'Titanium White',
    'Cadmium Red',
    'Cadmium Yellow',
    'Ultramarine Blue',
    'Ivory Black'
  ];

  // Define mixing recipes for non-standard colors
  const colorMixingRecipes: { [key: string]: { recipe: string; description: string } } = {
    'Raw Umber': {
      recipe: 'Mix Burnt Sienna + Ultramarine Blue + touch of Ivory Black',
      description: 'A warm, earthy brown perfect for shadows and natural tones.'
    },
    'Burnt Sienna': {
      recipe: 'Mix Cadmium Red + Cadmium Yellow (2:1 ratio) + tiny touch of Ivory Black',
      description: 'A reddish-brown earth tone, great for warm shadows.'
    },
    'Yellow Ochre': {
      recipe: 'Mix Cadmium Yellow + tiny touch of Cadmium Red + tiny touch of Ivory Black',
      description: 'A muted, earthy yellow perfect for natural scenes.'
    },
    'Viridian Green': {
      recipe: 'Mix Ultramarine Blue + Cadmium Yellow + touch of Ivory Black',
      description: 'A deep, cool green ideal for foliage and landscapes.'
    },
    'Alizarin Crimson': {
      recipe: 'Mix Cadmium Red + tiny touch of Ultramarine Blue',
      description: 'A deep, cool red perfect for rich darks and florals.'
    },
    'Cobalt Blue': {
      recipe: 'Mix Ultramarine Blue + Titanium White (for lighter tone)',
      description: 'A lighter, cooler blue for skies and water.'
    },
    'Cerulean Blue': {
      recipe: 'Mix Ultramarine Blue + Titanium White + tiny touch of Cadmium Yellow',
      description: 'A soft, sky blue perfect for atmospheric effects.'
    },
    'Sap Green': {
      recipe: 'Mix Cadmium Yellow + Ultramarine Blue (1:1 ratio)',
      description: 'A natural, versatile green for landscapes.'
    },
    'Payne\'s Gray': {
      recipe: 'Mix Ultramarine Blue + Ivory Black + tiny touch of Cadmium Red',
      description: 'A cool, neutral gray for shadows and overcast skies.'
    }
  };

  // Individual Amazon affiliate links for each primary color
  const primaryColorAmazonLinks: { [key: string]: { url: string; label: string } } = {
    'Titanium White': {
      url: 'https://www.amazon.com/s?k=titanium+white+oil+paint&tag=brushatelier-20',
      label: 'Buy Titanium White'
    },
    'Cadmium Red': {
      url: 'https://www.amazon.com/s?k=cadmium+red+oil+paint&tag=brushatelier-20',
      label: 'Buy Cadmium Red'
    },
    'Cadmium Yellow': {
      url: 'https://www.amazon.com/s?k=cadmium+yellow+oil+paint&tag=brushatelier-20',
      label: 'Buy Cadmium Yellow'
    },
    'Ultramarine Blue': {
      url: 'https://www.amazon.com/s?k=ultramarine+blue+oil+paint&tag=brushatelier-20',
      label: 'Buy Ultramarine Blue'
    },
    'Ivory Black': {
      url: 'https://www.amazon.com/s?k=ivory+black+oil+paint&tag=brushatelier-20',
      label: 'Buy Ivory Black'
    }
  };

  // Get Amazon link for a specific primary color
  const getPrimaryColorLink = (colorName: string) => {
    const normalizedName = standardColors.find(std =>
      colorName.toLowerCase().includes(std.toLowerCase())
    );
    return normalizedName ? primaryColorAmazonLinks[normalizedName] : null;
  };

  // Check if a color is standard/essential
  const isStandardColor = (colorName: string): boolean => {
    return standardColors.some(std => colorName.toLowerCase().includes(std.toLowerCase()));
  };

  // Get mixing recipe for a color
  const getMixingRecipe = (colorName: string) => {
    // Check for exact match or partial match
    const exactMatch = colorMixingRecipes[colorName];
    if (exactMatch) return { colorName, ...exactMatch };

    // Check for partial matches
    for (const [key, value] of Object.entries(colorMixingRecipes)) {
      if (colorName.toLowerCase().includes(key.toLowerCase()) ||
          key.toLowerCase().includes(colorName.toLowerCase())) {
        return { colorName, ...value };
      }
    }

    // Default recipe for unknown colors
    return {
      colorName,
      recipe: 'This is a specialty color. Try mixing primary colors to approximate it.',
      description: 'Experiment with Cadmium Red, Cadmium Yellow, Ultramarine Blue, and Titanium White to create similar tones.'
    };
  };

  // Loading messages that rotate every 10 seconds
  const loadingMessages = [
    "Hang tight, almost there! We're preparing the final details of your lesson...",
    "Stay with us! Your personalized painting guide is being crafted...",
    "Just a moment longer! We're analyzing colors and techniques...",
    "Almost ready! Finalizing your step-by-step coaching plan...",
    "Putting the finishing touches on your lesson...",
    "Your custom painting guide is nearly complete...",
  ];


  const handleFeedback = (type: 'thumbs-up' | 'thumbs-down') => {
    setFeedbackType(type);
    setShowFeedbackModal(true);
  };

  const submitFeedback = async () => {
    try {
      // Send feedback to API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackType,
          message: feedbackComment,
          userName: userWithProfile.name,
          email: '', // Email not directly available in userWithProfile
          currentStep: currentTipPage,
          sessionId: coachingSessionId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Feedback sent successfully:', data);
      } else {
        console.error('Failed to send feedback:', data);
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
    }

    // Close modal and reset state
    setShowFeedbackModal(false);
    setFeedbackComment("");

    // Show success message
    alert('Thank you for your feedback!');
  };

  // Initialize chatbot with greeting only on first load (not when switching tabs or resuming)
  useEffect(() => {
    // Only set initial greeting if there are no messages yet AND we haven't initialized before
    if (chatMessages.length === 0 && !hasInitialized.current) {
      setChatMessages([{
        role: 'bot',
        message: "Hello! I'm your coach. Upload an image of any artwork you'd like to learn how to recreate, and I'll guide you through it step-by-step."
      }]);
      hasInitialized.current = true;
    }
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Load portfolio items when switching to portfolio view
  useEffect(() => {
    if (activeView === "portfolio") {
      loadPortfolioItems();
    }
    // Chatbot removed - will be added back later
  }, [activeView]);

  // Cleanup speech synthesis on unmount or page change
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);


  // Rotate loading messages every 10 seconds when analyzing
  useEffect(() => {
    if (isAnalyzing && progress >= 90) {
      const interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
      }, 10000); // 10 seconds

      return () => clearInterval(interval);
    } else {
      // Reset to first message when not in late-stage loading
      setLoadingMessageIndex(0);
    }
  }, [isAnalyzing, progress]);

  // Expose handleClearImage to parent via callback
  useEffect(() => {
    if (onStartNewSession) {
      // This is a bit of a hack, but we're passing the function reference up
      // In a real app, you might use useImperativeHandle with forwardRef
      (onStartNewSession as any).current = handleClearImage;
    }
  }, [onStartNewSession]);

  // Debug: Log paintingGuide changes
  useEffect(() => {
    console.log("🎨 paintingGuide state changed:", {
      hasPaintingGuide: !!paintingGuide,
      hasCoachPlan: !!paintingGuide?.coachPlan,
      coachPlanLength: paintingGuide?.coachPlan?.length,
      paintingGuideKeys: paintingGuide ? Object.keys(paintingGuide) : null
    });
  }, [paintingGuide]);

  // Poll for updated images in background
  useEffect(() => {
    if (!coachingSessionId || !paintingGuide) return;

    // Check if we already have all 3 milestone images
    const milestoneImages = paintingGuide.milestoneImages;
    const hasAllMilestones = milestoneImages?.sketch && milestoneImages?.underpainting && milestoneImages?.nearComplete;

    if (hasAllMilestones) return; // All milestone images are loaded

    console.log(`📡 Polling for milestone images...`);

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/coaching-session/refresh?session_id=${coachingSessionId}`);
        if (response.ok) {
          const data = await response.json();

          // Check if we got new milestone images
          const newMilestones = data.painting_guide?.milestoneImages;
          if (newMilestones && (newMilestones.sketch || newMilestones.underpainting || newMilestones.midStage || newMilestones.advanced || newMilestones.nearComplete)) {
            console.log(`✅ Found new milestone images! Updating...`);
            setPaintingGuide(data.painting_guide);

            // Stop polling if we have all 3 images
            if (newMilestones.sketch && newMilestones.underpainting && newMilestones.nearComplete) {
              clearInterval(pollInterval);
              console.log("🎉 All 3 milestone images loaded!");
            }
          }
        }
      } catch (error) {
        console.error("Error polling for milestone images:", error);
      }
    }, 5000); // Poll every 5 seconds

    // Stop polling after 5 minutes (3 images should be faster)
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      console.log("⏱️ Stopped polling for milestone images (timeout)");
    }, 300000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [coachingSessionId, paintingGuide]);

  // Trigger critique when image is uploaded
  useEffect(() => {
    if (critiquePreview && !critiqueFeedback && !isLoadingCritique) {
      // Simulate AI critique generation
      setIsLoadingCritique(true);
      setTimeout(() => {
        setCritiqueFeedback({
          composition: 'Your composition shows strong balance. The focal point is well-placed using the rule of thirds. Consider adding a bit more breathing room around the edges to enhance the sense of space.',
          likeness: 'The proportions are generally accurate. The features align well with the reference. Pay attention to subtle asymmetries that make portraits feel more natural and lifelike.',
          lighting: 'Good understanding of light direction. The shadows are consistent. To level up: try exaggerating the contrast between light and dark values by about 15-20% for more dramatic impact.',
          technique: 'Your brushwork shows confidence. The edges vary nicely between soft and hard. Next step: try building up your values more gradually in the mid-tones for smoother transitions.',
          encouragement: 'This is solid work! You\'re clearly developing your observational skills. The way you handled the light is particularly impressive. Keep pushing yourself with each piece.'
        });
        setIsLoadingCritique(false);
      }, 2000);
    }
  }, [critiquePreview, critiqueFeedback, isLoadingCritique]);

  const loadPortfolioItems = async () => {
    setIsLoadingPortfolio(true);
    try {
      const response = await fetch("/api/portfolio");
      const data = await response.json();
      if (response.ok) {
        setPortfolioItems(data.portfolioItems || []);
      }
    } catch (error) {
      console.error("Error loading portfolio:", error);
    } finally {
      setIsLoadingPortfolio(false);
    }
  };

  const handleAddToPortfolio = async () => {
    console.log("Add to Portfolio clicked!");
    console.log("previewUrl:", previewUrl);
    console.log("selectedMedium:", selectedMedium);

    if (!previewUrl) {
      alert("Please upload an image first");
      return;
    }

    // Check if this image is already in the portfolio
    const isDuplicate = portfolioItems.some(item => item.imageUrl === previewUrl);
    if (isDuplicate) {
      setShowDuplicateMessage(true);
      setTimeout(() => setShowDuplicateMessage(false), 3000);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("imageData", previewUrl);
      // Use selectedMedium if available, otherwise use a default
      formData.append("medium", selectedMedium || "Mixed Media");
      formData.append("title", selectedMedium ? `${selectedMedium} Artwork` : "Artwork");
      // Include coaching session ID if available
      if (coachingSessionId) {
        formData.append("sessionId", coachingSessionId);
      }

      const response = await fetch("/api/portfolio", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Portfolio API response:", data);

      if (response.ok) {
        // Show success message
        setShowAddedMessage(true);
        // Hide message after 3 seconds
        setTimeout(() => setShowAddedMessage(false), 3000);
        // Reload portfolio items
        await loadPortfolioItems();
      } else {
        alert(data.error || "Failed to add to portfolio");
      }
    } catch (error) {
      console.error("Error adding to portfolio:", error);
      alert("Failed to add to portfolio");
    }
  };

  // Handle progress image upload
  const handleProgressImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      setProgressImages(prev => [...prev, imageDataUrl]);
      setShowProgressModal(true);
    };
    reader.readAsDataURL(file);

    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const handleDeleteProgressImage = (index: number) => {
    setProgressImages(prev => prev.filter((_, i) => i !== index));
  };

  // Generate milestone images on-demand
  const handleGenerateMilestones = async () => {
    console.log('handleGenerateMilestones called', { coachingSessionId, isLoadingMilestones });

    if (!coachingSessionId) {
      console.error('Cannot generate milestones: No coaching session ID');
      setError('Unable to generate visual progress guide. Please try refreshing the page.');
      return;
    }

    if (isLoadingMilestones) {
      console.log('Already loading milestones, skipping');
      return;
    }

    setIsLoadingMilestones(true);
    setError(null);

    try {
      console.log('Fetching milestones for session:', coachingSessionId);
      const response = await fetch('/api/coaching-session/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: coachingSessionId })
      });

      const data = await response.json();
      console.log('Milestones API response:', { ok: response.ok, status: response.status, data });

      if (response.ok) {
        // Update the painting guide with the new milestone images
        if (data.milestoneImages && paintingGuide) {
          setPaintingGuide({
            ...paintingGuide,
            milestoneImages: data.milestoneImages
          });
          console.log('Milestone images updated successfully');
        }
      } else {
        console.error('Failed to generate milestone images:', data.error);
        setError(data.error || 'Failed to generate visual progress guide');
      }
    } catch (error) {
      console.error('Error generating milestones:', error);
      setError('Failed to generate visual progress guide. Please try again.');
    } finally {
      setIsLoadingMilestones(false);
    }
  };

  const handleDeleteClick = (portfolioId: string) => {
    setItemToDelete(portfolioId);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      // Find the item being deleted to check if it's the current session
      const itemBeingDeleted = portfolioItems.find(item => item.id === itemToDelete);

      const response = await fetch(`/api/portfolio?id=${itemToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        await loadPortfolioItems();
        setShowDeleteConfirmModal(false);
        setItemToDelete(null);

        // If the deleted item was the current session, clear the session
        if (itemBeingDeleted?.sessionId === coachingSessionId) {
          handleClearImage();
        }
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
      alert("Failed to delete");
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setItemToDelete(null);
  };

  const saveMediumSelectionMessages = async (sessionId: string, medium: string) => {
    try {
      // Get the current chat messages to find the medium selection messages
      const currentMessages = chatMessages;

      // Find the last 2 messages (user medium selection + bot response)
      // These are the messages that were added in handleMediumSelection
      const messagesToSave = currentMessages.slice(-2);

      // Save each message to the database via the chat API
      for (const msg of messagesToSave) {
        const formData = new FormData();
        formData.append("action", "save-message");
        formData.append("session_id", sessionId);
        formData.append("role", msg.role);
        formData.append("message", msg.message);

        await fetch("/api/coaching-session", {
          method: "POST",
          body: formData,
        });
      }
    } catch (error) {
      console.error("Error saving medium selection messages:", error);
    }
  };

  const handleResumeSession = async (sessionId: string, imageUrl: string) => {
    try {
      // Save current session's chat if exists
      if (coachingSessionId && chatMessages.length > 0) {
        sessionChatHistory.current.set(coachingSessionId, chatMessages);
      }

      // Load the session from database
      const response = await fetch(`/api/coaching-session/resume?sessionId=${sessionId}`);
      const data = await response.json();

      if (response.ok) {
        // Check if we have stored chat for this session in memory
        const storedChat = sessionChatHistory.current.get(data.sessionId);

        // Restore session state
        setCoachingSessionId(data.sessionId);
        setCurrentStep(data.currentStep);
        setTotalSteps(data.totalSteps);
        setPaintingGuide(data.paintingGuide);
        setEstimatedTime(data.estimatedTime);
        setSelectedMedium(data.medium);
        setArtworkStatus(data.artworkStatus);
        setShowMaterialsOverview(true); // Show materials overview first before painting lesson

        // Use stored chat if available (most recent), otherwise use from database
        // Replace any old greetings that mention "Om" and filter out the image confirmation message
        const chatHistory = (storedChat || data.chatHistory)
          .filter((msg: any) =>
            // Remove the "Perfect! I can see your image..." message
            !msg.message.includes("Perfect! I can see your image")
          )
          .map((msg: any) => ({
            ...msg,
            message: msg.message.replace("Hello! I'm your coach, Om.", "Hello! I'm your coach.")
          }));

        // Mark as initialized to prevent adding greeting message
        hasInitialized.current = true;
        setChatMessages(chatHistory);
        setPreviewUrl(imageUrl);

        // Load tip chat history if available
        // Build the tip messages array by finding pairs of user questions and coach responses
        const tipMessages: Array<{role: 'user' | 'coach', message: string}> = [];

        for (let i = 0; i < data.chatHistory.length; i++) {
          const msg = data.chatHistory[i];

          // Check if this is a tip question (user message with "painting technique:")
          if (msg.role === 'user' && msg.message.includes("painting technique:")) {
            // Extract the actual user question from the context message
            const match = msg.message.match(/They asked: "(.+?)"\./);
            if (match) {
              tipMessages.push({
                role: 'user',
                message: match[1]
              });

              // Look for the coach's response (next message with role 'bot' or 'coach')
              if (i + 1 < data.chatHistory.length && (data.chatHistory[i + 1].role === 'coach' || data.chatHistory[i + 1].role === 'bot')) {
                tipMessages.push({
                  role: 'coach',
                  message: data.chatHistory[i + 1].message
                });
              }
            }
          }
        }

        // Chatbot removed - will be added back later

        // Switch to new artwork view to show the coaching session
        onViewChange("new-artwork");
      } else {
        alert(data.error || "Failed to resume session");
      }
    } catch (error) {
      console.error("Error resuming session:", error);
      alert("Failed to resume session");
    }
  };

  const startCoachingSessionAutomatically = async (medium: string, fileToUpload?: File) => {
    console.log("=== STARTING COACHING SESSION AUTOMATICALLY ===");

    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    // Start progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        const next = prev + Math.random() * 15;
        return Math.min(next, 90); // Cap at 90% during loading
      });
    }, 500);

    try {
      const formData = new FormData();

      // Use the passed file or fall back to uploadedFile state
      const fileToUse = fileToUpload || uploadedFile;

      if (!fileToUse) {
        setError("Please upload an image");
        setIsAnalyzing(false);
        clearInterval(progressInterval);
        return;
      }

      formData.append("action", "create");
      formData.append("file", fileToUse);
      formData.append("medium", medium);
      formData.append("skillLevel", "intermediate");

      console.log("=== CREATING COACHING SESSION ===");
      const response = await fetch("/api/coaching-session", {
        method: "POST",
        body: formData,
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error("The image file may be too large. Please try a smaller image (under 5MB).");
      }

      const data = await response.json();
      console.log("=== API RESPONSE ===", data);
      console.log("Painting guide:", data.painting_guide);
      console.log("Painting guide type:", typeof data.painting_guide);
      console.log("Painting guide coachPlan:", data.painting_guide?.coachPlan);
      console.log("Painting guide coachPlan length:", data.painting_guide?.coachPlan?.length);
      console.log("Painting guide quickGuide:", data.painting_guide?.quickGuide);
      console.log("====================");

      if (response.ok) {
        setProgress(100);
        setCoachingSessionId(data.session_id);
        setCurrentStep(data.step);
        setTotalSteps(data.total_steps);

        // Ensure painting guide is set correctly
        if (data.painting_guide) {
          console.log("✅ Setting painting guide with coachPlan length:", data.painting_guide.coachPlan?.length);
          setPaintingGuide(data.painting_guide);
        } else {
          console.error("⚠️ No painting_guide in API response!");
        }

        setEstimatedTime(data.estimated_time || null);
        setArtworkTitle(data.artwork_title || null);
        console.log("State after setting paintingGuide:", data.painting_guide);
        console.log("Estimated time:", data.estimated_time);

        // Save medium selection messages to database
        await saveMediumSelectionMessages(data.session_id, medium);

        // Reload portfolio to show the new session
        await loadPortfolioItems();

        setTimeout(() => {
          // Set first coaching message (replace any previous chat)
          setChatMessages([
            { role: 'bot', message: data.message }
          ]);
          setIsAnalyzing(false);
          setShowMaterialsOverview(true); // Show materials overview first
          setProgress(0);
          setArtworkStatus("in-progress");
        }, 500);
      } else {
        setError(data.error || "Failed to start coaching session");
        setIsAnalyzing(false);
        clearInterval(progressInterval);
      }
    } catch (error) {
      console.error("=== ERROR starting coaching session ===", error);
      setError(`Error: ${error instanceof Error ? error.message : "Something went wrong"}`);
      setIsAnalyzing(false);
      clearInterval(progressInterval);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleReferenceImageClick = async (imageName: string) => {
    console.log("=== LOADING REFERENCE IMAGE SESSION ===", imageName);

    // Switch to the New Artwork tab to show the loading and results
    onViewChange("new-artwork");

    // Set the preview URL IMMEDIATELY so the UI switches from upload screen to analyzing screen
    setPreviewUrl(`/${imageName}`);

    // Show loading state
    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    // Progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        const next = prev + Math.random() * 15;
        return Math.min(next, 95);
      });
    }, 300);

    try {
      // Call the regenerate-reference-lessons API endpoint
      // This endpoint doesn't require authentication and uses the public image path
      console.log("📡 Calling API with:", { imageFile: imageName, medium: 'Acrylic', skillLevel: 'beginner' });

      const apiResponse = await fetch('/api/regenerate-reference-lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageFile: imageName,
          medium: 'Acrylic',
          skillLevel: 'beginner'
        })
      });

      console.log("📡 API Response status:", apiResponse.status);

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({ error: 'Unknown error' }));
        console.error("❌ API Error:", errorData);
        throw new Error(errorData.error || 'Failed to generate lesson for reference image');
      }

      const result = await apiResponse.json();
      console.log("✅ API Result received:", result);

      clearInterval(progressInterval);
      setProgress(100);

      // Set session state with the new session ID from API
      setCoachingSessionId(result.session_id);
      setCurrentStep(0);
      setTotalSteps(result.painting_guide?.steps?.length || 0);
      setSelectedMedium('Acrylic');

      // Use the new painting guide format from API
      setPaintingGuide(result.painting_guide);
      setEstimatedTime(result.estimated_time);
      setArtworkTitle(result.artwork_title);

      setTimeout(() => {
        // Set first coaching message
        setChatMessages([
          { role: 'bot', message: result.message }
        ]);
        setIsAnalyzing(false);
        setShowMaterialsOverview(true);
        setProgress(0);
        setArtworkStatus("in-progress");
      }, 300);

      // Add reference image to portfolio with session info and painting guide
      try {
        const portfolioResponse = await fetch('/api/add-to-portfolio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: `/${imageName}`,
            title: result.artwork_title,
            sessionId: result.session_id,
            artworkStatus: 'in-progress',
            paintingGuide: result.painting_guide
          })
        });

        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json();
          // Update the local session ID if it was converted to a real session
          if (portfolioData.sessionId && portfolioData.sessionId !== result.session_id) {
            setCoachingSessionId(portfolioData.sessionId);
            console.log(`✅ Session converted to real ID: ${portfolioData.sessionId}`);
          }
          console.log("✅ Reference image added to portfolio with session info");
        }
      } catch (portfolioError) {
        console.error("Failed to add to portfolio (non-fatal):", portfolioError);
        // Don't block the user if portfolio add fails
      }

      console.log("✅ Reference image loaded successfully");
    } catch (error: any) {
      console.error("=== ERROR loading reference image ===", error);
      clearInterval(progressInterval);
      setError(`Failed to load reference image: ${error?.message || "Something went wrong"}`);
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      let file = e.target.files[0];

      // Compress image if it exceeds 5MB
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError(`Image is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Compressing...`);
        try {
          file = await compressImage(file, maxSize);
          setError(null); // Clear error after successful compression
        } catch (compressionError) {
          setError("Failed to compress image. Please try a smaller image.");
          return;
        }
      }
      setUploadedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        setPreviewUrl(reader.result as string);

        // Automatically select Acrylic and start coaching session
        const defaultMedium = 'Acrylic';
        setSelectedMedium(defaultMedium);
        setShowMediumButtons(false);
        setWaitingForConfirmation(false);

        // Set initial message (clear any previous chat)
        setChatMessages([
          {
            role: 'bot',
            message: "Perfect! I can see your image. Let me prepare your personalized Acrylic coaching session. This will just take a moment..."
          }
        ]);

        // Clear tip chat history for new session

        // Start coaching session automatically with the uploaded file
        // Pass the file directly to avoid race condition with state updates
        await startCoachingSessionAutomatically(defaultMedium, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      let file = files[0];

      // Compress image if it exceeds 5MB
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError(`Image is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Compressing...`);
        try {
          file = await compressImage(file, maxSize);
          setError(null); // Clear error after successful compression
        } catch (compressionError) {
          setError("Failed to compress image. Please try a smaller image.");
          return;
        }
      }

      setUploadedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        setPreviewUrl(reader.result as string);

        // Automatically select Acrylic and start coaching session
        const defaultMedium = 'Acrylic';
        setSelectedMedium(defaultMedium);
        setShowMediumButtons(false);
        setWaitingForConfirmation(false);

        // Set initial message (clear any previous chat)
        setChatMessages([
          {
            role: 'bot',
            message: "Perfect! I can see your image. Let me prepare your personalized Acrylic coaching session. This will just take a moment..."
          }
        ]);

        // Clear tip chat history for new session

        // Start coaching session automatically with the uploaded file
        await startCoachingSessionAutomatically(defaultMedium, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    // Save current session's chat before clearing
    if (coachingSessionId && chatMessages.length > 0) {
      sessionChatHistory.current.set(coachingSessionId, chatMessages);
    }

    setPreviewUrl(null);
    setUploadedFile(null);
    setAnalysis(null);
    setError(null);
    setChatMessages([{
      role: 'bot',
      message: "Hello! I'm your coach. Upload an image of any artwork you'd like to learn how to recreate, and I'll guide you through it step-by-step."
    }]);
    setSelectedMedium(null);
    setWaitingForConfirmation(false);
    setUserInput("");
    setCoachingSessionId(null);
    setCurrentStep(0);
    setTotalSteps(0);
    setPaintingGuide(null);
    setCurrentPaintingStep(0);
    setShowSuppliesModal(false);
    setPaintingComplete(false);
    setProgress(0);
    setIsAnalyzing(false);
    setArtworkStatus(null);
    setEstimatedTime(null);
    setShowSuppliesModal(false);
    setCurrentTipPage(0); // Reset guidance pagination
    setArtworkTitle(null); // Clear artwork title
    setShowMaterialsOverview(false); // Reset materials overview
    setProgressImages([]); // Clear progress photos for new session
    setShowProgressModal(false);

    // Switch to Art Coaching view
    onViewChange("new-artwork");
  };

  const handleMarkAsComplete = async () => {
    if (!coachingSessionId) return;

    try {
      // Update session status in database
      const response = await fetch("/api/coaching-session/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: coachingSessionId,
        }),
      });

      if (response.ok) {
        setArtworkStatus("complete");
        setShowCompleteConfirmation(false);
        setChatMessages(prev => [
          ...prev,
          { role: 'bot', message: "Congratulations on completing your artwork! 🎉 I'd love to see how it turned out. Feel free to add it to your portfolio!" }
        ]);
        // Reload portfolio to update status if user switches to portfolio view
        await loadPortfolioItems();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to mark as complete");
      }
    } catch (error) {
      console.error("Error marking as complete:", error);
      alert("Failed to mark as complete");
    }
  };

  const handleMediumSelection = async (medium: string) => {
    setShowMediumButtons(false);

    if (medium === 'recommend') {
      // User selected "I don't know" - recommend Acrylic
      setSelectedMedium('Acrylic');
      setChatMessages(prev => [
        ...prev,
        { role: 'user', message: "I don't know" },
        { role: 'bot', message: "I recommend Acrylic paints for this piece! Acrylics are versatile, beginner-friendly, and work well for most styles. They dry quickly and are easy to work with. Let me prepare your personalized Acrylic coaching session..." }
      ]);
      await startCoachingSessionAutomatically('Acrylic');
    } else {
      // User selected a specific medium
      setSelectedMedium(medium);
      setChatMessages(prev => [
        ...prev,
        { role: 'user', message: medium },
        { role: 'bot', message: `Great choice! Let me prepare your personalized ${medium} coaching session. This will just take a moment...` }
      ]);
      await startCoachingSessionAutomatically(medium);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const message = userInput.trim();
    setUserInput("");

    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', message }]);

    // Handle medium selection
    if (waitingForConfirmation && !selectedMedium) {
      const lowerMessage = message.toLowerCase();
      let chosenMedium = '';

      // Check if user wants a recommendation
      const wantsRecommendation = lowerMessage.includes("don't know") ||
                                   lowerMessage.includes("dont know") ||
                                   lowerMessage.includes("not sure") ||
                                   lowerMessage.includes("recommend") ||
                                   lowerMessage.includes("suggest") ||
                                   lowerMessage.includes("you choose") ||
                                   lowerMessage.includes("pick for me") ||
                                   lowerMessage.includes("what do you think");

      if (wantsRecommendation) {
        // Default recommendation: Acrylic (most beginner-friendly, versatile, and forgiving)
        chosenMedium = 'Acrylic';
        setSelectedMedium('Acrylic');
        setChatMessages(prev => [
          ...prev,
          { role: 'bot', message: "I recommend Acrylic paints for this piece! Acrylics are versatile, beginner-friendly, and work well for most styles. They dry quickly and are easy to work with. Let me prepare your personalized Acrylic coaching session..." }
        ]);
      } else if (lowerMessage.includes('watercolor')) {
        chosenMedium = 'Watercolor';
        setSelectedMedium('Watercolor');
        setChatMessages(prev => [
          ...prev,
          { role: 'bot', message: "Great choice! Let me prepare your personalized Watercolor coaching session. This will just take a moment..." }
        ]);
      } else if (lowerMessage.includes('acrylic')) {
        chosenMedium = 'Acrylic';
        setSelectedMedium('Acrylic');
        setChatMessages(prev => [
          ...prev,
          { role: 'bot', message: "Excellent! Let me prepare your personalized Acrylic coaching session. This will just take a moment..." }
        ]);
      } else if (lowerMessage.includes('oil')) {
        chosenMedium = 'Oil Paints';
        setSelectedMedium('Oil Paints');
        setChatMessages(prev => [
          ...prev,
          { role: 'bot', message: "Perfect! Let me prepare your personalized Oil Paints coaching session. This will just take a moment..." }
        ]);
      } else {
        setChatMessages(prev => [
          ...prev,
          { role: 'bot', message: "I didn't catch that. Please choose one of these mediums: Watercolor, Acrylic, or Oil Paints. (Or say 'recommend' if you'd like me to suggest one!)" }
        ]);
        return;
      }

      setWaitingForConfirmation(false);

      // Automatically start the coaching session
      setTimeout(() => {
        startCoachingSessionAutomatically(chosenMedium);
      }, 500);

      return;
    }

    // Continue coaching session
    if (coachingSessionId) {
      try {
        const formData = new FormData();
        formData.append("action", "continue");
        formData.append("session_id", coachingSessionId);
        formData.append("message", message);

        const response = await fetch("/api/coaching-session", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setChatMessages(prev => [
            ...prev,
            { role: 'bot', message: data.message }
          ]);
          setCurrentStep(data.step);
        } else {
          setChatMessages(prev => [
            ...prev,
            { role: 'bot', message: "Sorry, I had trouble processing that. Could you try again?" }
          ]);
        }
      } catch (error) {
        console.error("Error continuing session:", error);
        setChatMessages(prev => [
          ...prev,
          { role: 'bot', message: "Sorry, something went wrong. Let's continue..." }
        ]);
      }
    }
  };

  // Chatbot removed - will be added back later

  // Handle ESC key to close zoom modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showImageZoom) {
        setShowImageZoom(false);
        setZoomedImageUrl(null);
      }
    };

    if (showImageZoom) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showImageZoom]);

  return (
    <div>
        {activeView === "new-artwork" && (
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl shadow-sm w-full max-w-full">

            {!previewUrl ? (
              <div className="flex flex-col items-center justify-center max-w-4xl mx-auto">
                {/* Upload Image Prompt with Drag & Drop */}
                <div
                    className={`w-full border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                      isDragging
                        ? 'border-[#2563EB] bg-[#2563EB]/5 scale-[1.02]'
                        : 'border-gray-300 hover:border-[#2563EB]/50 hover:bg-gray-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <div className="flex flex-col items-center gap-4">
                      <div className={`transition-all ${isDragging ? 'scale-110' : ''}`}>
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1F2933] mb-2">
                          {isDragging ? 'Drop your image here' : 'Upload Your Reference Image'}
                        </h3>
                        <p className="text-sm text-[#1F2933]/70">
                          {isDragging ? 'Release to upload' : 'Drag and drop an image, or click to browse'}
                        </p>
                      </div>
                      {!isDragging && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-3 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-[#1D4ED8] transition-all shadow-md"
                        >
                          Choose Image
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Our Recommendations Section */}
                  <div className="w-full max-w-4xl mx-auto mt-8">
                  <h3 className="text-xl font-bold text-[#1F2933] mb-4">Our Recommendations</h3>
                  <p className="text-sm text-[#1F2933]/70 mb-4">
                    Not sure what to paint? Try one of these curated reference images to get started.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Sample Reference 1 - jenston.jpeg */}
                    <button
                      onClick={() => handleReferenceImageClick('jenston.jpeg')}
                      className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#2563EB] transition-all shadow-sm hover:shadow-md"
                    >
                      <Image
                        src="/jenston.jpeg"
                        alt="Portrait reference"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                    </button>

                    {/* Sample Reference 2 - study10-1.jpg */}
                    <button
                      onClick={() => handleReferenceImageClick('study10-1.jpg')}
                      className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#2563EB] transition-all shadow-sm hover:shadow-md"
                    >
                      <Image
                        src="/study10-1.jpg"
                        alt="Still life reference"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                    </button>

                    {/* Sample Reference 3 - 3.jpg */}
                    <button
                      onClick={() => handleReferenceImageClick('3.jpg')}
                      className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#2563EB] transition-all shadow-sm hover:shadow-md"
                    >
                      <Image
                        src="/3.jpg"
                        alt="Landscape reference"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div id="resizable-container" className="flex gap-0 h-[calc(100vh-8rem)] w-full relative">
                  {/* Left Column - Reference Image + Materials */}
                  <div
                    className="space-y-4 bg-white/50 p-4 rounded-lg flex flex-col w-1/3 min-w-[250px]"
                  >
                    <div className="space-y-3">
                      {/* AI-Generated Artwork Title */}
                      {artworkTitle && (
                        <div className="px-2">
                          <h3 className="text-lg font-bold text-[#1F2933] text-center">{artworkTitle}</h3>
                        </div>
                      )}

                      {/* Reference Image Section */}
                      {showUploadedImage && (
                        <div className="space-y-2">
                          <div className="relative rounded-lg overflow-hidden group flex-shrink-0">
                            <Image
                              src={previewUrl}
                              alt="Reference"
                              width={800}
                              height={600}
                              className="w-full h-auto max-h-[calc(100vh-20rem)] object-contain"
                            />
                            {/* Control buttons overlay */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Zoom button */}
                            <button
                              onClick={() => setShowImageZoom(true)}
                              className="bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg transition-all shadow-lg"
                              title="Zoom in for details"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                              </svg>
                            </button>
                            {/* Minimize button */}
                            <button
                              onClick={() => setShowUploadedImage(false)}
                              className="bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg transition-all shadow-lg"
                              title="Minimize image"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </button>
                          </div>
                          </div>

                          {/* Paint Colors - Two rows: Primary and Non-Primary */}
                          {!showMaterialsOverview && paintingGuide && getSupplies() && (
                            <div className="px-2 mt-3 space-y-2">
                              {/* Primary Colors Row */}
                              {(() => {
                                const primaryColors = getAllRequiredColors().filter((color: string) => isStandardColor(color));
                                return primaryColors.length > 0 && (
                                  <div>
                                    <div className="text-[10px] font-semibold text-[#1F2933]/60 mb-1 px-1">Primary Colors</div>
                                    <div className="flex flex-wrap gap-2">
                                      {primaryColors.map((color: string, index: number) => (
                                        <button
                                          key={index}
                                          onClick={() => {
                                            setSelectedColorForMixing(color);
                                            setShowColorMixModal(true);
                                          }}
                                          className="group relative"
                                          title={`${color} - Primary Color`}
                                        >
                                          <div
                                            className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-blue-500 transition-all cursor-pointer hover:scale-110 shadow-sm"
                                            style={{ backgroundColor: getColorHex(color) }}
                                          />
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg min-w-max">
                                            <div className="font-semibold text-center text-[10px]">{color}</div>
                                            <div className="text-[9px] text-gray-300 text-center">Primary Color</div>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Non-Primary Colors Row */}
                              {(() => {
                                const nonPrimaryColors = getAllRequiredColors().filter((color: string) => !isStandardColor(color));
                                return nonPrimaryColors.length > 0 && (
                                  <div>
                                    <div className="text-[10px] font-semibold text-[#1F2933]/60 mb-1 px-1">Additional Colors</div>
                                    <div className="flex flex-wrap gap-2">
                                      {nonPrimaryColors.map((color: string, index: number) => (
                                        <button
                                          key={index}
                                          onClick={() => {
                                            setSelectedColorForMixing(color);
                                            setShowColorMixModal(true);
                                          }}
                                          className="group relative"
                                          title={`${color} - Click for mixing guide`}
                                        >
                                          <div
                                            className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-purple-500 transition-all cursor-pointer hover:scale-110 shadow-sm"
                                            style={{ backgroundColor: getColorHex(color) }}
                                          />
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg min-w-max">
                                            <div className="font-semibold text-center text-[10px]">{color}</div>
                                            <div className="text-[9px] text-gray-300 text-center">Click for mixing</div>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {/* Other Supplies Button */}
                          {!showMaterialsOverview && paintingGuide && getSupplies() && (
                            <div className="px-2 mt-3">
                              <button
                                onClick={() => setShowSuppliesModal(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-[#2563EB] text-[#2563EB] hover:bg-blue-50 rounded-lg transition-all"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                                </svg>
                                <span className="text-sm font-semibold">Other Supplies</span>
                              </button>
                            </div>
                          )}

                        </div>
                      )}

                      {/* Show image button when minimized */}
                      {!showUploadedImage && (
                        <button
                          onClick={() => setShowUploadedImage(true)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#1F2933]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                          <span className="text-xs font-medium text-[#1F2933]">Show Reference</span>
                        </button>
                      )}

                    </div>

                    {/* Secondary Actions - De-emphasized */}
                    <div className="mt-4 pt-4">
                      <p className="text-xs text-[#1F2933]/50 mb-2 font-medium" style={{ display: 'none' }}>After you finish:</p>
                      <div className="grid grid-cols-2 gap-2" style={{ display: 'none' }}>
                        <button
                          onClick={handleAddToPortfolio}
                          className="bg-gray-100 text-[#1F2933]/70 px-4 py-2 rounded-lg text-xs font-medium hover:bg-[#2563EB] hover:text-white transition-all"
                        >
                          Save to Portfolio
                        </button>
                        <button
                          onClick={() => onViewChange("portfolio")}
                          className="bg-gray-100 text-[#1F2933]/70 px-4 py-2 rounded-lg text-xs font-medium hover:bg-[#1F2933] hover:text-white transition-all"
                        >
                          View Portfolio
                        </button>
                      </div>
                      {showAddedMessage && (
                        <div className="mt-2 p-2 bg-[#6B8E6E]/10 border border-[#6B8E6E]/30 rounded-lg">
                          <p className="text-xs text-green-800 text-center font-medium">✓ Added to portfolio!</p>
                        </div>
                      )}
                      {showDuplicateMessage && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800 text-center font-medium">⚠ Already in your portfolio!</p>
                        </div>
                      )}
                    </div>

                    {/* Color Mixing Modal */}
                    {showColorMixModal && selectedColorForMixing && (
                      <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowColorMixModal(false)}
                      >
                        <div
                          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Modal Header */}
                          <div className="px-8 py-5 rounded-t-xl border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div
                                  className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-md"
                                  style={{ backgroundColor: getColorHex(selectedColorForMixing) }}
                                />
                                <div>
                                  <h3 className="text-2xl font-bold text-gray-900">
                                    {selectedColorForMixing}
                                  </h3>
                                  {isStandardColor(selectedColorForMixing) ? (
                                    <p className="text-sm text-gray-600">Essential Color</p>
                                  ) : (
                                    <p className="text-sm text-gray-600">Mixing Guide</p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => setShowColorMixModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors text-3xl leading-none"
                              >
                                ×
                              </button>
                            </div>
                          </div>

                          {/* Modal Content */}
                          <div className="p-8">
                            {isStandardColor(selectedColorForMixing) ? (
                              <div className="space-y-5">
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-r-lg">
                                  <div className="flex items-start gap-4">
                                    <span className="text-3xl">🎨</span>
                                    <div className="flex-1">
                                      <h4 className="font-bold text-gray-900 mb-2 text-lg">Essential Color</h4>
                                      <p className="text-base text-gray-700 leading-relaxed mb-4">
                                        This is a basic, essential color that you should have in your paint kit.
                                        We recommend purchasing {selectedColorForMixing} as it's
                                        a foundational color used in most paintings.
                                      </p>
                                      {(() => {
                                        const individualColorLink = getPrimaryColorLink(selectedColorForMixing);
                                        return individualColorLink && (
                                          <a
                                            href={individualColorLink.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF9900] hover:bg-[#FF9900]/90 text-white rounded-lg transition-all text-sm font-semibold"
                                          >
                                            <img src="/amazon_icon.webp" alt="Amazon" className="w-5 h-5" />
                                            {individualColorLink.label} on Amazon
                                          </a>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg">
                                  <p className="text-sm text-gray-700">
                                    <strong>Pro Tip:</strong> Titanium White is the most used color in painting.
                                    Invest in a larger tube of high-quality Titanium White along with the primary colors
                                    (Cadmium Red, Cadmium Yellow, Ultramarine Blue) and Ivory Black.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-5">
                                <div className="bg-purple-50 border-l-4 border-purple-400 p-5 rounded-r-lg">
                                  <div className="flex items-start gap-4">
                                    <span className="text-3xl">🎨</span>
                                    <div className="flex-1">
                                      <h4 className="font-bold text-gray-900 mb-3 text-lg">How to Mix This Color</h4>
                                      <p className="text-base text-gray-700 leading-relaxed font-medium mb-4">
                                        {getMixingRecipe(selectedColorForMixing).recipe}
                                      </p>
                                      {(() => {
                                        const nonPrimaryProductLink = getProductLinks()?.find((p: any) => p.category === 'paintColors' && !p.isPrimary);
                                        return nonPrimaryProductLink && (
                                          <a
                                            href={nonPrimaryProductLink.amazonUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF9900] hover:bg-[#FF9900]/90 text-white rounded-lg transition-all text-sm font-semibold"
                                          >
                                            <img src="/amazon_icon.webp" alt="Amazon" className="w-5 h-5" />
                                            Buy from Amazon
                                          </a>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                                  <p className="text-base text-gray-700 leading-relaxed">
                                    {getMixingRecipe(selectedColorForMixing).description}
                                  </p>
                                </div>

                                <div className="bg-green-50 border border-green-200 p-5 rounded-lg">
                                  <p className="text-sm text-gray-700">
                                    <strong>Mixing Tip:</strong> Start with small amounts and gradually add colors.
                                    It's easier to darken a color than to lighten it. Always mix more than you think
                                    you'll need - it's hard to recreate the exact same shade later!
                                  </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 p-5 rounded-lg">
                                  <p className="text-sm text-gray-700">
                                    <strong>Prefer not to mix?</strong> You can also purchase {selectedColorForMixing} directly
                                    if you'd rather have it ready-made. Many artists keep both
                                    mixed and pre-made colors in their palette!
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Product Links Modal */}
                    {showProductLinksModal && getProductLinks() && (
                      <div
                        className="fixed inset-0 bg-[#FBF7F2]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowProductLinksModal(false)}
                      >
                        <div
                          className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Modal Header */}
                          <div className="sticky top-0 bg-gradient-to-r from-[#2563EB] to-[#C5D629] px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-bold text-[#1F2933] flex items-center gap-2">
                                🛒 Recommended Supplies
                              </h3>
                              <button
                                onClick={() => setShowProductLinksModal(false)}
                                className="text-[#1F2933] hover:text-[#1F2933] transition-colors text-2xl leading-none"
                              >
                                ×
                              </button>
                            </div>
                            <p className="text-xs text-[#1F2933] mt-1">
                              High-quality products to help you create this artwork
                            </p>
                          </div>

                          {/* Modal Content */}
                          <div className="p-6">
                            <div className="space-y-3">
                              {getProductLinks()!.map((product: any, index: number) => (
                                <a
                                  key={index}
                                  href={product.amazonUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block bg-gray-50 rounded-lg p-4 hover:shadow-md hover:bg-white transition-all border border-gray-200 hover:border-[#2563EB]"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-[#1F2933] mb-1">{product.name}</p>
                                      <p className="text-xs text-[#1F2933]/70 capitalize">
                                        {product.category.replace(/([A-Z])/g, ' $1').trim()}
                                      </p>
                                    </div>
                                    <div className="ml-4 flex items-center gap-1 text-[#2563EB] font-semibold text-sm">
                                      View <span className="text-lg">→</span>
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </div>

                            {/* Affiliate Disclosure */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                              <p className="text-xs text-[#1F2933]/50 italic leading-relaxed">
                                * These are affiliate links. Purchasing through them supports Brush Atelier at no extra cost to you. We only recommend products we believe will help you create great art.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Center Column - Guidance */}
                  <div
                    className="flex-1 flex flex-col gap-4 bg-blue-50/30 px-4 py-4 overflow-y-auto"
                  >

                    {/* Analyzing Progress */}
                    {isAnalyzing && (
                      <div className="flex flex-col items-center justify-center h-full gap-4">
                        {/* Creative waiting message */}
                        <div className="text-center max-w-lg px-4">
                          <p className="text-base text-gray-700 leading-relaxed font-medium">
                            ⏱️ This can take up to 2 minutes. Perfect time to grab a coffee ☕, get a snack 🍪, or do some stretches! 🧘
                          </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                          <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-blue-600 animate-pulse">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                              </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#1F2933]">Analyzing Your Reference</h3>
                            {progress >= 90 && (
                              <p className="text-sm text-blue-600 font-medium mt-3 animate-pulse">
                                {loadingMessages[loadingMessageIndex]}
                              </p>
                            )}
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm font-medium text-[#1F2933]">
                              <span>Progress</span>
                              <span>{Math.min(Math.round(progress), 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Materials Overview Screen - Shows first after analysis */}
                    {showMaterialsOverview && paintingGuide && getSupplies() && (
                      <div className="flex items-center justify-center h-full">
                        <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl w-full">
                          {/* Header */}
                          <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-blue-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                              </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-[#1F2933] mb-2">Materials Needed</h3>
                            <p className="text-sm text-[#1F2933]/70">Gather these supplies before starting your painting</p>
                          </div>

                          {/* Materials Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {/* Paint Colors */}
                            <div className="p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">🎨</span>
                                <h5 className="font-bold text-[#1F2933]">Paint Colors</h5>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {getAllRequiredColors().map((color: string, index: number) => (
                                  <div
                                    key={index}
                                    className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-500 transition-all cursor-pointer hover:scale-110 relative group"
                                    style={{ backgroundColor: getColorHex(color) }}
                                    onClick={() => {
                                      setSelectedColorForMixing(color);
                                      setShowColorMixModal(true);
                                    }}
                                  >
                                    {/* Tooltip on hover - positioned to avoid cutoff */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg min-w-max">
                                      <div className="font-semibold text-center">{color}</div>
                                      <div className="text-[10px] text-gray-300 mt-0.5 text-center">
                                        {isStandardColor(color) ? 'Primary Color' : 'Click for mixing guide'}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Brushes */}
                            <div className="p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">🖌️</span>
                                <h5 className="font-bold text-[#1F2933]">Brushes</h5>
                              </div>
                              <ul className="space-y-1">
                                {getSupplies()!.brushes.map((brush: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2 text-xs text-[#1F2933]">
                                    <span className="text-gray-400 mt-0.5">•</span>
                                    <span>{brush}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Other Materials */}
                            <div className="p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">✨</span>
                                <h5 className="font-bold text-[#1F2933]">Other Materials</h5>
                              </div>
                              <ul className="space-y-1">
                                {getSupplies()!.otherMaterials.map((material: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2 text-xs text-[#1F2933]">
                                    <span className="text-gray-400 mt-0.5">•</span>
                                    <span>{material}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Call to Action Button */}
                          <div className="text-center">
                            <button
                              onClick={() => setShowMaterialsOverview(false)}
                              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-3 rounded-full font-bold text-base transition-all shadow-lg hover:shadow-xl"
                            >
                              Take Me to My Painting Lesson
                            </button>
                            <p className="text-xs text-[#1F2933]/60 mt-3">
                              We will show you this materials information as part of our lesson too
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Guidance Section - Shows 2 tips at a time */}
                    {(() => {
                      console.log('Guidance Section Check:', {
                        hasPaintingGuide: !!paintingGuide,
                        hasCoachPlan: !!paintingGuide?.coachPlan,
                        coachPlanLength: paintingGuide?.coachPlan?.length,
                        paintingGuideKeys: paintingGuide ? Object.keys(paintingGuide) : null,
                        fullPaintingGuide: paintingGuide
                      });
                      return null;
                    })()}
                    {!showMaterialsOverview && paintingGuide && paintingGuide.coachPlan && paintingGuide.coachPlan.length > 0 && (
                      <div className="bg-white rounded-lg border-2 border-gray-200 p-4 mt-4 overflow-hidden flex-1 flex flex-col">
                        {/* Guidance Content */}
                        <div className="relative flex-1 flex flex-col">
                          <div className="flex-1 flex flex-col h-full">
                              {/* Phase Label with Navigation and Feedback Buttons */}
                              <div className="mb-3 flex items-center justify-between">
                                <span className="text-base font-bold text-[#1F2933]">
                                  {paintingGuide.coachPlan[currentTipPage].focus_area}
                                </span>
                                <div className="flex items-center gap-3">
                                  {/* Navigation Arrows */}
                                  <div className="flex items-center gap-1">
                                    {/* Back to Start Icon */}
                                    <button
                                      onClick={() => setCurrentTipPage(0)}
                                      disabled={currentTipPage === 0}
                                      className={`p-1 rounded-lg transition-all ${
                                        currentTipPage === 0
                                          ? 'text-gray-300 cursor-not-allowed'
                                          : 'text-[#1F2933]/60 hover:text-[#1F2933] hover:bg-gray-100'
                                      }`}
                                      title="Back to start"
                                      aria-label="Back to start"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                                      </svg>
                                    </button>

                                    {/* Previous Icon */}
                                    <button
                                      onClick={() => setCurrentTipPage(Math.max(0, currentTipPage - 1))}
                                      disabled={currentTipPage === 0}
                                      className={`p-1 rounded-lg transition-all ${
                                        currentTipPage === 0
                                          ? 'text-gray-300 cursor-not-allowed'
                                          : 'text-[#1F2933]/60 hover:text-[#1F2933] hover:bg-gray-100'
                                      }`}
                                      title="Previous"
                                      aria-label="Previous"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                      </svg>
                                    </button>

                                    {/* Page Indicator */}
                                    <span className="text-xs text-[#1F2933]/60 min-w-[45px] text-center">
                                      {currentTipPage + 1} / {paintingGuide.coachPlan.length}
                                    </span>

                                    {/* Next Icon */}
                                    <button
                                      onClick={() => setCurrentTipPage(Math.min(paintingGuide.coachPlan.length - 1, currentTipPage + 1))}
                                      disabled={currentTipPage === paintingGuide.coachPlan.length - 1}
                                      className={`p-1 rounded-lg transition-all ${
                                        currentTipPage === paintingGuide.coachPlan.length - 1
                                          ? 'text-gray-300 cursor-not-allowed'
                                          : 'text-[#1F2933]/60 hover:text-[#1F2933] hover:bg-gray-100'
                                      }`}
                                      title="Next"
                                      aria-label="Next"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                      </svg>
                                    </button>
                                  </div>

                                  {/* Separator */}
                                  <div className="w-px h-5 bg-gray-300"></div>

                                  {/* Feedback Buttons */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleFeedback('thumbs-up')}
                                      className="p-1 rounded-lg transition-all text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                      title="This lesson is helpful"
                                      aria-label="Thumbs up"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleFeedback('thumbs-down')}
                                      className="p-1 rounded-lg transition-all text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                      title="This lesson needs improvement"
                                      aria-label="Thumbs down"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Caution - Above coaching instructions (only show if unique from previous steps) */}
                              {(() => {
                                const currentCaution = paintingGuide.coachPlan[currentTipPage].common_mistakes;
                                if (!currentCaution) return null;

                                // Check if this caution appeared in any previous step
                                const previousCautions = paintingGuide.coachPlan
                                  .slice(0, currentTipPage)
                                  .map((step: { common_mistakes?: string }) => step.common_mistakes?.toLowerCase().trim());
                                const isDuplicate = previousCautions.includes(currentCaution.toLowerCase().trim());

                                if (isDuplicate) return null;

                                return (
                                  <div className="mb-4">
                                    <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg flex items-start gap-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-900 flex-shrink-0 mt-0.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                      </svg>
                                      <p className="text-sm text-red-800 leading-relaxed">
                                        <span className="font-bold text-red-900">Caution: </span>
                                        {currentCaution}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Coaching Point - Displayed as bullets */}
                              <div className="mb-4">
                                <ul className="space-y-1">
                                  {paintingGuide.coachPlan[currentTipPage].coaching_point
                                    .split(/(?<=[.!?])\s+/)
                                    .filter((sentence: string) => sentence.trim().length > 0)
                                    .map((sentence: string, idx: number) => (
                                      <li key={idx} className="flex items-start gap-1.5 text-base text-[#1F2933] leading-snug">
                                        <span className="text-[#2563EB] mt-0.5 flex-shrink-0">•</span>
                                        <span>{sentence.trim()}</span>
                                      </li>
                                    ))
                                  }
                                </ul>

                                {/* Recommended Tool and Save Progress - Same row */}
                                <div className="flex items-center justify-between mt-3">
                                  {paintingGuide.coachPlan[currentTipPage].recommended_brush && (
                                    <p className="text-base text-[#1F2933] leading-relaxed">
                                      <span className="font-semibold text-green-800">Recommended Tool: </span>
                                      {paintingGuide.coachPlan[currentTipPage].recommended_brush}
                                    </p>
                                  )}

                                  {/* Save / Show Progress Button */}
                                  <button
                                    onClick={() => progressImages.length > 0 ? setShowProgressModal(true) : progressFileInputRef.current?.click()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#1D4ED8] bg-[#DBEAFE] hover:bg-[#BFDBFE] rounded-lg transition-colors"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                    </svg>
                                    {progressImages.length > 0 ? `My Progress (${progressImages.length})` : 'Save My Progress'}
                                  </button>
                                  <input
                                    type="file"
                                    ref={progressFileInputRef}
                                    onChange={handleProgressImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                  />
                                </div>
                              </div>

                              {/* Milestone Images - Visual Progress Guide */}
                              <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-bold text-[#1F2933]">Visual Progress Guide</h4>
                                  {paintingGuide.milestoneImages?.sketch && (
                                    <button
                                      onClick={() => setShowVisualProgressGuide(!showVisualProgressGuide)}
                                      className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                      {showVisualProgressGuide ? 'Hide' : 'Show'}
                                    </button>
                                  )}
                                </div>
                                {paintingGuide.milestoneImages?.sketch ? (
                                  showVisualProgressGuide && (
                                    <div className="grid grid-cols-3 gap-3">
                                      {paintingGuide.milestoneImages.sketch && (
                                        <div
                                          className="bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors relative group"
                                          onClick={() => {
                                            setZoomedImageUrl(paintingGuide.milestoneImages.sketch);
                                            setShowImageZoom(true);
                                          }}
                                        >
                                          <img
                                            src={paintingGuide.milestoneImages.sketch}
                                            alt="Sketch"
                                            className="w-full h-auto object-cover"
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                                            </svg>
                                          </div>
                                        </div>
                                      )}
                                      {paintingGuide.milestoneImages.underpainting && (
                                        <div
                                          className="bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors relative group"
                                          onClick={() => {
                                            setZoomedImageUrl(paintingGuide.milestoneImages.underpainting);
                                            setShowImageZoom(true);
                                          }}
                                        >
                                          <img
                                            src={paintingGuide.milestoneImages.underpainting}
                                            alt="Wash"
                                            className="w-full h-auto object-cover"
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                                            </svg>
                                          </div>
                                        </div>
                                      )}
                                      {paintingGuide.milestoneImages.nearComplete && (
                                        <div
                                          className="bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors relative group"
                                          onClick={() => {
                                            setZoomedImageUrl(paintingGuide.milestoneImages.nearComplete);
                                            setShowImageZoom(true);
                                          }}
                                        >
                                          <img
                                            src={paintingGuide.milestoneImages.nearComplete}
                                            alt="Mid-Stage"
                                            className="w-full h-auto object-cover"
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                                            </svg>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )
                                ) : (
                                  <button
                                    onClick={handleGenerateMilestones}
                                    disabled={isLoadingMilestones}
                                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#2563EB] hover:bg-[#2563EB]/5 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isLoadingMilestones ? (
                                      <>
                                        <svg className="animate-spin h-6 w-6 text-[#2563EB]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="text-sm text-[#1F2933]/70">Generating progress images...</span>
                                      </>
                                    ) : (
                                      <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                        <span className="text-sm font-medium text-[#1F2933]/70">Generate Visual Progress Guide</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>

                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Far Right Column - AI Coach - Hidden during active painting */}
                  {false && (
                    <div
                      className="border-2 border-gray-200 rounded-lg p-4 flex flex-col overflow-hidden bg-green-50/30 ml-4"
                      style={{ width: '33.33%', minWidth: '300px' }}
                    >
                      {/* Chat Messages - Guided Studio Session */}
                      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                        {chatMessages.map((msg, index) => {
                          if (msg.role === 'user') {
                            // User message
                            return (
                              <div key={index} className="flex justify-end">
                                <div className="max-w-[80%]">
                                  <div className="bg-white px-3 py-2 rounded-2xl rounded-tr-sm border border-gray-200 shadow-sm">
                                    <div className="whitespace-pre-wrap text-sm font-medium leading-snug text-gray-900">
                                      {msg.message}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          } else {
                            // Coach message
                            return (
                              <div key={index} className="flex justify-start">
                                <div className="max-w-[85%]">
                                  <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm">
                                    <div className="whitespace-pre-wrap text-sm font-medium leading-snug text-gray-900">
                                      {msg.message}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        })}

                        {/* Medium Selection Buttons */}
                        {showMediumButtons && (
                          <div className="flex flex-col items-center gap-3 my-4">
                            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                              <button
                                onClick={() => handleMediumSelection('Watercolor')}
                                className="bg-[#2563EB] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#1D4ED8] transition-all shadow-sm hover:shadow-md text-sm"
                              >
                                Watercolor
                              </button>
                              <button
                                onClick={() => handleMediumSelection('Acrylic')}
                                className="bg-[#2563EB] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#1D4ED8] transition-all shadow-sm hover:shadow-md text-sm"
                              >
                                Acrylic
                              </button>
                              <button
                                onClick={() => handleMediumSelection('Oil Paints')}
                                className="bg-[#2563EB] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#1D4ED8] transition-all shadow-sm hover:shadow-md text-sm"
                              >
                                Oil Paints
                              </button>
                              <button
                                onClick={() => handleMediumSelection('recommend')}
                                className="bg-gray-200 text-[#1F2933] px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all shadow-sm hover:shadow-md text-sm"
                              >
                                I don't know
                              </button>
                            </div>
                          </div>
                        )}

                        <div ref={chatEndRef} />
                      </div>

                      {/* Loading State */}
                      {isAnalyzing && (
                        <div className="mb-4 flex items-center justify-center gap-3 px-6 py-3">
                          <svg className="animate-spin h-5 w-5 text-[#1F2933]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm font-medium text-[#1F2933]">Creating Your Painting Plan...</span>
                        </div>
                      )}

                      {/* Chat Input */}
                      {!isAnalyzing && (
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                          <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#2563EB] text-[#1F2933]"
                          />
                          <button
                            type="submit"
                            className="px-6 py-2 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1D4ED8] transition-all"
                          >
                            Send
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeView === "portfolio" && (
          <div>
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl shadow-sm">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-[#1F2933]">My Portfolio</h3>
              </div>

              {isLoadingPortfolio ? (
                <div className="text-center py-12">
                  <p className="text-[#1F2933]/70">Loading your portfolio...</p>
                </div>
              ) : portfolioItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-[#1F2933]/70 mb-2">Your portfolio is empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                      <div className="relative aspect-square bg-gray-100">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-[#1F2933] mb-1">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-[#1F2933]/70 mb-2">{item.description}</p>
                        )}

                        {/* Show resume button if session is in progress */}
                        {item.sessionId && item.artworkStatus === 'in-progress' && (
                          <div className="mb-3">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleResumeSession(item.sessionId, item.imageUrl);
                              }}
                              className="w-full bg-[#2563EB] hover:bg-[#3B82F6] text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                              type="button"
                            >
                              Resume Session
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#1F2933]/50">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteClick(item.id);
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors p-1 cursor-pointer"
                            title="Delete from portfolio"
                            type="button"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 pointer-events-none">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      {/* Complete Confirmation Modal */}
      {showCompleteConfirmation && (
        <div
          className="fixed inset-0 bg-[#FBF7F2]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCompleteConfirmation(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-[#1F2933] mb-2">Mark as Complete?</h3>
              <p className="text-[#1F2933]/70">
                Are you finished with this artwork? This will mark your session as complete.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCompleteConfirmation(false)}
                className="px-6 py-2.5 rounded-lg font-medium text-[#1F2933] border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                Not Yet
              </button>
              <button
                onClick={handleMarkAsComplete}
                className="px-6 py-2.5 rounded-lg font-semibold text-[#1F2933] bg-green-600 hover:bg-green-700 transition-all shadow-sm"
              >
                Yes, I'm Done!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Images Modal */}
      {showProgressModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowProgressModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#1F2933]">My Progress</h3>
              <button
                onClick={() => setShowProgressModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              {progressImages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">No progress photos yet</p>
                  <button
                    onClick={() => progressFileInputRef.current?.click()}
                    className="px-4 py-2 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1D4ED8] transition-colors"
                  >
                    Upload Your First Photo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {progressImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Progress ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          onClick={() => {
                            setZoomedImageUrl(img);
                            setShowImageZoom(true);
                          }}
                        />
                        <button
                          onClick={() => handleDeleteProgressImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Delete this photo"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          Photo {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => progressFileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 text-[#2563EB] hover:bg-[#2563EB]/10 rounded-lg font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Photo
              </button>
              <button
                onClick={() => setShowProgressModal(false)}
                className="px-6 py-2 bg-gray-100 text-[#1F2933] rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant AI Critique View */}
      {activeView === "critique" && (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl shadow-sm">
          {!critiquePreview ? (
            /* Initial Upload Screen - No images uploaded yet */
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-[#1F2933] mb-3">Instant AI Critique</h3>
                <p className="text-lg text-[#1F2933]/70 italic">
                  Take a breath. Let's look at this together.
                </p>
              </div>

              <div className="border-2 border-dashed border-[#2563EB]/30 rounded-xl p-12 text-center hover:border-[#2563EB]/50 transition-colors bg-gradient-to-br from-blue-50/30 to-purple-50/30">
                <input
                  ref={critiqueFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCritiqueImage(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCritiquePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => critiqueFileInputRef.current?.click()}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-[#1D4ED8] transition-all shadow-md hover:shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Upload Your Artwork
                </button>
                <p className="mt-4 text-sm text-[#1F2933]/60">
                  PNG, JPG up to 10MB (Required)
                </p>
              </div>

              {/* Optional Reference Image Upload */}
              <div className="mt-8">
                <h4 className="text-base font-semibold text-[#1F2933] mb-4 text-center">
                  Reference Image (Optional)
                </h4>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors bg-gray-50/30">
                  <input
                    ref={critiqueReferenceInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCritiqueReferenceImage(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setCritiqueReferencePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  {!critiqueReferencePreview ? (
                    <>
                      <p className="text-sm text-[#1F2933]/70 mb-4">
                        Upload a reference image you're trying to replicate
                      </p>
                      <button
                        onClick={() => critiqueReferenceInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1F2933] border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        Upload Reference Image
                      </button>
                    </>
                  ) : (
                    <div className="relative inline-block">
                      <img src={critiqueReferencePreview} alt="Reference" className="max-h-40 rounded-lg shadow-sm" />
                      <button
                        onClick={() => {
                          setCritiqueReferenceImage(null);
                          setCritiqueReferencePreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        aria-label="Remove reference image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <p className="mt-3 text-xs text-[#1F2933]/50">
                    This helps the AI compare your work to what you're studying
                  </p>
                </div>
              </div>
            </div>
          ) : critiquePreview && !critiqueFeedback && !critiqueAnalyzing ? (
            /* Preview Screen - Images uploaded, ready to submit */
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-[#1F2933] mb-3">Review Your Uploads</h3>
                <p className="text-lg text-[#1F2933]/70">
                  Ready to get your critique?
                </p>
              </div>

              <div className={`grid ${critiqueReferencePreview ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-8 mb-8`}>
                {/* User's Artwork */}
                <div>
                  <h4 className="text-lg font-semibold text-[#1F2933] mb-3">Your Artwork</h4>
                  <div className="relative">
                    <img src={critiquePreview} alt="Your artwork" className="w-full rounded-lg shadow-md" />
                    <button
                      onClick={() => {
                        setCritiquePreview(null);
                        setCritiqueImage(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                      aria-label="Remove artwork"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Reference Image (if uploaded) */}
                {critiqueReferencePreview && (
                  <div>
                    <h4 className="text-lg font-semibold text-[#1F2933] mb-3">Reference Image</h4>
                    <div className="relative">
                      <img src={critiqueReferencePreview} alt="Reference" className="w-full rounded-lg shadow-md" />
                      <button
                        onClick={() => {
                          setCritiqueReferenceImage(null);
                          setCritiqueReferencePreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                        aria-label="Remove reference image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setCritiquePreview(null);
                    setCritiqueImage(null);
                    setCritiqueReferenceImage(null);
                    setCritiqueReferencePreview(null);
                  }}
                  className="px-6 py-3 bg-white text-[#1F2933] border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Start Over
                </button>
                <button
                  onClick={async () => {
                    setCritiqueAnalyzing(true);
                    // TODO: Call API to get critique
                    // For now, this will trigger the analyzing state
                  }}
                  className="px-8 py-3 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-[#1D4ED8] transition-all shadow-md hover:shadow-lg"
                >
                  Get Critique
                </button>
              </div>
            </div>
          ) : critiqueAnalyzing && !critiqueFeedback ? (
            /* Loading/Analyzing Screen */
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <img src={critiquePreview} alt="Your artwork" className="w-full rounded-lg shadow-md" />
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2563EB] border-t-transparent mb-4"></div>
                    <p className="text-lg font-medium text-[#1F2933]">Analyzing your artwork...</p>
                    <p className="text-sm text-[#1F2933]/60 mt-2">This will take just a moment</p>
                  </div>
                </div>
              </div>
            </div>
          ) : !showTryThisNext ? (
            /* Feedback Cards Screen */
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#1F2933]">Your Feedback</h3>
                  <p className="text-[#1F2933]/60 mt-1">Select a category to see detailed feedback</p>
                </div>
                <button
                  onClick={() => {
                    setCritiquePreview(null);
                    setCritiqueImage(null);
                    setCritiqueFeedback(null);
                    setSelectedCritiqueCard(null);
                  }}
                  className="text-[#1F2933]/70 hover:text-[#2563EB] transition-colors text-sm font-medium"
                >
                  ← Start Over
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Left: Image */}
                <div className="col-span-1">
                  <img src={critiquePreview} alt="Your artwork" className="w-full rounded-lg shadow-md sticky top-4" />
                </div>

                {/* Right: Feedback Cards */}
                <div className="col-span-2 space-y-4">
                  {[
                    { id: 'composition', title: 'Composition & Balance', icon: '⚖️', feedback: critiqueFeedback?.composition || 'Great balance in your composition. The focal point draws the eye naturally.' },
                    { id: 'likeness', title: 'Likeness / Accuracy', icon: '🎯', feedback: critiqueFeedback?.likeness || 'Strong accuracy in proportions and key features.' },
                    { id: 'lighting', title: 'Lighting & Color', icon: '💡', feedback: critiqueFeedback?.lighting || 'Nice use of light and shadow. The color palette is cohesive.' },
                    { id: 'technique', title: 'Technique & Brushwork', icon: '🖌️', feedback: critiqueFeedback?.technique || 'Your brushwork shows confidence and control.' },
                    { id: 'encouragement', title: 'Encouragement', icon: '✨', feedback: critiqueFeedback?.encouragement || 'You\'re making real progress! Keep exploring and refining your unique style.' }
                  ].map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setSelectedCritiqueCard(card.id === selectedCritiqueCard ? null : card.id)}
                      className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                        selectedCritiqueCard === card.id
                          ? 'border-[#2563EB] bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-[#2563EB]/50 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{card.icon}</span>
                          <h4 className="font-bold text-[#1F2933]">{card.title}</h4>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className={`w-5 h-5 transition-transform ${selectedCritiqueCard === card.id ? 'rotate-180' : ''}`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                      {selectedCritiqueCard === card.id && (
                        <p className="text-base text-[#1F2933]/80 mt-3 leading-relaxed">
                          {card.feedback}
                        </p>
                      )}
                    </button>
                  ))}

                  <button
                    onClick={() => setShowTryThisNext(true)}
                    className="w-full mt-6 px-6 py-4 bg-[#2563EB] text-white rounded-lg font-bold hover:bg-[#1D4ED8] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Try This Next</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Try This Next Screen */
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#1F2933]">Try This Next</h3>
                  <p className="text-[#1F2933]/60 mt-1">Quick wins to level up (10-20 minutes)</p>
                </div>
                <button
                  onClick={() => setShowTryThisNext(false)}
                  className="text-[#1F2933]/70 hover:text-[#2563EB] transition-colors text-sm font-medium"
                >
                  ← Back to Feedback
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Left: Image */}
                <div>
                  <img src={critiquePreview} alt="Your artwork" className="w-full rounded-lg shadow-md sticky top-4" />
                </div>

                {/* Right: Checklist */}
                <div className="space-y-4">
                  {[
                    'Darken the background value by ~10–15%',
                    'Add a single stronger highlight on the focal area',
                    'Flip the canvas horizontally and check balance'
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-[#2563EB]/50 transition-colors"
                    >
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="mt-1 w-5 h-5 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                        />
                        <span className="text-base text-[#1F2933] font-medium group-hover:text-[#2563EB] transition-colors">
                          {item}
                        </span>
                      </label>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      setCritiquePreview(null);
                      setCritiqueImage(null);
                      setCritiqueFeedback(null);
                      setSelectedCritiqueCard(null);
                      setShowTryThisNext(false);
                    }}
                    className="w-full mt-6 px-6 py-3 bg-white text-[#1F2933] border-2 border-[#2563EB] rounded-lg font-semibold hover:bg-blue-50 transition-all"
                  >
                    Critique Another Artwork
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skills View */}
      {activeView === "skills" && (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl shadow-sm">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1F2933] mb-2">Your Skills Progress</h3>
              <p className="text-[#1F2933]/70">
                Track your artistic development across key painting fundamentals
              </p>
            </div>

            {/* Skills Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Composition Skill */}
              <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#2563EB]/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-[#1F2933] mb-1">Composition</h4>
                    <p className="text-sm text-[#1F2933]/60">Arrangement & balance</p>
                  </div>
                  <div className="bg-gray-200 text-[#1F2933]/70 px-3 py-1 rounded-full text-sm font-semibold">
                    Level 1 - Beginner
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-[#1F2933]/70 mb-2">
                    <span>Progress</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#2563EB] h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <p className="text-sm text-[#1F2933]/70">
                  Complete coaching sessions to start tracking your composition skills
                </p>
              </div>

              {/* Color Theory Skill */}
              <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#2563EB]/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-[#1F2933] mb-1">Color Theory</h4>
                    <p className="text-sm text-[#1F2933]/60">Mixing & harmony</p>
                  </div>
                  <div className="bg-gray-200 text-[#1F2933]/70 px-3 py-1 rounded-full text-sm font-semibold">
                    Level 1 - Beginner
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-[#1F2933]/70 mb-2">
                    <span>Progress</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#2563EB] h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <p className="text-sm text-[#1F2933]/70">
                  Complete coaching sessions to start tracking your color theory skills
                </p>
              </div>

              {/* Value & Lighting Skill */}
              <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#2563EB]/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-[#1F2933] mb-1">Value & Lighting</h4>
                    <p className="text-sm text-[#1F2933]/60">Light, shadow & contrast</p>
                  </div>
                  <div className="bg-gray-200 text-[#1F2933]/70 px-3 py-1 rounded-full text-sm font-semibold">
                    Level 1 - Beginner
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-[#1F2933]/70 mb-2">
                    <span>Progress</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#2563EB] h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <p className="text-sm text-[#1F2933]/70">
                  Complete coaching sessions to start tracking your value & lighting skills
                </p>
              </div>

              {/* Brushwork & Technique Skill */}
              <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#2563EB]/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-[#1F2933] mb-1">Brushwork & Technique</h4>
                    <p className="text-sm text-[#1F2933]/60">Application & edges</p>
                  </div>
                  <div className="bg-gray-200 text-[#1F2933]/70 px-3 py-1 rounded-full text-sm font-semibold">
                    Level 1 - Beginner
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-[#1F2933]/70 mb-2">
                    <span>Progress</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#2563EB] h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <p className="text-sm text-[#1F2933]/70">
                  Complete coaching sessions to start tracking your brushwork & technique skills
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div
          className="fixed inset-0 bg-[#FBF7F2]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-[#1F2933] mb-2">Delete Artwork?</h3>
              <p className="text-[#1F2933]/70">
                Are you sure you want to delete this artwork from your portfolio? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-6 py-2.5 rounded-lg font-medium text-[#1F2933] border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-lg font-semibold text-[#1F2933] bg-red-600 hover:bg-red-700 transition-all shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other Supplies Modal */}
      {showSuppliesModal && getSupplies() && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowSuppliesModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-8 py-5 rounded-t-xl border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Other Supplies</h3>
                    <p className="text-sm text-gray-600">Brushes and materials you'll need</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSuppliesModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-3xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content - Only brushes and materials, NO colors */}
            <div className="p-8 space-y-5">
              {/* Brushes */}
              <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-lg">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🖌️</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-3 text-lg">Brushes</h4>
                    <ul className="space-y-2 mb-4">
                      {getSupplies()!.brushes.map((brush: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-base text-gray-700">
                          <span className="text-[#C2410C] mt-0.5">•</span>
                          <span>{brush}</span>
                        </li>
                      ))}
                    </ul>
                    {(() => {
                      const brushLink = getProductLinks()?.find((p: any) => p.category === 'brushes');
                      return brushLink && (
                        <a
                          href={brushLink.amazonUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF9900] hover:bg-[#FF9900]/90 text-white rounded-lg transition-all text-sm font-semibold"
                        >
                          <img src="/amazon_icon.webp" alt="Amazon" className="w-5 h-5" />
                          Buy on Amazon
                        </a>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Other Materials */}
              <div className="bg-gray-50 border-l-4 border-gray-400 p-5 rounded-r-lg">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">✨</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-3 text-lg">Other Materials</h4>
                    <ul className="space-y-2 mb-4">
                      {getSupplies()!.otherMaterials.map((material: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-base text-gray-700">
                          <span className="text-gray-500 mt-0.5">•</span>
                          <span>{material}</span>
                        </li>
                      ))}
                    </ul>
                    {(() => {
                      const canvasLink = getProductLinks()?.find((p: any) => p.category === 'canvas');
                      const paletteLink = getProductLinks()?.find((p: any) => p.category === 'palette');
                      const otherLink = getProductLinks()?.find((p: any) => p.category === 'other');
                      const materialLink = canvasLink || paletteLink || otherLink;
                      return materialLink && (
                        <a
                          href={materialLink.amazonUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF9900] hover:bg-[#FF9900]/90 text-white rounded-lg transition-all text-sm font-semibold"
                        >
                          <img src="/amazon_icon.webp" alt="Amazon" className="w-5 h-5" />
                          Buy on Amazon
                        </a>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Affiliate Disclosure */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 italic leading-relaxed">
                  * Amazon links are affiliate links. Purchasing through them supports Brush Atelier at no extra cost to you. We only recommend quality art supplies.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {showImageZoom && (zoomedImageUrl || previewUrl) && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowImageZoom(false);
            setZoomedImageUrl(null);
          }}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => {
                setShowImageZoom(false);
                setZoomedImageUrl(null);
              }}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all z-10"
              title="Close (ESC)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Zoomed Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={zoomedImageUrl || previewUrl!}
                alt="Zoomed Image"
                width={1920}
                height={1080}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Helper text */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg text-sm">
              Click anywhere or press ESC to close
            </div>
          </div>
        </div>
      )}


      {/* Feedback Modal */}
      {showFeedbackModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowFeedbackModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {feedbackType === 'thumbs-up' ? (
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-green-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="p-2 bg-red-100 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" />
                      </svg>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-[#1F2933]">
                    {feedbackType === 'thumbs-up' ? 'Glad you like it!' : 'Help us improve'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <p className="text-sm text-[#1F2933]/70 mb-4">
                {feedbackType === 'thumbs-up'
                  ? 'Tell us what\'s working well for you (optional):'
                  : 'Tell us what could be improved (optional):'}
              </p>

              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder={feedbackType === 'thumbs-up'
                  ? 'E.g., "The color mixing guide is really helpful..."'
                  : 'E.g., "I would like more examples of..."'}
                rows={4}
                className="w-full p-3 text-sm text-[#1F2933] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-transparent resize-none"
              />

              {/* Footer */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackComment("");
                  }}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-[#1F2933] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={submitFeedback}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
