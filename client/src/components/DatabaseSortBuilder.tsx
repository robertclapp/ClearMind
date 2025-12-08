import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface SortCondition {
  id: string;
  property: string;
  direction: 'asc' | 'desc';
}

interface DatabaseSortBuilderProps {
  properties: Array<{ id: string; name: string; type: string }>;
  sorts: SortCondition[];
  onSortsChange: (sorts: SortCondition[]) => void;
}

/**
 * DatabaseSortBuilder provides a UI for multi-column sorting.
 */
export function DatabaseSortBuilder({
  properties,
  sorts,
  onSortsChange,
}: DatabaseSortBuilderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const addSort = () => {
    const newSort: SortCondition = {
      id: `sort_${Date.now()}`,
      property: properties[0]?.id || '',
      direction: 'asc',
    };
    onSortsChange([...sorts, newSort]);
  };

  const updateSort = (id: string, updates: Partial<SortCondition>) => {
    onSortsChange(
      sorts.map((sort) =>
        sort.id === id ? { ...sort, ...updates } : sort
      )
    );
  };

  const removeSort = (id: string) => {
    onSortsChange(sorts.filter((sort) => sort.id !== id));
  };

  const clearAllSorts = () => {
    onSortsChange([]);
    setIsOpen(false);
  };

  const toggleDirection = (id: string) => {
    const sort = sorts.find((s) => s.id === id);
    if (sort) {
      updateSort(id, { direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Sort
          {sorts.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
              {sorts.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Sort</h4>
            {sorts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllSorts}
              >
                Clear all
              </Button>
            )}
          </div>

          {sorts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm mb-4">No sorting applied</p>
              <Button onClick={addSort} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Sort
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sorts.map((sort, index) => {
                const property = properties.find((p) => p.id === sort.property);

                return (
                  <div key={sort.id} className="flex items-center gap-2">
                    {index > 0 && (
                      <span className="text-xs text-muted-foreground">THEN</span>
                    )}
                    
                    {/* Property Select */}
                    <Select
                      value={sort.property}
                      onValueChange={(value) =>
                        updateSort(sort.id, { property: value })
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((prop) => (
                          <SelectItem key={prop.id} value={prop.id}>
                            {prop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Direction Toggle */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleDirection(sort.id)}
                      title={sort.direction === 'asc' ? 'Ascending' : 'Descending'}
                    >
                      {sort.direction === 'asc' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSort(sort.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={addSort}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Sort
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
