import { useState } from 'react';
import { Link } from 'wouter';
import { AppLayout } from '@/components/AppLayout';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, ChevronRight, ChevronDown, Archive, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { TemplateSelector } from '@/components/TemplateSelector';
import { PageTemplate } from '@shared/templates';

/**
 * PagesPage displays all pages in the workspace with hierarchical structure.
 */
export default function PagesPage() {
  const { workspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const { data: pageHierarchy, isLoading } = trpc.pages.getHierarchy.useQuery(
    { workspaceId: workspace?.id || 0 },
    { enabled: !!workspace && !showArchived }
  );

  const { data: archivedPages, isLoading: isLoadingArchived } = trpc.pages.getArchived.useQuery(
    { workspaceId: workspace?.id || 0 },
    { enabled: !!workspace && showArchived }
  );

  const utils = trpc.useUtils();

  const createPageMutation = trpc.pages.create.useMutation({
    onSuccess: () => {
      toast.success('Page created successfully');
      utils.pages.getHierarchy.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to create page: ${error.message}`);
    },
  });

  const archiveMutation = trpc.pages.archive.useMutation({
    onSuccess: () => {
      toast.success('Page archived');
      utils.pages.getHierarchy.invalidate();
      utils.pages.getArchived.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to archive page: ${error.message}`);
    },
  });

  const unarchiveMutation = trpc.pages.unarchive.useMutation({
    onSuccess: () => {
      toast.success('Page restored');
      utils.pages.getHierarchy.invalidate();
      utils.pages.getArchived.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to restore page: ${error.message}`);
    },
  });

  const handleCreatePage = async (template: PageTemplate | null) => {
    if (!workspace) return;

    const title = template ? template.title : 'Untitled Page';
    const content = template ? JSON.stringify(template.content) : '';

    await createPageMutation.mutateAsync({
      workspaceId: workspace.id,
      title,
      position: 0,
    });
  };

  const toggleExpanded = (pageId: number) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId);
    } else {
      newExpanded.add(pageId);
    }
    setExpandedPages(newExpanded);
  };

  const renderPageTree = (pages: any[], level: number = 0) => {
    return pages.map((page) => {
      const hasChildren = page.children && page.children.length > 0;
      const isExpanded = expandedPages.has(page.id);

      return (
        <div key={page.id}>
          <div
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group"
            style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
          >
            {hasChildren && (
              <button
                onClick={() => toggleExpanded(page.id)}
                className="p-1 hover:bg-background rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}
            
            <Link href={`/pages/${page.id}`}>
              <a className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xl">{page.icon || '📄'}</span>
                <span className="font-medium truncate">{page.title}</span>
              </a>
            </Link>

            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {new Date(page.updatedAt).toLocaleDateString()}
            </span>

            {!showArchived && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => archiveMutation.mutate({ id: page.id })}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Archive className="h-4 w-4" />
              </Button>
            )}
          </div>

          {hasChildren && isExpanded && renderPageTree(page.children, level + 1)}
        </div>
      );
    });
  };

  const renderArchivedPages = () => {
    if (!archivedPages || archivedPages.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Archive className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No archived pages</p>
          <p>Archived pages will appear here</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {archivedPages.map((page) => (
          <div
            key={page.id}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group"
          >
            <Link href={`/pages/${page.id}`}>
              <a className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xl">{page.icon || '📄'}</span>
                <span className="font-medium truncate">{page.title}</span>
              </a>
            </Link>

            <span className="text-xs text-muted-foreground">
              Archived {page.archivedAt ? new Date(page.archivedAt).toLocaleDateString() : ''}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => unarchiveMutation.mutate({ id: page.id })}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{showArchived ? 'Archived Pages' : 'Pages'}</h1>
            <p className="text-muted-foreground">
              {showArchived ? 'Restore or permanently delete archived pages' : 'Organize your knowledge with nested pages'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={showArchived ? 'default' : 'outline'}
              onClick={() => setShowArchived(!showArchived)}
            >
              {showArchived ? (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Active Pages
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 mr-2" />
                  Archived
                </>
              )}
            </Button>
            {!showArchived && (
              <Button onClick={() => setShowTemplateSelector(true)} disabled={createPageMutation.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                New Page
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Pages List */}
        <Card>
          <CardHeader>
            <CardTitle>{showArchived ? 'Archived Pages' : 'All Pages'}</CardTitle>
            <CardDescription>
              {showArchived ? 'Click to restore pages from archive' : 'Click to expand folders, select a page to edit'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showArchived ? (
              isLoadingArchived ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading archived pages...
                </div>
              ) : (
                renderArchivedPages()
              )
            ) : isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading pages...
              </div>
            ) : pageHierarchy && pageHierarchy.length > 0 ? (
              <div className="space-y-1">
                {renderPageTree(pageHierarchy)}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No pages yet</p>
                <p className="mb-4">Create your first page to get started</p>
                <Button onClick={() => setShowTemplateSelector(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Page
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Template Selector Dialog */}
      <TemplateSelector
        open={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleCreatePage}
      />
    </AppLayout>
  );
}
