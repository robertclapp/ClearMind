import { useState, useEffect } from 'react';
import { KEYBOARD_SHORTCUTS, formatShortcutKeys } from '@shared/shortcuts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Keyboard } from 'lucide-react';

interface KeyboardShortcutsPanelProps {
  open: boolean;
  onClose: () => void;
}

/**
 * KeyboardShortcutsPanel displays all available keyboard shortcuts.
 * Opens with Cmd+K and provides searchable, categorized shortcuts reference.
 * 
 * Features:
 * - Searchable shortcuts
 * - Categorized by function (general, navigation, editor, database, timeline)
 * - Platform-specific key display (Cmd on Mac, Ctrl on Windows/Linux)
 * - Visual keyboard key badges
 */
export function KeyboardShortcutsPanel({ open, onClose }: KeyboardShortcutsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSelectedCategory('all');
    }
  }, [open]);

  const filteredShortcuts = KEYBOARD_SHORTCUTS.filter((shortcut) => {
    const matchesSearch =
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatShortcutKeys(shortcut.keys).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === 'all' || shortcut.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group shortcuts by category for "All" tab
  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof KEYBOARD_SHORTCUTS>);

  const categoryLabels = {
    general: 'General',
    navigation: 'Navigation',
    editor: 'Editor',
    database: 'Database',
    timeline: 'Timeline',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Quick reference for all available keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {selectedCategory === 'all' ? (
                // Show all categories with headers
                <div className="space-y-6">
                  {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        {categoryLabels[category as keyof typeof categoryLabels]}
                      </h3>
                      <div className="space-y-2">
                        {shortcuts.map((shortcut) => (
                          <div
                            key={shortcut.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{shortcut.description}</p>
                              <p className="text-sm text-muted-foreground">{shortcut.action}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, index) => (
                                <span key={index}>
                                  <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                                    {key}
                                  </kbd>
                                  {index < shortcut.keys.length - 1 && (
                                    <span className="mx-1 text-muted-foreground">+</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Show single category
                <div className="space-y-2">
                  {filteredShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{shortcut.description}</p>
                        <p className="text-sm text-muted-foreground">{shortcut.action}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, index) => (
                          <span key={index}>
                            <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                              {key}
                            </kbd>
                            {index < shortcut.keys.length - 1 && (
                              <span className="mx-1 text-muted-foreground">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredShortcuts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Keyboard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No shortcuts found</p>
                  <p className="text-sm mt-2">Try a different search term</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="text-xs text-muted-foreground text-center">
          Press <kbd className="px-1 py-0.5 bg-muted border border-border rounded">Esc</kbd> to close
        </div>
      </DialogContent>
    </Dialog>
  );
}
