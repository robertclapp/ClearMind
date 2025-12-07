import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Smile, Meh, Frown, TrendingUp, Calendar } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

/**
 * MoodTrackerPage
 * 
 * Mood tracking dashboard for emotional well-being.
 * Helps users identify patterns and triggers in their emotional states.
 * 
 * Features:
 * - Quick mood entry
 * - Mood history visualization
 * - Pattern insights
 * - Note-taking for context
 * - Trend analysis
 */

const moodOptions = [
  { value: 5, label: "Amazing", emoji: "🤩", color: "text-green-500" },
  { value: 4, label: "Good", emoji: "😊", color: "text-green-400" },
  { value: 3, label: "Okay", emoji: "😐", color: "text-yellow-500" },
  { value: 2, label: "Not Great", emoji: "😕", color: "text-orange-500" },
  { value: 1, label: "Difficult", emoji: "😢", color: "text-red-500" },
];

export default function MoodTrackerPage() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");

  // Get mood entries for current user
  const { data: moodEntries = [], refetch } = trpc.mood.getRecent.useQuery({
    limit: 30,
  });

  // Create mood entry mutation
  const createMutation = trpc.mood.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Mood logged successfully");
      setSelectedMood(null);
      setNote("");
    },
    onError: (error) => {
      toast.error(`Failed to log mood: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (selectedMood === null) {
      toast.error("Please select a mood");
      return;
    }

    createMutation.mutate({
      moodValue: selectedMood,
      moodEmoji: moodOptions.find(m => m.value === selectedMood)?.emoji,
      notes: note.trim() || undefined,
      linkedEventId: undefined,
    });
  };

  // Calculate average mood
  const averageMood = moodEntries.length > 0
    ? moodEntries.reduce((sum: number, entry: any) => sum + (entry.moodValue || 0), 0) / moodEntries.length
    : 0;

  const getMoodEmoji = (value: number) => {
    return moodOptions.find((m) => m.value === value)?.emoji || "😐";
  };

  const getMoodLabel = (value: number) => {
    return moodOptions.find((m) => m.value === value)?.label || "Okay";
  };

  return (
    <AppLayout>
      <div className="container py-8 space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Mood Tracker</h1>
          <p className="text-lg text-muted-foreground">
            Track your emotional well-being and identify patterns over time.
          </p>
        </div>

        {/* Quick Entry */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">How are you feeling right now?</h2>
          
          <div className="space-y-6">
            {/* Mood Selection */}
            <div className="grid grid-cols-5 gap-4">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    selectedMood === mood.value
                      ? "border-primary bg-primary/10 scale-105"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-4xl">{mood.emoji}</span>
                  <span className={`text-sm font-medium ${mood.color}`}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="mood-note">
                What's on your mind? (optional)
              </Label>
              <Textarea
                id="mood-note"
                placeholder="Add a note about how you're feeling or what's happening..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={selectedMood === null || createMutation.isPending}
              className="w-full"
            >
              Log Mood
            </Button>
          </div>
        </Card>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Mood</p>
                <p className="text-2xl font-bold">
                  {averageMood > 0 ? averageMood.toFixed(1) : "—"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/10">
                <Smile className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entries This Week</p>
                <p className="text-2xl font-bold">{moodEntries.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tracking Since</p>
                <p className="text-2xl font-bold">
                  {moodEntries.length > 0
                    ? format(new Date(moodEntries[moodEntries.length - 1].createdAt), "MMM d")
                    : "—"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Entries */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
          
          {moodEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Meh className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No mood entries yet. Log your first mood above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {moodEntries.slice(0, 10).map((entry: any) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 p-3 rounded-lg border"
                >
                  <span className="text-3xl flex-shrink-0">
                    {entry.moodEmoji || getMoodEmoji(entry.moodValue || 3)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{getMoodLabel(entry.moodValue || 3)}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(entry.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground">{entry.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Tips */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2">💡 Mood Tracking Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Check in with yourself regularly - consistency helps identify patterns</li>
            <li>• Be honest about how you're feeling - there are no wrong answers</li>
            <li>• Add notes to remember what influenced your mood</li>
            <li>• Look for patterns over time to understand your emotional rhythms</li>
          </ul>
        </Card>
      </div>
    </AppLayout>
  );
}
