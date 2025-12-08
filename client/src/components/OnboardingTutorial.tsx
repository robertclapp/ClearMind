import { useEffect, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

/**
 * OnboardingTutorial provides an interactive first-run experience
 * that guides new users through ClearMind's key features.
 * 
 * Features:
 * - Spotlight effect highlighting specific UI elements
 * - Step-by-step tutorial flow
 * - Skip and navigation options
 * - Persistent completion state
 */
export function OnboardingTutorial() {
  const { isActive, currentStep, steps, nextStep, previousStep, skipTutorial } = useOnboarding();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [spotlightPosition, setSpotlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (!isActive || !currentStepData) return;

    // Find the target element for spotlight
    const element = document.querySelector(currentStepData.target) as HTMLElement;
    if (element) {
      setTargetElement(element);
      
      // Calculate spotlight position
      const rect = element.getBoundingClientRect();
      setSpotlightPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });

      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setTargetElement(null);
    }
  }, [isActive, currentStep, currentStepData]);

  if (!isActive || !currentStepData) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Overlay with spotlight effect */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Spotlight cutout */}
        {targetElement && (
          <div
            className="absolute bg-transparent border-4 border-primary rounded-lg shadow-2xl transition-all duration-300 pointer-events-auto"
            style={{
              top: `${spotlightPosition.top - 8}px`,
              left: `${spotlightPosition.left - 8}px`,
              width: `${spotlightPosition.width + 16}px`,
              height: `${spotlightPosition.height + 16}px`,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            }}
          />
        )}
      </div>

      {/* Tutorial card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <Card className="max-w-md w-full pointer-events-auto shadow-2xl">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>{currentStepData.title}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTutorial}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-2 justify-center">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-primary'
                      : index < currentStep
                      ? 'w-2 bg-primary/50'
                      : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={isFirstStep}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="text-sm text-muted-foreground">
              {currentStep + 1} / {steps.length}
            </div>

            <Button onClick={nextStep}>
              {isLastStep ? (
                'Get Started'
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
