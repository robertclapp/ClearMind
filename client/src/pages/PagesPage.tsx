import { useState } from 'react';
import { Link } from 'wouter';
import { AppLayout } from '@/components/AppLayout';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

/**
 * PagesPage displays all pages in the workspace with hierarchical structure.
 */
export default function PagesPage() {
  const { workspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());

  const { data: pageHierarchy, isLoading } = trpc.pages.getHierarchy.useQuery(
    { workspaceId: workspace?.id || 0 },
    { enabled: !!workspace }
  );

  const createPageMutation = trpc.pages.create.useMutation({
    onSuccess: () => {
      toast.success('Page created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create page: ${error.message}`);
    },
  });

  const handleCreatePage = async () => {
    if (!workspace) return;

    await createPageMutation.mutateAsync({
      workspaceId: workspace.id,
      title: 'Untitled Page',
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
          </div>

          {hasChildren && isExpanded && renderPageTree(page.children, level + 1)}
        </div>
      );
    });
  };

  return (
    <AppLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pages</h1>
            <p className="text-muted-foreground">
              Organize your knowledge with nested pages
            </p>
          </div>
          <Button onClick={handleCreatePage} disabled={createPageMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
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
            <CardTitle>All Pages</CardTitle>
            <CardDescription>
              Click to expand folders, select a page to edit
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
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
                <Button onClick={handleCreatePage}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Page
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
