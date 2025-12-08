import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for spotlight
  action?: string; // Optional action to perform
}

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ClearMind!',
    description: 'Let\'s take a quick tour to help you get started. This will only take a minute.',
    target: 'body',
  },
  {
    id: 'create-page',
    title: 'Create Your First Page',
    description: 'Pages are where you write notes, organize thoughts, and build your knowledge base. Click "New Page" to create one.',
    target: '[data-onboarding="new-page"]',
    action: 'create-page',
  },
  {
    id: 'page-editor',
    title: 'Start Writing',
    description: 'Type "/" to see all available block types (headings, lists, code, etc.). Try it now!',
    target: '[data-onboarding="page-editor"]',
  },
  {
    id: 'create-database',
    title: 'Create a Database',
    description: 'Databases help you organize structured information like tasks, projects, or contacts. Let\'s create one.',
    target: '[data-onboarding="new-database"]',
    action: 'create-database',
  },
  {
    id: 'database-views',
    title: 'Multiple Views',
    description: 'View your data as a table, kanban board, calendar, gallery, or list. Switch between views using these tabs.',
    target: '[data-onboarding="database-views"]',
  },
  {
    id: 'timeline',
    title: 'Plan Your Day',
    description: 'The timeline helps you schedule your day visually with flexible time blocks. Perfect for ADHD-friendly planning.',
    target: '[data-onboarding="timeline"]',
  },
  {
    id: 'mood-tracker',
    title: 'Track Your Mood',
    description: 'Log how you\'re feeling throughout the day and see patterns over time. Great for mental health awareness.',
    target: '[data-onboarding="mood-tracker"]',
  },
  {
    id: 'ai-features',
    title: 'AI-Powered Assistance',
    description: 'Use AI to break down tasks, improve your writing, transcribe voice notes, and generate images.',
    target: '[data-onboarding="ai-assistant"]',
  },
  {
    id: 'settings',
    title: 'Customize Your Experience',
    description: 'Choose a sensory profile theme that works best for you (ADHD-optimized, high contrast, dyslexia-friendly, etc.).',
    target: '[data-onboarding="settings"]',
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'You\'re ready to use ClearMind. Remember, you can always access help from the settings menu.',
    target: 'body',
  },
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('clearmind_onboarding_completed');
    if (!hasCompletedOnboarding) {
      // Auto-start onboarding for new users after a short delay
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTutorial = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    setIsActive(false);
    localStorage.setItem('clearmind_onboarding_completed', 'true');
  };

  const completeTutorial = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('clearmind_onboarding_completed', 'true');
  };

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStep,
        steps: ONBOARDING_STEPS,
        startTutorial,
        nextStep,
        previousStep,
        skipTutorial,
        completeTutorial,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
