import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, MoreVertical, GripVertical } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * DatabaseListView Component
 * 
 * Simple list view for database items.
 * Displays items in a clean, scannable list format with checkboxes.
 * 
 * Features:
 * - Clean list layout
 * - Checkbox for completion tracking
 * - Quick actions menu
 * - Drag handle for reordering
 * - Compact and scannable
 */

interface DatabaseListViewProps {
  databaseId: number;
  schema: any;
}

export function DatabaseListView({ databaseId, schema }: DatabaseListViewProps) {
  const { data: items = [], refetch } = trpc.databaseItems.getByDatabase.useQuery({
    databaseId,
  });

  const createMutation = trpc.databaseItems.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Item created");
    },
  });

  const updateMutation = trpc.databaseItems.update.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const getItemTitle = (item: any) => {
    try {
      const props = typeof item.properties === "string" ? JSON.parse(item.properties) : item.properties;
      return props.Title || props.Name || "Untitled";
    } catch {
      return "Untitled";
    }
  };

  const getItemStatus = (item: any) => {
    try {
      const props = typeof item.properties === "string" ? JSON.parse(item.properties) : item.properties;
      return props.Status || props.Done || props.Completed || null;
    } catch {
      return null;
    }
  };

  const isItemCompleted = (item: any) => {
    const status = getItemStatus(item);
    return status === "Done" || status === "Completed" || status === true;
  };

  const toggleItemCompletion = (item: any) => {
    try {
      const props = typeof item.properties === "string" ? JSON.parse(item.properties) : item.properties;
      const currentStatus = isItemCompleted(item);
      
      // Update the appropriate property
      const updatedProps = { ...props };
      if ("Done" in props) {
        updatedProps.Done = !currentStatus;
      } else if ("Completed" in props) {
        updatedProps.Completed = !currentStatus;
      } else if ("Status" in props) {
        updatedProps.Status = currentStatus ? "To Do" : "Done";
      } else {
        updatedProps.Done = !currentStatus;
      }

      updateMutation.mutate({
        id: item.id,
        properties: JSON.stringify(updatedProps),
      });
    } catch (error) {
      toast.error("Failed to update item");
    }
  };

  const handleCreateItem = () => {
    const properties = {
      Title: "New Item",
    };

    createMutation.mutate({
      databaseId,
      properties: JSON.stringify(properties),
    });
  };

  const getItemMetadata = (item: any) => {
    try {
      const props = typeof item.properties === "string" ? JSON.parse(item.properties) : item.properties;
      const metadata: string[] = [];
      
      // Add relevant metadata
      if (props.Priority) metadata.push(props.Priority);
      if (props.Tags) metadata.push(props.Tags);
      if (props.Assignee) metadata.push(props.Assignee);
      
      return metadata.join(" · ");
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>
        <Button onClick={handleCreateItem} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Item
        </Button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p className="text-lg font-medium mb-2">No items yet</p>
          <p className="text-sm mb-4">Create your first item to get started</p>
          <Button onClick={handleCreateItem}>
            <Plus className="h-4 w-4 mr-2" />
            Create Item
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const title = getItemTitle(item);
            const completed = isItemCompleted(item);
            const metadata = getItemMetadata(item);

            return (
              <Card
                key={item.id}
                className={`p-3 hover:shadow-md transition-shadow group ${
                  completed ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Drag Handle */}
                  <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-move" />

                  {/* Checkbox */}
                  <Checkbox
                    checked={completed}
                    onCheckedChange={() => toggleItemCompletion(item)}
                    className="flex-shrink-0"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium ${
                        completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {title}
                    </p>
                    {metadata && (
                      <p className="text-xs text-muted-foreground mt-1">{metadata}</p>
                    )}
                  </div>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.info("Edit item")}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info("Duplicate item")}>
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => toast.info("Delete item")}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
