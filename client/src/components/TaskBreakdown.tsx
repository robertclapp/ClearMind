import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, ListTodo, Plus } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

/**
 * TaskBreakdown Component
 * 
 * AI-powered task breakdown for complex projects.
 * Helps neurodivergent users break down overwhelming tasks into manageable steps.
 * 
 * Features:
 * - Natural language input
 * - AI-generated subtasks
 * - Checkbox tracking
 * - Add to database option
 * - Executive function support
 */

interface TaskBreakdownProps {
  onTasksCreated?: (tasks: string[]) => void;
  className?: string;
}

interface SubTask {
  text: string;
  completed: boolean;
}

export function TaskBreakdown({ onTasksCreated, className }: TaskBreakdownProps) {
  const [input, setInput] = useState("");
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);

  const breakdownMutation = trpc.ai.breakdownTask.useMutation({
    onSuccess: (data) => {
      const tasks = data.subtasks.map((text: string) => ({ text, completed: false }));
      setSubtasks(tasks);
      toast.success(`Generated ${tasks.length} subtasks`);
      onTasksCreated?.(data.subtasks);
    },
    onError: (error) => {
      toast.error(`Failed to break down task: ${error.message}`);
    },
  });

  const handleBreakdown = () => {
    if (!input.trim()) {
      toast.error("Please describe the task you want to break down");
      return;
    }

    breakdownMutation.mutate({ taskDescription: input.trim() });
  };

  const toggleSubtask = (index: number) => {
    setSubtasks((prev) =>
      prev.map((task, i) =>
        i === index ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const addCustomSubtask = () => {
    const newTask = prompt("Enter a new subtask:");
    if (newTask?.trim()) {
      setSubtasks((prev) => [...prev, { text: newTask.trim(), completed: false }]);
    }
  };

  const completedCount = subtasks.filter((t) => t.completed).length;
  const progress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold mb-1">AI Task Breakdown</h3>
          <p className="text-sm text-muted-foreground">
            Break complex tasks into manageable steps
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <Textarea
            placeholder="Describe a complex task or project you want to break down...&#10;&#10;Example: 'Plan a birthday party for 20 people' or 'Write a research paper on climate change'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            disabled={breakdownMutation.isPending}
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleBreakdown}
          disabled={breakdownMutation.isPending || !input.trim()}
          className="w-full"
        >
          {breakdownMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Breaking down task...
            </>
          ) : (
            <>
              <ListTodo className="h-4 w-4 mr-2" />
              Break Down Task
            </>
          )}
        </Button>

        {/* Subtasks */}
        {subtasks.length > 0 && (
          <div className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progress</span>
                <span className="text-muted-foreground">
                  {completedCount} / {subtasks.length} completed
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Subtask List */}
            <div className="space-y-2">
              {subtasks.map((subtask, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => toggleSubtask(index)}
                    className="mt-0.5"
                  />
                  <p
                    className={`flex-1 text-sm ${
                      subtask.completed
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {subtask.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Add Custom Subtask */}
            <Button
              variant="outline"
              size="sm"
              onClick={addCustomSubtask}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Step
            </Button>
          </div>
        )}

        {/* Tips */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p className="font-medium">💡 Tips for better breakdowns:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Be specific about your goal and constraints</li>
            <li>Mention any deadlines or priorities</li>
            <li>Include context about your situation</li>
            <li>The AI will create actionable, sequential steps</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
