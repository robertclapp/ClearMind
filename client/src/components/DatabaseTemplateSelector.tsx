import { useState } from 'react';
import { DATABASE_TEMPLATES, DatabaseTemplate } from '@shared/databaseTemplates';
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
import { Search } from 'lucide-react';

interface DatabaseTemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: DatabaseTemplate | null) => void;
}

/**
 * DatabaseTemplateSelector allows users to choose from pre-built database templates
 * or start with a blank database.
 * 
 * Features:
 * - Categorized templates (productivity, personal, business, creative)
 * - Search functionality
 * - Template preview with property list
 * - Option to start blank
 */
export function DatabaseTemplateSelector({
  open,
  onClose,
  onSelect,
}: DatabaseTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = DATABASE_TEMPLATES.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (template: DatabaseTemplate | null) => {
    onSelect(template);
    onClose();
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Choose a Database Template</DialogTitle>
          <DialogDescription>
            Start with a pre-built template or create a blank database
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="productivity">Productivity</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="creative">Creative</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Blank Database Option */}
                  <button
                    onClick={() => handleSelect(null)}
                    className="p-4 border-2 border-dashed rounded-lg hover:border-primary hover:bg-accent transition-colors text-left"
                  >
                    <div className="text-3xl mb-2">➕</div>
                    <h3 className="font-semibold mb-1">Blank Database</h3>
                    <p className="text-sm text-muted-foreground">
                      Start from scratch with a custom schema
                    </p>
                  </button>

                  {/* Template Cards */}
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelect(template)}
                      className="p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors text-left"
                    >
                      <div className="text-3xl mb-2">{template.icon}</div>
                      <h3 className="font-semibold mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.properties.slice(0, 3).map((prop, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-secondary px-2 py-1 rounded"
                          >
                            {prop.name}
                          </span>
                        ))}
                        {template.properties.length > 3 && (
                          <span className="text-xs text-muted-foreground px-2 py-1">
                            +{template.properties.length - 3} more
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {filteredTemplates.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No templates found matching your search.</p>
                    <Button
                      variant="link"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
