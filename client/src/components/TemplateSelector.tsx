import { useState } from 'react';
import { PAGE_TEMPLATES, PageTemplate } from '@shared/templates';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText } from 'lucide-react';

interface TemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PageTemplate | null) => void;
}

/**
 * TemplateSelector provides a dialog for choosing page templates.
 * 
 * Features:
 * - Categorized templates (productivity, planning, personal, creative)
 * - Search functionality
 * - Blank page option
 * - Template previews with icons and descriptions
 */
export function TemplateSelector({ open, onClose, onSelectTemplate }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = PAGE_TEMPLATES.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: PageTemplate | null) => {
    onSelectTemplate(template);
    onClose();
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Start with a pre-built template or create a blank page
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="productivity">Productivity</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="creative">Creative</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Blank Page Option */}
                <button
                  onClick={() => handleSelectTemplate(null)}
                  className="flex flex-col items-start p-4 rounded-lg border-2 border-dashed border-muted hover:border-primary hover:bg-accent transition-colors text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5" />
                    <span className="font-semibold">Blank Page</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Start with an empty page
                  </p>
                </button>

                {/* Template Options */}
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="flex flex-col items-start p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{template.icon}</span>
                      <span className="font-semibold">{template.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No templates found</p>
                  <p className="text-sm mt-2">Try a different search term</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
