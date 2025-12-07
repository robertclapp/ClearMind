import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Zap, Plus, Trash2, Save, Play } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

/**
 * AutomationBuilder Component
 * 
 * Visual workflow builder for creating automations.
 * Helps users automate repetitive tasks and workflows.
 * 
 * Features:
 * - Trigger selection (when something happens)
 * - Condition builder (if conditions are met)
 * - Action selection (then do something)
 * - Multiple actions per automation
 * - Enable/disable automations
 * - Test automation execution
 */

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface Action {
  type: string;
  config: Record<string, any>;
}

interface AutomationBuilderProps {
  automationId?: number;
  onSave?: (id: number) => void;
  className?: string;
}

export function AutomationBuilder({
  automationId,
  onSave,
  className,
}: AutomationBuilderProps) {
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("");
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [enabled, setEnabled] = useState(true);

  const createMutation = trpc.automations.create.useMutation({
    onSuccess: (data: any) => {
      toast.success("Automation created!");
      onSave?.(data.id);
    },
    onError: (error: any) => {
      toast.error(`Failed to create automation: ${error.message}`);
    },
  });

  const handleAddCondition = () => {
    setConditions([...conditions, { field: "", operator: "equals", value: "" }]);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleUpdateCondition = (
    index: number,
    field: keyof Condition,
    value: string
  ) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  const handleAddAction = () => {
    setActions([...actions, { type: "", config: {} }]);
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleUpdateAction = (index: number, type: string) => {
    const updated = [...actions];
    updated[index] = { ...updated[index], type };
    setActions(updated);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please enter an automation name");
      return;
    }

    if (!trigger) {
      toast.error("Please select a trigger");
      return;
    }

    if (actions.length === 0) {
      toast.error("Please add at least one action");
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      trigger,
      conditions: JSON.stringify(conditions),
      actions: JSON.stringify(actions),
      enabled,
    });
  };

  const handleTest = () => {
    toast.info("Testing automation... (feature coming soon)");
  };

  const triggerOptions = [
    { value: "page_created", label: "Page Created" },
    { value: "page_updated", label: "Page Updated" },
    { value: "task_completed", label: "Task Completed" },
    { value: "database_item_created", label: "Database Item Created" },
    { value: "timeline_event_completed", label: "Timeline Event Completed" },
    { value: "mood_logged", label: "Mood Logged" },
    { value: "comment_added", label: "Comment Added" },
  ];

  const actionOptions = [
    { value: "create_notification", label: "Create Notification" },
    { value: "create_timeline_event", label: "Create Timeline Event" },
    { value: "create_database_item", label: "Create Database Item" },
    { value: "send_email", label: "Send Email (coming soon)" },
    { value: "webhook", label: "Call Webhook (coming soon)" },
  ];

  const operatorOptions = [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not Equals" },
    { value: "contains", label: "Contains" },
    { value: "greater_than", label: "Greater Than" },
    { value: "less_than", label: "Less Than" },
  ];

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Automation Builder</h3>
            <p className="text-sm text-muted-foreground">
              Create workflows to automate repetitive tasks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="enabled" className="text-sm">
              Enabled
            </Label>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
        </div>

        {/* Automation Name */}
        <div className="space-y-2">
          <Label htmlFor="automation-name">Automation Name</Label>
          <Input
            id="automation-name"
            placeholder="e.g., Create timeline event when task is completed"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Trigger */}
        <div className="space-y-2">
          <Label>When (Trigger)</Label>
          <Select value={trigger} onValueChange={setTrigger}>
            <SelectTrigger>
              <SelectValue placeholder="Select a trigger event..." />
            </SelectTrigger>
            <SelectContent>
              {triggerOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conditions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>If (Conditions) - Optional</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddCondition}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          </div>

          {conditions.map((condition, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="Field name"
                value={condition.field}
                onChange={(e) =>
                  handleUpdateCondition(index, "field", e.target.value)
                }
                className="flex-1"
              />
              <Select
                value={condition.operator}
                onValueChange={(value) =>
                  handleUpdateCondition(index, "operator", value)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operatorOptions.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Value"
                value={condition.value}
                onChange={(e) =>
                  handleUpdateCondition(index, "value", e.target.value)
                }
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveCondition(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Then (Actions)</Label>
            <Button variant="outline" size="sm" onClick={handleAddAction}>
              <Plus className="h-4 w-4 mr-2" />
              Add Action
            </Button>
          </div>

          {actions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
              No actions yet. Click "Add Action" to get started.
            </p>
          )}

          {actions.map((action, index) => (
            <div key={index} className="flex items-center gap-2">
              <Select
                value={action.type}
                onValueChange={(value) => handleUpdateAction(index, value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select an action..." />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveAction(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Automation
          </Button>
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={!trigger || actions.length === 0}
          >
            <Play className="h-4 w-4 mr-2" />
            Test
          </Button>
        </div>

        {/* Tips */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p className="font-medium flex items-center gap-2">
            <Zap className="h-3 w-3" />
            Automation Tips:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Start simple - one trigger, one action</li>
            <li>Use conditions to filter when automation runs</li>
            <li>Test your automation before enabling it</li>
            <li>You can chain multiple actions together</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
