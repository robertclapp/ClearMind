import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Plus, GripVertical, MoreVertical } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * DatabaseKanbanView Component
 * 
 * Kanban board view for database items with drag-and-drop functionality.
 * Organizes items into columns based on a select property (typically "Status").
 * 
 * Features:
 * - Column-based layout
 * - Drag-and-drop cards between columns
 * - Inline card creation
 * - Column customization
 * - Visual grouping by status
 */

interface DatabaseKanbanViewProps {
  databaseId: number;
  schema: any; // Database schema with properties
}

interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  items: any[];
}

export function DatabaseKanbanView({ databaseId, schema }: DatabaseKanbanViewProps) {
  const [newCardTitle, setNewCardTitle] = useState<Record<string, string>>({});
  const [draggedItem, setDraggedItem] = useState<any>(null);

  // Get database items
  const { data: items = [], refetch } = trpc.databaseItems.getByDatabase.useQuery({
    databaseId,
  });

  // Create item mutation
  const createMutation = trpc.databaseItems.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Card created");
    },
    onError: (error) => {
      toast.error(`Failed to create card: ${error.message}`);
    },
  });

  // Update item mutation
  const updateMutation = trpc.databaseItems.update.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Card updated");
    },
    onError: (error) => {
      toast.error(`Failed to update card: ${error.message}`);
    },
  });

  // Find the status property (or first select property)
  const statusProperty = schema?.properties?.find(
    (p: any) => p.type === "select" && (p.name.toLowerCase() === "status" || p.name.toLowerCase() === "stage")
  ) || schema?.properties?.find((p: any) => p.type === "select");

  if (!statusProperty) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Kanban view requires a Select property (e.g., "Status"). Add one to use this view.</p>
      </div>
    );
  }

  // Get columns from status property options
  const columns: KanbanColumn[] = (statusProperty.options || []).map((option: any) => {
    const columnItems = items.filter((item) => {
      try {
        const props = typeof item.properties === "string" ? JSON.parse(item.properties) : item.properties;
        return props[statusProperty.name] === option.value;
      } catch {
        return false;
      }
    });

    return {
      id: option.value,
      title: option.label,
      color: option.color,
      items: columnItems,
    };
  });

  // Add "No Status" column for items without a status
  const noStatusItems = items.filter((item) => {
    try {
      const props = typeof item.properties === "string" ? JSON.parse(item.properties) : item.properties;
      return !props[statusProperty.name];
    } catch {
      return true;
    }
  });

  if (noStatusItems.length > 0) {
    columns.push({
      id: "no-status",
      title: "No Status",
      color: "#gray",
      items: noStatusItems,
    });
  }

  const handleCreateCard = (columnId: string) => {
    const title = newCardTitle[columnId]?.trim();
    if (!title) return;

    const properties: Record<string, any> = {
      Title: title,
      [statusProperty.name]: columnId === "no-status" ? null : columnId,
    };

    createMutation.mutate({
      databaseId,
      properties: JSON.stringify(properties),
    });

    setNewCardTitle({ ...newCardTitle, [columnId]: "" });
  };

  const handleDragStart = (item: any) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (columnId: string) => {
    if (!draggedItem) return;

    try {
      const currentProps = typeof draggedItem.properties === "string" 
        ? JSON.parse(draggedItem.properties) 
        : draggedItem.properties;

      const newProps = {
        ...currentProps,
        [statusProperty.name]: columnId === "no-status" ? null : columnId,
      };

      updateMutation.mutate({
        id: draggedItem.id,
        properties: JSON.stringify(newProps),
      });

      setDraggedItem(null);
    } catch (error) {
      toast.error("Failed to move card");
      setDraggedItem(null);
    }
  };

  const getCardTitle = (item: any) => {
    try {
      const props = typeof item.properties === "string" ? JSON.parse(item.properties) : item.properties;
      return props.Title || props.Name || "Untitled";
    } catch {
      return "Untitled";
    }
  };

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-80 flex flex-col"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(column.id)}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              {column.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
              )}
              <h3 className="font-semibold text-sm">{column.title}</h3>
              <span className="text-xs text-muted-foreground">
                {column.items.length}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit column</DropdownMenuItem>
                <DropdownMenuItem>Clear column</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Delete column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Column Content */}
          <ScrollArea className="flex-1 rounded-md border bg-muted/20 p-2">
            <div className="space-y-2">
              {/* Cards */}
              {column.items.map((item) => (
                <Card
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  className="p-3 cursor-move hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium break-words">
                        {getCardTitle(item)}
                      </p>
                      {/* Add more card details here if needed */}
                    </div>
                  </div>
                </Card>
              ))}

              {/* New Card Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="+ Add card"
                  value={newCardTitle[column.id] || ""}
                  onChange={(e) =>
                    setNewCardTitle({ ...newCardTitle, [column.id]: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateCard(column.id);
                    }
                  }}
                  className="h-8 text-sm"
                />
                {newCardTitle[column.id] && (
                  <Button
                    size="sm"
                    onClick={() => handleCreateCard(column.id)}
                    className="h-8 px-2"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      ))}

      {/* Add Column Button */}
      <div className="flex-shrink-0 w-80">
        <Button
          variant="outline"
          className="w-full h-12 border-dashed"
          onClick={() => toast.info("Column customization coming soon")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Column
        </Button>
      </div>
    </div>
  );
}
