import posthog from 'posthog-js';

// Initialize PostHog
export const initPostHog = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      autocapture: true, // Auto-capture clicks, page views, etc.
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug();
        }
      },
    });
  }
};

// Identify user
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.identify(userId, traits);
  }
};

// Track events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture(eventName, properties);
  }
};

// Set user properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.people.set(properties);
  }
};

// Reset on logout
export const resetAnalytics = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.reset();
  }
};

// Create feature flag
export const isFeatureEnabled = (flagKey: string): boolean => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return posthog.isFeatureEnabled(flagKey) || false;
  }
  return false;
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
