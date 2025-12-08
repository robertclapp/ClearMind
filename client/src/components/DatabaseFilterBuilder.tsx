import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, Filter } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface FilterCondition {
  id: string;
  property: string;
  operator: string;
  value: string;
}

interface DatabaseFilterBuilderProps {
  properties: Array<{ id: string; name: string; type: string }>;
  filters: FilterCondition[];
  onFiltersChange: (filters: FilterCondition[]) => void;
}

const OPERATORS = {
  text: [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' },
  ],
  number: [
    { value: 'equals', label: '=' },
    { value: 'notEquals', label: '≠' },
    { value: 'greaterThan', label: '>' },
    { value: 'lessThan', label: '<' },
    { value: 'greaterThanOrEqual', label: '≥' },
    { value: 'lessThanOrEqual', label: '≤' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' },
  ],
  date: [
    { value: 'equals', label: 'Is' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' },
  ],
  select: [
    { value: 'equals', label: 'Is' },
    { value: 'notEquals', label: 'Is not' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' },
  ],
  checkbox: [
    { value: 'equals', label: 'Is' },
  ],
};

/**
 * DatabaseFilterBuilder provides a UI for building complex database filters.
 */
export function DatabaseFilterBuilder({
  properties,
  filters,
  onFiltersChange,
}: DatabaseFilterBuilderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: `filter_${Date.now()}`,
      property: properties[0]?.id || '',
      operator: 'equals',
      value: '',
    };
    onFiltersChange([...filters, newFilter]);
  };

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    onFiltersChange(
      filters.map((filter) =>
        filter.id === id ? { ...filter, ...updates } : filter
      )
    );
  };

  const removeFilter = (id: string) => {
    onFiltersChange(filters.filter((filter) => filter.id !== id));
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
    setIsOpen(false);
  };

  const getOperatorsForProperty = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    if (!property) return OPERATORS.text;
    
    const type = property.type as keyof typeof OPERATORS;
    return OPERATORS[type] || OPERATORS.text;
  };

  const needsValueInput = (operator: string) => {
    return !['isEmpty', 'isNotEmpty'].includes(operator);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {filters.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
              {filters.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Filters</h4>
            {filters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
              >
                Clear all
              </Button>
            )}
          </div>

          {filters.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm mb-4">No filters applied</p>
              <Button onClick={addFilter} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Filter
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filters.map((filter, index) => {
                const property = properties.find((p) => p.id === filter.property);
                const operators = getOperatorsForProperty(filter.property);

                return (
                  <div key={filter.id} className="flex items-center gap-2">
                    {index > 0 && (
                      <span className="text-xs text-muted-foreground">AND</span>
                    )}
                    
                    {/* Property Select */}
                    <Select
                      value={filter.property}
                      onValueChange={(value) =>
                        updateFilter(filter.id, { property: value })
                      }
                    >
                      <SelectTrigger className="w-[140px]">
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

                    {/* Operator Select */}
                    <Select
                      value={filter.operator}
                      onValueChange={(value) =>
                        updateFilter(filter.id, { operator: value })
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Value Input */}
                    {needsValueInput(filter.operator) && (
                      <Input
                        value={filter.value}
                        onChange={(e) =>
                          updateFilter(filter.id, { value: e.target.value })
                        }
                        placeholder="Value"
                        className="flex-1"
                      />
                    )}

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFilter(filter.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={addFilter}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Filter
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
