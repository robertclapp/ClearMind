import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Smile, Meh, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { format, subDays, startOfDay } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";

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

  // Prepare chart data - group by day and calculate average
  const chartData = useMemo(() => {
    if (!moodEntries.length) return [];

    // Create a map of date -> mood values
    const moodByDate = new Map<string, number[]>();

    moodEntries.forEach((entry: any) => {
      const dateKey = format(new Date(entry.createdAt), "MMM d");
      const values = moodByDate.get(dateKey) || [];
      values.push(entry.moodValue || 3);
      moodByDate.set(dateKey, values);
    });

    // Convert to array and calculate averages
    const result: Array<{ date: string; mood: number; count: number }> = [];
    moodByDate.forEach((values, date) => {
      result.push({
        date,
        mood: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
        count: values.length,
      });
    });

    // Sort by date and take last 14 entries
    return result.slice(-14);
  }, [moodEntries]);

  // Calculate mood distribution
  const moodDistribution = useMemo(() => {
    if (!moodEntries.length) return [];

    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    moodEntries.forEach((entry: any) => {
      const value = entry.moodValue || 3;
      counts[value] = (counts[value] || 0) + 1;
    });

    return moodOptions.map((option) => ({
      ...option,
      count: counts[option.value] || 0,
      percentage: Math.round((counts[option.value] / moodEntries.length) * 100),
    }));
  }, [moodEntries]);

  const getMoodEmoji = (value: number) => {
    return moodOptions.find((m) => m.value === value)?.emoji || "😐";
  };

  const getMoodLabel = (value: number) => {
    return moodOptions.find((m) => m.value === value)?.label || "Okay";
  };

  const getMoodColor = (value: number) => {
    if (value >= 4) return "#22c55e"; // green
    if (value >= 3) return "#eab308"; // yellow
    return "#ef4444"; // red
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

        {/* Mood Trend Chart */}
        {chartData.length > 1 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Mood Trend</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    tickFormatter={(value) => getMoodEmoji(value)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold">{data.date}</p>
                            <p className="text-2xl">{getMoodEmoji(Math.round(data.mood))}</p>
                            <p className="text-sm text-muted-foreground">
                              Avg: {data.mood.toFixed(1)} • {data.count} {data.count === 1 ? "entry" : "entries"}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={3}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                    strokeOpacity={0.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#moodGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Mood Distribution */}
        {moodDistribution.length > 0 && moodEntries.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Mood Distribution</h2>
            <div className="space-y-3">
              {moodDistribution.map((item) => (
                <div key={item.value} className="flex items-center gap-3">
                  <span className="text-2xl w-10">{item.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: getMoodColor(item.value),
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

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
