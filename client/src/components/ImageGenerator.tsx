import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Image as ImageIcon, Loader2, Download, Copy } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

/**
 * ImageGenerator Component
 * 
 * AI-powered image generation using text prompts.
 * Allows users to create custom illustrations and visual assets.
 * 
 * Features:
 * - Text-to-image generation
 * - Image editing with original image
 * - Download generated images
 * - Copy image URL
 * - Loading states
 */

interface ImageGeneratorProps {
  onImageGenerated?: (url: string) => void;
  className?: string;
}

export function ImageGenerator({ onImageGenerated, className }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState("");

  const generateMutation = trpc.ai.generateImage.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        setGeneratedImage(data.url);
        toast.success("Image generated successfully!");
        onImageGenerated?.(data.url);
      }
    },
    onError: (error) => {
      toast.error(`Failed to generate image: ${error.message}`);
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (editMode && !originalImageUrl.trim()) {
      toast.error("Please provide an original image URL for editing");
      return;
    }

    generateMutation.mutate({
      prompt: prompt.trim(),
      originalImage: editMode && originalImageUrl.trim()
        ? originalImageUrl.trim()
        : undefined,
    });
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clearmind-generated-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const handleCopyUrl = () => {
    if (!generatedImage) return;
    navigator.clipboard.writeText(generatedImage);
    toast.success("Image URL copied to clipboard");
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold mb-1">AI Image Generator</h3>
          <p className="text-sm text-muted-foreground">
            Create custom illustrations and visual assets with AI
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={!editMode ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode(false)}
          >
            Generate New
          </Button>
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode(true)}
          >
            Edit Existing
          </Button>
        </div>

        {/* Original Image URL (Edit Mode) */}
        {editMode && (
          <div className="space-y-2">
            <Label htmlFor="original-image-url">Original Image URL</Label>
            <Input
              id="original-image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={originalImageUrl}
              onChange={(e) => setOriginalImageUrl(e.target.value)}
              disabled={generateMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Provide the URL of an existing image to edit or enhance
            </p>
          </div>
        )}

        {/* Prompt */}
        <div className="space-y-2">
          <Label htmlFor="image-prompt">
            {editMode ? "Describe your edits" : "Describe your image"}
          </Label>
          <Textarea
            id="image-prompt"
            placeholder={
              editMode
                ? "Add a rainbow to this landscape, make it more vibrant..."
                : "A serene landscape with mountains, a lake, and a sunset..."
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            disabled={generateMutation.isPending}
          />
          <p className="text-xs text-muted-foreground">
            Be specific and descriptive for best results
          </p>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={generateMutation.isPending || !prompt.trim()}
          className="w-full"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <ImageIcon className="h-4 w-4 mr-2" />
              {editMode ? "Edit Image" : "Generate Image"}
            </>
          )}
        </Button>

        {/* Generated Image */}
        {generatedImage && (
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden border bg-muted">
              <img
                src={generatedImage}
                alt="Generated image"
                className="w-full h-auto"
              />
            </div>

            {/* Image Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p className="font-medium">Tips for better results:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Be specific about style, colors, and mood</li>
            <li>Include details about composition and perspective</li>
            <li>Mention art style (realistic, cartoon, watercolor, etc.)</li>
            <li>Image generation can take 5-20 seconds</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
