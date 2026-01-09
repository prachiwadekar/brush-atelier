// Type definitions for Amplitude window object
declare global {
  interface Window {
    amplitude?: {
      track: (eventName: string, properties?: Record<string, any>) => void;
      setUserId: (userId: string) => void;
      identify: (identifyObj: any) => void;
      reset: () => void;
      Identify: new () => any;
    };
  }
}

// Helper to check if Amplitude is loaded
const isAmplitudeLoaded = (): boolean => {
  return typeof window !== 'undefined' && !!window.amplitude;
};

// Identify user
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (!isAmplitudeLoaded()) return;

  const identifyEvent = new window.amplitude!.Identify();

  if (traits) {
    Object.entries(traits).forEach(([key, value]) => {
      identifyEvent.set(key, value);
    });
  }

  window.amplitude!.setUserId(userId);
  window.amplitude!.identify(identifyEvent);
};

// Track events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (!isAmplitudeLoaded()) return;
  window.amplitude!.track(eventName, properties);
};

// Set user properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (!isAmplitudeLoaded()) return;

  const identifyEvent = new window.amplitude!.Identify();
  Object.entries(properties).forEach(([key, value]) => {
    identifyEvent.set(key, value);
  });
  window.amplitude!.identify(identifyEvent);
};

// Reset on logout
export const resetAnalytics = () => {
  if (!isAmplitudeLoaded()) return;
  window.amplitude!.reset();
};

// Predefined event tracking functions
export const analytics = {
  // Auth events
  signupCompleted: (userId: string, method: 'email' | 'google') => {
    trackEvent('signup_completed', { method });
    identifyUser(userId, { signup_method: method, signup_date: new Date().toISOString() });
  },

  signinCompleted: (userId: string, method: 'email' | 'google') => {
    trackEvent('signin_completed', { method });
    identifyUser(userId);
  },

  signoutCompleted: () => {
    trackEvent('signout_completed');
    resetAnalytics();
  },

  // Onboarding events
  onboardingStarted: () => {
    trackEvent('onboarding_started');
  },

  onboardingCompleted: (role: string, skillLevel?: string, interests?: string[]) => {
    trackEvent('onboarding_completed', {
      role,
      skill_level: skillLevel,
      interests: interests?.join(', '),
    });
    setUserProperties({
      role,
      skill_level: skillLevel,
      interests: interests?.join(', '),
    });
  },

  // Coaching session events
  coachingSessionStarted: (sessionId: string, medium: string, skillLevel: string) => {
    trackEvent('coaching_session_started', {
      session_id: sessionId,
      medium,
      skill_level: skillLevel,
    });
  },

  coachingStepCompleted: (sessionId: string, stepNumber: number, totalSteps: number) => {
    trackEvent('coaching_step_completed', {
      session_id: sessionId,
      step_number: stepNumber,
      total_steps: totalSteps,
      progress_percentage: Math.round((stepNumber / totalSteps) * 100),
    });
  },

  coachingSessionCompleted: (sessionId: string, duration: number, stepsCompleted: number) => {
    trackEvent('coaching_session_completed', {
      session_id: sessionId,
      duration_minutes: Math.round(duration / 60),
      steps_completed: stepsCompleted,
    });
  },

  coachingSessionAbandoned: (sessionId: string, lastStep: number, totalSteps: number) => {
    trackEvent('coaching_session_abandoned', {
      session_id: sessionId,
      last_step: lastStep,
      total_steps: totalSteps,
      completion_percentage: Math.round((lastStep / totalSteps) * 100),
    });
  },

  // Artwork events
  artworkUploaded: (sessionId: string, fileSize: number, fileType: string) => {
    trackEvent('artwork_uploaded', {
      session_id: sessionId,
      file_size_kb: Math.round(fileSize / 1024),
      file_type: fileType,
    });
  },

  artworkAnalyzed: (sessionId: string, analysisType: 'instant_critique' | 'guided_session') => {
    trackEvent('artwork_analyzed', {
      session_id: sessionId,
      analysis_type: analysisType,
    });
  },

  // Engagement events
  colorGuideViewed: (sessionId: string, stepNumber: number) => {
    trackEvent('color_guide_viewed', {
      session_id: sessionId,
      step_number: stepNumber,
    });
  },

  cautionViewed: (sessionId: string, stepNumber: number) => {
    trackEvent('caution_viewed', {
      session_id: sessionId,
      step_number: stepNumber,
    });
  },

  chatMessageSent: (sessionId: string, messageLength: number) => {
    trackEvent('chat_message_sent', {
      session_id: sessionId,
      message_length: messageLength,
    });
  },

  portfolioViewed: () => {
    trackEvent('portfolio_viewed');
  },

  // Feature usage
  newSessionClicked: () => {
    trackEvent('new_session_clicked');
  },

  dashboardViewed: (activeTab: string) => {
    trackEvent('dashboard_viewed', {
      active_tab: activeTab,
    });
  },
};
