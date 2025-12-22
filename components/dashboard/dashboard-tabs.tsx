"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

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
  activeView: "portfolio" | "new-artwork";
  onViewChange: (view: "portfolio" | "new-artwork") => void;
}

// Helper function to get color hex codes from paint names
const getColorHex = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    // Whites
    'titanium white': '#FFFFFF',
    'zinc white': '#F5F5F5',
    'white': '#FFFFFF',

    // Blacks
    'ivory black': '#292421',
    'mars black': '#1C1C1C',
    'black': '#000000',

    // Blues
    'ultramarine blue': '#4166F5',
    'cobalt blue': '#0047AB',
    'cerulean blue': '#2A52BE',
    'prussian blue': '#003153',
    'phthalo blue': '#000F89',
    'azure blue': '#007FFF',

    // Reds
    'cadmium red': '#E30022',
    'alizarin crimson': '#E32636',
    'vermilion': '#E34234',
    'scarlet': '#FF2400',
    'rose madder': '#E33638',

    // Yellows
    'cadmium yellow': '#FFF600',
    'lemon yellow': '#FAFA33',
    'naples yellow': '#FADA5E',
    'yellow ochre': '#CC7722',
    'raw sienna': '#D68A59',

    // Greens
    'phthalo green': '#123524',
    'viridian': '#40826D',
    'sap green': '#507D2A',
    'chromium oxide green': '#669900',

    // Oranges
    'cadmium orange': '#FF6600',
    'burnt sienna': '#E97451',
    'burnt umber': '#8A3324',
    'raw umber': '#826644',

    // Purples/Violets
    'dioxazine purple': '#5C3F70',
    'quinacridone magenta': '#8E3A59',
    'violet': '#8F00FF',
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

export default function DashboardTabs({ userWithProfile, activeView, onViewChange }: DashboardTabsProps) {
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
  const [paintingComplete, setPaintingComplete] = useState<boolean>(false);
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
  const [isSuppliesOpen, setIsSuppliesOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store chat messages per session
  const sessionChatHistory = useRef<Map<string, Array<{role: 'bot' | 'user', message: string}>>>(new Map());

  // Initialize chatbot with greeting only on first load (not when switching tabs)
  useEffect(() => {
    // Only set initial greeting if there are no messages yet
    if (chatMessages.length === 0) {
      setChatMessages([{
        role: 'bot',
        message: "Hello! I'm your coach, Om. Upload an image of any artwork you'd like to learn how to recreate, and I'll guide you through it step-by-step."
      }]);
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
  }, [activeView]);

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

  const handleDeleteClick = (portfolioId: string) => {
    setItemToDelete(portfolioId);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/portfolio?id=${itemToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        await loadPortfolioItems();
        setShowDeleteConfirmModal(false);
        setItemToDelete(null);
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

        // Use stored chat if available (most recent), otherwise use from database
        setChatMessages(storedChat || data.chatHistory);
        setPreviewUrl(imageUrl);

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

  const startCoachingSessionAutomatically = async (medium: string) => {
    console.log("=== STARTING COACHING SESSION AUTOMATICALLY ===");

    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    // Start progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const formData = new FormData();

      if (!uploadedFile) {
        setError("Please upload an image");
        setIsAnalyzing(false);
        clearInterval(progressInterval);
        return;
      }

      formData.append("action", "create");
      formData.append("file", uploadedFile);
      formData.append("medium", medium);
      formData.append("skillLevel", "intermediate");

      console.log("=== CREATING COACHING SESSION ===");
      const response = await fetch("/api/coaching-session", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("=== API RESPONSE ===", data);
      console.log("Quick guide:", data.quick_guide);
      console.log("Painting guide supplies:", data.quick_guide?.supplies);
      console.log("Painting guide steps:", data.quick_guide?.steps);

      if (response.ok) {
        setProgress(100);
        setCoachingSessionId(data.session_id);
        setCurrentStep(data.step);
        setTotalSteps(data.total_steps);
        setPaintingGuide(data.quick_guide || null);
        setEstimatedTime(data.estimated_time || null);
        console.log("State after setting paintingGuide:", data.quick_guide);
        console.log("Estimated time:", data.estimated_time);

        setTimeout(() => {
          // Add first coaching message
          setChatMessages(prev => [
            ...prev,
            { role: 'bot', message: data.message }
          ]);
          setIsAnalyzing(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        // Add confirmation message
        setChatMessages(prev => [
          ...prev,
          {
            role: 'bot',
            message: "Perfect! I can see your image. Let's create your lesson.\n\nWhat medium do you prefer?"
          }
        ]);
        setShowMediumButtons(true);
        setWaitingForConfirmation(true);
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
      message: "Hello! I'm your coach, Om. Upload an image of any artwork you'd like to learn how to recreate, and I'll guide you through it step-by-step."
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
    setIsSuppliesOpen(false);
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

  return (
    <div>
        {activeView === "new-artwork" && (
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-[#1F2933]">Get Started</h3>
                <p className="text-[#1F2933]/70 mt-1">
                  Chat with your teacher to get personalized step-by-step lessons
                </p>
              </div>
              <div className="flex items-center gap-3">
                {artworkStatus && (
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    artworkStatus === "in-progress"
                      ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                      : "bg-green-100 text-[#6B8E6E] border-2 border-green-300"
                  }`}>
                    {artworkStatus === "in-progress" ? "In Progress" : "Complete"}
                  </div>
                )}
                {previewUrl && artworkStatus === "in-progress" && (
                  <button
                    onClick={() => setShowCompleteConfirmation(true)}
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md"
                    title="Mark as Complete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </button>
                )}
                {previewUrl && (
                  <button
                    onClick={handleClearImage}
                    className="bg-[#2563EB] text-white p-2 rounded-lg hover:bg-[#1D4ED8] transition-all shadow-sm hover:shadow-md"
                    title="Try Another Artwork"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {!previewUrl ? (
              <div className="flex flex-col items-center justify-center max-w-4xl mx-auto">
                {/* Chatbot - Full Width */}
                <div className="w-full border-2 border-gray-200 rounded-lg p-6 flex flex-col h-[500px]">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-[#1F2933] mb-1">Your Personal Art Coach</h3>
                    <p className="text-sm text-[#1F2933]/70">Ask anything. No judgment. Let's bring this painting to life together.</p>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {chatMessages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-[#2563EB] text-white'
                            : 'bg-gray-200 text-[#1F2933]'
                        }`}>
                          <div className="whitespace-pre-wrap text-base">
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input with Upload Button */}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <div className="flex-1 relative">
                      <label className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <svg className="w-5 h-5 text-[#1F2933]/50 hover:text-[#2563EB] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </label>
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full pl-12 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#2563EB] text-[#1F2933]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1D4ED8] transition-all"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column - Image */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          width={800}
                          height={600}
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      </div>
                    </div>

                    {/* Secondary Actions - De-emphasized */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-[#1F2933]/50 mb-2 font-medium">After you finish:</p>
                      <div className="grid grid-cols-2 gap-2">
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

                    {/* Materials Section - Collapsible */}
                    {(() => {
                      console.log("Materials check - paintingGuide:", paintingGuide);
                      console.log("Materials check - supplies:", paintingGuide?.supplies);
                      return null;
                    })()}
                    {paintingGuide && paintingGuide.supplies && (
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-[#2563EB]/20 overflow-hidden">
                        {/* Reassurance Header */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 px-4 py-3 border-b-2 border-[#6B8E6E]/30">
                          <p className="text-sm text-[#1F2933] font-semibold flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-[#6B8E6E]">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>You don't need exact matches — close substitutes work perfectly.</span>
                          </p>
                        </div>

                        <button
                          onClick={() => setIsSuppliesOpen(!isSuppliesOpen)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors"
                        >
                          <h4 className="font-semibold text-[#1F2933] text-sm flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#2563EB]">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                            </svg>
                            <span>What You'll Need</span>
                          </h4>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className={`w-5 h-5 text-[#1F2933]/70 transition-transform ${isSuppliesOpen ? 'rotate-180' : ''}`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>

                        {isSuppliesOpen && (
                          <div className="p-4 pt-0 space-y-4 border-t border-[#2563EB]/10">
                            {/* Essential Colors Section */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-[#2563EB]/20">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 bg-[#2563EB] rounded-full"></div>
                                <p className="text-xs font-bold text-[#1F2933] uppercase tracking-wide">Essential Colors</p>
                              </div>
                              <div className="space-y-2">
                                {paintingGuide.supplies.paintColors.slice(0, 3).map((color: string, index: number) => (
                                  <div key={index} className="flex items-start gap-3 bg-white px-3 py-2 rounded-lg border border-gray-200">
                                    <div
                                      className="w-6 h-6 rounded-md border-2 border-gray-300 flex-shrink-0 shadow-sm mt-0.5"
                                      style={{ backgroundColor: getColorHex(color) }}
                                      title={color}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <span className="text-xs font-semibold text-[#1F2933] block">{color}</span>
                                      <span className="text-xs text-[#1F2933]/60 italic">
                                        {index === 0 && "For highlights & mixing"}
                                        {index === 1 && "For depth & shadows"}
                                        {index === 2 && "For color balance"}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Additional Colors - Collapsed by default */}
                            {paintingGuide.supplies.paintColors.length > 3 && (
                              <div className="bg-white/40 rounded-lg p-3 border border-gray-200">
                                <p className="text-xs font-medium text-[#1F2933]/70 mb-2">Additional Colors (you'll need these later):</p>
                                <div className="flex flex-wrap gap-2">
                                  {paintingGuide.supplies.paintColors.slice(3).map((color: string, index: number) => (
                                    <div key={index} className="flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-gray-200">
                                      <div
                                        className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                                        style={{ backgroundColor: getColorHex(color) }}
                                        title={color}
                                      />
                                      <span className="text-xs text-[#1F2933]">{color}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Brushes */}
                            <div>
                              <p className="text-xs font-medium text-[#1F2933] mb-2 flex items-center gap-2">
                                <span>Brushes:</span>
                                <span className="text-[#1F2933]/50 font-normal italic">(any similar sizes work fine)</span>
                              </p>
                              <p className="text-xs text-[#1F2933]/70 leading-relaxed bg-white/60 p-2 rounded">
                                {paintingGuide.supplies.brushes.join(', ')}
                              </p>
                            </div>

                            {paintingGuide.supplies.palette && paintingGuide.supplies.palette.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-[#1F2933] mb-1">Palette & Mixing:</p>
                                <p className="text-xs text-[#1F2933]/70 leading-relaxed bg-white/60 p-2 rounded">
                                  {paintingGuide.supplies.palette.join(', ')}
                                </p>
                              </div>
                            )}

                            <div>
                              <p className="text-xs font-medium text-[#1F2933] mb-1">Other Materials:</p>
                              <p className="text-xs text-[#1F2933]/70 leading-relaxed bg-white/60 p-2 rounded">
                                {paintingGuide.supplies.otherMaterials.join(', ')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Product Links Modal */}
                    {showProductLinksModal && paintingGuide?.productLinks && (
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
                              {paintingGuide.productLinks.map((product: any, index: number) => (
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

                    {isAnalyzing && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#1F2933]">Analyzing your artwork...</span>
                          <span className="text-sm font-medium text-[#1F2933]">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-[#2563EB] h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-[#1F2933]/50 mt-2 text-center">This may take a moment while our AI analyzes the details...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Chatbot */}
                <div className="border-2 border-gray-200 rounded-lg p-4 flex flex-col h-[600px]">
                  {/* Primary Next Action CTA */}
                  <div className="mb-4 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] rounded-xl p-5 shadow-lg border-2 border-[#2563EB]">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-[#2563EB]">1</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">Your Next Step</h3>
                        <p className="text-white/90 text-sm leading-relaxed">
                          Start by observing the artwork. Ask your coach anything about colors, techniques, or where to begin.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-[#1F2933] mb-1">Guided Studio Session</h4>
                    <p className="text-xs text-[#1F2933]/60">A real coaching experience—not just chat.</p>
                  </div>

                  {/* Chat Messages - Guided Studio Session */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {chatMessages.map((msg, index) => {
                      // Detect message type based on content patterns
                      const isActionStep = msg.role === 'bot' && (
                        msg.message.toLowerCase().includes('step') ||
                        msg.message.toLowerCase().includes('action:') ||
                        msg.message.toLowerCase().includes('now,') ||
                        msg.message.toLowerCase().includes('let\'s')
                      );

                      const isCoachInsight = msg.role === 'bot' && (
                        msg.message.toLowerCase().includes('notice') ||
                        msg.message.toLowerCase().includes('observe') ||
                        msg.message.toLowerCase().includes('tip:') ||
                        msg.message.toLowerCase().includes('remember')
                      );

                      if (msg.role === 'user') {
                        // User Reflection - Handwritten feel
                        return (
                          <div key={index} className="flex justify-end">
                            <div className="max-w-[80%]">
                              <div className="flex items-center gap-2 justify-end mb-1">
                                <span className="text-xs text-[#1F2933]/50 font-medium">Your Reflection</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#C2410C]">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                </svg>
                              </div>
                              <div className="bg-gradient-to-br from-blue-50 to-purple-50 text-[#1F2933] px-4 py-3 rounded-2xl rounded-tr-sm border-2 border-[#2563EB]/20 shadow-sm">
                                <div className="whitespace-pre-wrap text-sm italic leading-relaxed">
                                  {msg.message}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      } else if (isActionStep) {
                        // Action Step - Clear instruction
                        return (
                          <div key={index} className="flex justify-start">
                            <div className="max-w-[85%]">
                              <div className="flex items-center gap-2 mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-[#6B8E6E]">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs font-bold text-[#6B8E6E] uppercase tracking-wide">Action Step</span>
                              </div>
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 text-[#1F2933] px-5 py-4 rounded-2xl rounded-tl-sm border-2 border-[#6B8E6E]/30 shadow-md">
                                <div className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
                                  {msg.message}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      } else if (isCoachInsight) {
                        // Coach Insight - Observational guidance
                        return (
                          <div key={index} className="flex justify-start">
                            <div className="max-w-[85%]">
                              <div className="flex items-center gap-2 mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#C2410C]">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                                </svg>
                                <span className="text-xs font-bold text-[#C2410C] uppercase tracking-wide">Coach Insight</span>
                              </div>
                              <div className="bg-gradient-to-br from-orange-50 to-amber-50 text-[#1F2933] px-5 py-4 rounded-2xl rounded-tl-sm border-2 border-[#C2410C]/20 shadow-md">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                  {msg.message}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        // Default Coach Message
                        return (
                          <div key={index} className="flex justify-start">
                            <div className="max-w-[85%]">
                              <div className="flex items-center gap-2 mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#2563EB]">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                                <span className="text-xs text-[#1F2933]/60 font-medium">Your Coach</span>
                              </div>
                              <div className="bg-white text-[#1F2933] px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
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
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

        {activeView === "portfolio" && (
          <div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#1F2933]">My Portfolio</h3>
              </div>

              {isLoadingPortfolio ? (
                <div className="text-center py-12">
                  <p className="text-[#1F2933]/70">Loading your portfolio...</p>
                </div>
              ) : portfolioItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-[#1F2933]/70 mb-2">Your portfolio is empty</p>
                  <p className="text-sm text-[#1F2933]/50">Create some artwork in the "New Artwork" tab and add them to your portfolio!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <div className="p-4">
                        <h4 className="font-semibold text-[#1F2933] mb-1">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-[#1F2933]/70 mb-2">{item.description}</p>
                        )}

                        {/* Show session info if exists */}
                        {item.sessionId && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                item.artworkStatus === 'IN_PROGRESS'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-[#6B8E6E]'
                              }`}>
                                {item.artworkStatus === 'IN_PROGRESS' ? 'In Progress' : 'Complete'}
                              </span>
                              {item.estimatedTime && (
                                <span className="text-xs text-[#1F2933]/50">{item.estimatedTime}</span>
                              )}
                            </div>
                            {item.artworkStatus === 'IN_PROGRESS' && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleResumeSession(item.sessionId, item.imageUrl);
                                }}
                                className="w-full bg-[#2563EB] hover:bg-[#c1d220] text-[#1F2933] font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                                type="button"
                              >
                                Resume Session
                              </button>
                            )}
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
    </div>
  );
}
