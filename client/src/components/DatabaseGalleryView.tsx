import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Image as ImageIcon, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";

/**
 * DatabaseGalleryView Component
 * 
 * Gallery view for database items with image/file properties.
 * Displays items as cards with preview images in a responsive grid.
 * 
 * Features:
 * - Responsive grid layout
 * - Image preview cards
 * - Fallback for items without images
 * - Click to view details
 * - Visual card design
 */

interface DatabaseGalleryViewProps {
  databaseId: number;
  schema: any;
}

export function DatabaseGalleryView({ databaseId, schema }: DatabaseGalleryViewProps) {
  const { data: items = [], refetch } = trpc.databaseItems.getByDatabase.useQuery({
    databaseId,
  });

  const createMutation = trpc.databaseItems.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Item created");
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

  const getItemImage = (item: any) => {
    try {
      const props = typeof item.properties === "string" ? JSON.parse(item.properties) : item.properties;
      // Look for common image property names
      return props.Image || props.Cover || props.Thumbnail || props.Photo || null;
    } catch {
      return null;
    }
  };

  const getItemDescription = (item: any) => {
    try {
      const props = typeof item.properties === "string" ? JSON.parse(item.properties) : item.properties;
      return props.Description || props.Summary || "";
    } catch {
      return "";
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

      {/* Gallery Grid */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No items yet</p>
          <p className="text-sm mb-4">Create your first item to get started</p>
          <Button onClick={handleCreateItem}>
            <Plus className="h-4 w-4 mr-2" />
            Create Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const title = getItemTitle(item);
            const image = getItemImage(item);
            const description = getItemDescription(item);

            return (
              <Card
                key={item.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => toast.info(`Item: ${title}`)}
              >
                {/* Image */}
                <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  {image ? (
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold mb-1 truncate">{title}</h3>
                  {description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {description}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}

          {/* Add New Card */}
          <Card
            className="aspect-square border-dashed cursor-pointer hover:bg-accent transition-colors flex items-center justify-center"
            onClick={handleCreateItem}
          >
            <div className="text-center">
              <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Add Item</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
