import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * FocusTimer Component
 * 
 * Pomodoro-style focus timer to help users maintain concentration.
 * Supports custom durations and automatic break reminders.
 * 
 * Features:
 * - Pomodoro technique (25min focus, 5min break)
 * - Custom timer durations
 * - Visual countdown display
 * - Audio/visual notifications
 * - Session tracking
 * - Flexible scheduling (no rigid pressure)
 */

interface FocusTimerProps {
  onComplete?: () => void;
  className?: string;
}

export function FocusTimer({ onComplete, className }: FocusTimerProps) {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [customMinutes, setCustomMinutes] = useState(25);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Preset durations
  const presets = {
    focus: {
      pomodoro: 25,
      short: 15,
      long: 45,
    },
    break: {
      short: 5,
      long: 15,
    },
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (mode === "focus") {
      setSessionsCompleted((prev) => prev + 1);
      toast.success("Focus session complete! Time for a break.", {
        duration: 5000,
      });
      onComplete?.();
    } else {
      toast.success("Break complete! Ready for another focus session?", {
        duration: 5000,
      });
    }

    // Play notification sound (browser notification API)
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("ClearMind Timer", {
        body: mode === "focus" 
          ? "Focus session complete! Take a break." 
          : "Break complete! Ready to focus?",
        icon: "/favicon.ico",
      });
    }
  };

  const startTimer = () => {
    if (timeLeft === 0) {
      resetTimer();
    }
    setIsRunning(true);

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customMinutes * 60);
  };

  const setPreset = (minutes: number) => {
    setCustomMinutes(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  };

  const switchMode = (newMode: "focus" | "break") => {
    setMode(newMode);
    const defaultMinutes = newMode === "focus" ? presets.focus.pomodoro : presets.break.short;
    setCustomMinutes(defaultMinutes);
    setTimeLeft(defaultMinutes * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = (timeLeft / (customMinutes * 60)) * 100;

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Mode Tabs */}
        <Tabs value={mode} onValueChange={(v) => switchMode(v as "focus" | "break")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="focus">Focus</TabsTrigger>
            <TabsTrigger value="break">Break</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Timer Display */}
        <div className="text-center">
          <div className="relative inline-block">
            {/* Progress Ring */}
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                className={mode === "focus" ? "text-primary" : "text-green-500"}
                strokeLinecap="round"
              />
            </svg>

            {/* Time Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <div className="text-5xl font-bold tabular-nums">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {mode === "focus" ? "Focus Time" : "Break Time"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isRunning ? (
            <Button onClick={startTimer} size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              Start
            </Button>
          ) : (
            <Button onClick={pauseTimer} size="lg" variant="secondary" className="gap-2">
              <Pause className="h-5 w-5" />
              Pause
            </Button>
          )}
          <Button onClick={resetTimer} size="lg" variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Quick Presets</Label>
          <div className="grid grid-cols-3 gap-2">
            {mode === "focus" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreset(presets.focus.short)}
                >
                  15 min
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreset(presets.focus.pomodoro)}
                >
                  25 min
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreset(presets.focus.long)}
                >
                  45 min
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreset(presets.break.short)}
                >
                  5 min
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreset(presets.break.long)}
                >
                  15 min
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPreset(30)}>
                  30 min
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Custom Duration */}
        <div className="space-y-2">
          <Label htmlFor="custom-minutes">Custom Duration (minutes)</Label>
          <div className="flex gap-2">
            <Input
              id="custom-minutes"
              type="number"
              min="1"
              max="120"
              value={customMinutes}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setCustomMinutes(value);
              }}
              disabled={isRunning}
            />
            <Button
              onClick={() => setPreset(customMinutes)}
              disabled={isRunning}
              variant="secondary"
            >
              Set
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Sessions completed today</span>
            </div>
            <span className="font-semibold">{sessionsCompleted}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
