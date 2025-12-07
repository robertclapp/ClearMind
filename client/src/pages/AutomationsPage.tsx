import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AutomationBuilder } from "@/components/AutomationBuilder";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Zap, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

/**
 * AutomationsPage displays and manages all user automations.
 */
export default function AutomationsPage() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>();

  const { data: automations, refetch } = trpc.automations.list.useQuery();

  const updateMutation = trpc.automations.update.useMutation({
    onSuccess: () => {
      toast.success("Automation updated");
      refetch();
    },
  });

  const deleteMutation = trpc.automations.delete.useMutation({
    onSuccess: () => {
      toast.success("Automation deleted");
      refetch();
    },
  });

  const handleToggleEnabled = (id: number, enabled: boolean) => {
    updateMutation.mutate({ id, enabled: !enabled });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this automation?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSave = () => {
    setShowBuilder(false);
    setEditingId(undefined);
    refetch();
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Automations</h1>
            <p className="text-muted-foreground">
              Automate repetitive tasks and workflows
            </p>
          </div>
          <Button onClick={() => setShowBuilder(!showBuilder)}>
            <Plus className="h-4 w-4 mr-2" />
            New Automation
          </Button>
        </div>

        {/* Automation Builder */}
        {showBuilder && (
          <AutomationBuilder
            automationId={editingId}
            onSave={handleSave}
          />
        )}

        {/* Automations List */}
        <div className="space-y-4">
          {!automations || automations.length === 0 ? (
            <Card className="p-12 text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                No automations yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first automation to start automating your workflows
              </p>
              <Button onClick={() => setShowBuilder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Automation
              </Button>
            </Card>
          ) : (
            automations.map((automation: any) => (
              <Card key={automation.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {automation.name}
                      </h3>
                      <Badge variant={automation.enabled ? "default" : "secondary"}>
                        {automation.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <span className="font-medium">When:</span>{" "}
                        {automation.trigger.replace(/_/g, " ")}
                      </p>
                      {automation.conditions && (
                        <p>
                          <span className="font-medium">If:</span>{" "}
                          {JSON.parse(automation.conditions).length} condition(s)
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Then:</span>{" "}
                        {JSON.parse(automation.actions).length} action(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={automation.enabled}
                      onCheckedChange={() =>
                        handleToggleEnabled(automation.id, automation.enabled)
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingId(automation.id);
                        setShowBuilder(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(automation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
