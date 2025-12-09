import { useState, useEffect, useCallback } from 'react';
import { useRoute } from 'wouter';
import { AppLayout } from '@/components/AppLayout';
import { BlockEditor } from '@/components/BlockEditor';
import { CollaborationIndicators, SyncStatusIndicator } from '@/components/CollaborationIndicators';
import { CommentThread } from '@/components/CommentThread';
import { AutoSaveIndicator, SaveStatus } from '@/components/AutoSaveIndicator';
import { trpc } from '@/lib/trpc';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import EmojiPicker from 'emoji-picker-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

/**
 * PageDetailPage displays a single page with its blocks for editing.
 */
export default function PageDetailPage() {
  const [, params] = useRoute('/pages/:id');
  const pageId = params?.id ? parseInt(params.id) : 0;

  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('');
  const [content, setContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date>();

  const { data: page, isLoading, refetch } = trpc.pages.getById.useQuery(
    { id: pageId },
    { enabled: pageId > 0 }
  );
  
  // Real-time collaboration
  const { viewers, isConnected } = useWebSocket({
    pageId,
    onContentChange: () => {
      // Refetch page data when content changes from other users
      refetch();
    },
  });

  const { data: blocks } = trpc.blocks.getByPage.useQuery(
    { pageId },
    { enabled: pageId > 0 }
  );

  const updatePageMutation = trpc.pages.update.useMutation({
    onMutate: () => {
      setSaveStatus('saving');
    },
    onSuccess: () => {
      setSaveStatus('saved');
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      // Reset to idle after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    },
    onError: (error) => {
      setSaveStatus('error');
      toast.error(`Failed to save: ${error.message}`);
      // Reset to idle after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    },
  });

  const updateBlockMutation = trpc.blocks.update.useMutation();
  const createBlockMutation = trpc.blocks.create.useMutation();

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setIcon(page.icon || '');
    }
  }, [page]);

  useEffect(() => {
    if (blocks && blocks.length > 0) {
      // Combine all blocks into single content for editor
      const combinedContent = blocks
        .map((block: any) => JSON.parse(block.content).text || '')
        .join('\n');
      setContent(combinedContent);
    }
  }, [blocks]);

  const handleSave = useCallback(async () => {
    if (!page) return;

    // Update page title and icon
    await updatePageMutation.mutateAsync({
      id: pageId,
      title,
      icon: icon || undefined,
    });

    // Save content as blocks
    if (blocks && blocks.length > 0) {
      // Update first block with content
      await updateBlockMutation.mutateAsync({
        id: blocks[0].id,
        content: JSON.stringify({ text: content }),
      });
    } else {
      // Create first block
      await createBlockMutation.mutateAsync({
        pageId,
        type: 'text',
        content: JSON.stringify({ text: content }),
        position: 0,
      });
    }
  }, [page, pageId, title, icon, content, blocks, updatePageMutation, updateBlockMutation, createBlockMutation]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  // Auto-save with debouncing
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [title, content, icon, hasUnsavedChanges, handleSave]);

  const handleIconSelect = (emojiData: any) => {
    setIcon(emojiData.emoji);
    setHasUnsavedChanges(true);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!page) {
    return (
      <AppLayout>
        <div className="container py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Page not found</h2>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-4xl py-8 space-y-6">
        {/* Page Header */}
        <div className="space-y-4">
          {/* Icon and Title */}
          <div className="flex items-start gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-5xl p-2 h-auto hover:bg-muted"
                >
                  {icon || '📄'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <EmojiPicker onEmojiClick={handleIconSelect} />
              </PopoverContent>
            </Popover>

            <div className="flex-1 space-y-2">
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-4xl font-bold border-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Untitled Page"
              />
            </div>
          </div>

          {/* Auto-Save Indicator and Save Button */}
          <div className="flex items-center justify-between">
            <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
            {hasUnsavedChanges && (
              <Button
                onClick={handleSave}
                disabled={updatePageMutation.isPending}
                size="sm"
              >
                {updatePageMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Collaboration Indicators */}
        <div className="flex items-center justify-between py-2 border-t">
          <CollaborationIndicators pageId={pageId} />
          <SyncStatusIndicator status="synced" />
        </div>

        {/* Content Editor */}
        <BlockEditor
          content={content}
          onChange={handleContentChange}
          placeholder="Start writing your page content..."
        />

        {/* Comments Section */}
        <div className="pt-8 border-t">
          <CommentThread parentType="page" parentId={pageId} />
        </div>
      </div>
    </AppLayout>
  );
}
