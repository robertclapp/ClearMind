import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, FileText, Database, Calendar, MessageSquare, Loader2 } from 'lucide-react';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * SearchModal provides global search across all content types.
 * Triggered by Cmd+Shift+F keyboard shortcut.
 */
export function SearchModal({ open, onClose }: SearchModalProps) {
  const { workspace } = useWorkspace();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: results, isLoading } = trpc.search.global.useQuery(
    {
      query,
      workspaceId: workspace?.id || 0,
      limit: 50,
    },
    {
      enabled: !!workspace && query.trim().length > 0,
    }
  );

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!results || results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          navigateToResult(results[selectedIndex].url);
        }
      }
    },
    [results, selectedIndex]
  );

  const navigateToResult = (url: string) => {
    setLocation(url);
    onClose();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page':
      case 'block':
        return <FileText className="h-4 w-4" />;
      case 'database':
      case 'database-item':
        return <Database className="h-4 w-4" />;
      case 'timeline-event':
        return <Calendar className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'page':
        return 'Page';
      case 'block':
        return 'Block';
      case 'database':
        return 'Database';
      case 'database-item':
        return 'Database Item';
      case 'timeline-event':
        return 'Timeline Event';
      case 'comment':
        return 'Comment';
      default:
        return type;
    }
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Group results by type
  const groupedResults = results?.reduce((acc, result) => {
    const type = result.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(result);
    return acc;
  }, {} as Record<string, typeof results>);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search ClearMind
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-6 pt-4">
          <Input
            autoFocus
            placeholder="Search pages, databases, timeline, comments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-lg"
          />
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[50vh] px-6 pb-6">
          {isLoading && query.trim().length > 0 && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Searching...
            </div>
          )}

          {!isLoading && query.trim().length > 0 && (!results || results.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No results found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}

          {!isLoading && query.trim().length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Start typing to search</p>
              <p className="text-sm">Search across pages, databases, timeline, and comments</p>
              <div className="mt-6 text-xs space-y-1">
                <p><kbd className="px-2 py-1 bg-muted rounded">↑</kbd> <kbd className="px-2 py-1 bg-muted rounded">↓</kbd> Navigate</p>
                <p><kbd className="px-2 py-1 bg-muted rounded">Enter</kbd> Open</p>
                <p><kbd className="px-2 py-1 bg-muted rounded">Esc</kbd> Close</p>
              </div>
            </div>
          )}

          {!isLoading && results && results.length > 0 && (
            <div className="space-y-6 mt-4">
              {Object.entries(groupedResults || {}).map(([type, items]) => (
                <div key={type}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    {getTypeIcon(type)}
                    {getTypeLabel(type)}s ({items.length})
                  </h3>
                  <div className="space-y-1">
                    {items.map((result, index) => {
                      const globalIndex = results.indexOf(result);
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <button
                          key={result.id}
                          onClick={() => navigateToResult(result.url)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-accent text-accent-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl mt-0.5">{result.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {highlightMatch(result.title, query)}
                              </div>
                              {result.content && (
                                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {highlightMatch(result.content, query)}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">
                                Updated {new Date(result.updatedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
