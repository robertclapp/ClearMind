import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";

/**
 * CommentThread Component
 * 
 * Displays and manages comments for pages, blocks, or database items.
 * Supports threaded discussions and @mentions.
 * 
 * Features:
 * - Comment creation
 * - Comment display with avatars
 * - Timestamp display
 * - Real-time updates
 * - @mention support (future)
 */

interface CommentThreadProps {
  parentType: "page" | "block" | "databaseItem";
  parentId: number;
  className?: string;
}

export function CommentThread({ parentType, parentId, className }: CommentThreadProps) {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();

  const { data: comments = [], refetch } = trpc.comments.getByParent.useQuery({
    parentType,
    parentId,
  });

  const createMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      refetch();
      setNewComment("");
      toast.success("Comment added");
    },
    onError: (error) => {
      toast.error(`Failed to add comment: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    createMutation.mutate({
      parentType,
      parentId,
      content: newComment.trim(),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* Comment List */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {comment.createdBy.toString().charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      User {comment.createdBy}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Comment Input */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment... (Cmd/Ctrl + Enter to submit)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              disabled={createMutation.isPending}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Tip: Use @ to mention someone
              </p>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || !newComment.trim()}
                size="sm"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
