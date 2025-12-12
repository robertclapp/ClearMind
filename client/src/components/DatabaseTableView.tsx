import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { DatabaseFilterBuilder, FilterCondition } from './DatabaseFilterBuilder';
import { DatabaseSortBuilder, SortCondition } from './DatabaseSortBuilder';

interface DatabaseTableViewProps {
  databaseId: number;
  schema: any;
}

/**
 * DatabaseTableView displays database items in a table format.
 * Supports inline editing, filtering, and sorting.
 */
export function DatabaseTableView({ databaseId, schema }: DatabaseTableViewProps) {
  const [isAddRowOpen, setIsAddRowOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ itemId: number; propId: string } | null>(null);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [sorts, setSorts] = useState<SortCondition[]>([]);

  const { data: items, refetch } = trpc.databaseItems.getByDatabase.useQuery({
    databaseId,
  });

  const createItemMutation = trpc.databaseItems.create.useMutation({
    onSuccess: () => {
      toast.success('Row added');
      setIsAddRowOpen(false);
      setNewRowData({});
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to add row: ${error.message}`);
    },
  });

  const updateItemMutation = trpc.databaseItems.update.useMutation({
    onSuccess: () => {
      toast.success('Updated');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const archiveItemMutation = trpc.databaseItems.archive.useMutation({
    onSuccess: () => {
      toast.success('Row deleted');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete row: ${error.message}`);
    },
  });

  const handleDeleteRow = async (itemId: number) => {
    await archiveItemMutation.mutateAsync({ id: itemId });
  };

  const properties = schema?.properties || [];

  const handleAddRow = async () => {
    await createItemMutation.mutateAsync({
      databaseId,
      properties: JSON.stringify(newRowData),
      position: items?.length || 0,
    });
  };

  const handleUpdateCell = async (itemId: number, propId: string, value: any) => {
    const item = items?.find((i: any) => i.id === itemId);
    if (!item) return;

    const currentProps = JSON.parse(item.properties);
    const updatedProps = { ...currentProps, [propId]: value };

    await updateItemMutation.mutateAsync({
      id: itemId,
      properties: JSON.stringify(updatedProps),
    });

    setEditingCell(null);
  };



  const renderCellEditor = (item: any, property: any) => {
    const props = JSON.parse(item.properties);
    const value = props[property.id] || '';

    switch (property.type) {
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => handleUpdateCell(item.id, property.id, newValue)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {property.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <Checkbox
            checked={value === true}
            onCheckedChange={(checked) => handleUpdateCell(item.id, property.id, checked)}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => handleUpdateCell(item.id, property.id, e.target.value)}
            className="h-8"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleUpdateCell(item.id, property.id, e.target.value)}
            onBlur={() => setEditingCell(null)}
            className="h-8"
            autoFocus
          />
        );

      default: // text, title
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleUpdateCell(item.id, property.id, e.target.value)}
            onBlur={() => setEditingCell(null)}
            className="h-8"
            autoFocus
          />
        );
    }
  };

  const renderCellValue = (item: any, property: any) => {
    const props = JSON.parse(item.properties);
    const value = props[property.id];

    if (editingCell?.itemId === item.id && editingCell?.propId === property.id) {
      return renderCellEditor(item, property);
    }

    switch (property.type) {
      case 'checkbox':
        return <Checkbox checked={value === true} disabled />;
      case 'select':
        return (
          <span className="px-2 py-1 rounded-md bg-muted text-sm">
            {value || '-'}
          </span>
        );
      case 'date':
        return value ? new Date(value).toLocaleDateString() : '-';
      default:
        return (
          <div
            onClick={() => setEditingCell({ itemId: item.id, propId: property.id })}
            className="cursor-text hover:bg-muted/50 px-2 py-1 rounded min-h-[32px]"
          >
            {value || '-'}
          </div>
        );
    }
  };

  // Apply filters and sorts to items
  const filteredAndSortedItems = useMemo(() => {
    if (!items) return [];
    
    let result = [...items];
    
    // Apply filters
    if (filters.length > 0) {
      result = result.filter((item) => {
        const props = JSON.parse(item.properties);
        return filters.every((filter) => {
          const value = props[filter.property];
          
          switch (filter.operator) {
            case 'equals':
              return String(value) === filter.value;
            case 'contains':
              return String(value || '').toLowerCase().includes(filter.value.toLowerCase());
            case 'startsWith':
              return String(value || '').toLowerCase().startsWith(filter.value.toLowerCase());
            case 'endsWith':
              return String(value || '').toLowerCase().endsWith(filter.value.toLowerCase());
            case 'greaterThan':
              return Number(value) > Number(filter.value);
            case 'lessThan':
              return Number(value) < Number(filter.value);
            case 'isEmpty':
              return !value || value === '';
            case 'isNotEmpty':
              return value && value !== '';
            default:
              return true;
          }
        });
      });
    }
    
    // Apply sorts
    if (sorts.length > 0) {
      result.sort((a, b) => {
        const propsA = JSON.parse(a.properties);
        const propsB = JSON.parse(b.properties);
        
        for (const sort of sorts) {
          const valueA = propsA[sort.property];
          const valueB = propsB[sort.property];
          
          let comparison = 0;
          if (valueA < valueB) comparison = -1;
          if (valueA > valueB) comparison = 1;
          
          if (comparison !== 0) {
            return sort.direction === 'asc' ? comparison : -comparison;
          }
        }
        return 0;
      });
    }
    
    return result;
  }, [items, filters, sorts]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {filteredAndSortedItems.length} rows
            {filters.length > 0 && ` (filtered from ${items?.length || 0})`}
          </div>
          <DatabaseFilterBuilder
            properties={properties.map((p: any) => ({ id: p.id, name: p.name, type: p.type }))}
            filters={filters}
            onFiltersChange={setFilters}
          />
          <DatabaseSortBuilder
            properties={properties.map((p: any) => ({ id: p.id, name: p.name, type: p.type }))}
            sorts={sorts}
            onSortsChange={setSorts}
          />
        </div>
        <Button onClick={() => setIsAddRowOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Row
        </Button>
      </div>

      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {properties.map((prop: any) => (
                <TableHead key={prop.id} className="min-w-[150px]">
                  {prop.name}
                </TableHead>
              ))}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedItems.length > 0 ? (
              filteredAndSortedItems.map((item: any) => (
                <TableRow key={item.id}>
                  {properties.map((prop: any) => (
                    <TableCell key={prop.id}>
                      {renderCellValue(item, prop)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRow(item.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={properties.length + 1} className="text-center py-8 text-muted-foreground">
                  No rows yet. Click "Add Row" to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Row Dialog */}
      <Dialog open={isAddRowOpen} onOpenChange={setIsAddRowOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Row</DialogTitle>
            <DialogDescription>
              Enter values for the new row
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {properties.map((prop: any) => (
              <div key={prop.id} className="space-y-2">
                <label className="text-sm font-medium">{prop.name}</label>
                {prop.type === 'select' ? (
                  <Select
                    value={newRowData[prop.id] || ''}
                    onValueChange={(value) =>
                      setNewRowData({ ...newRowData, [prop.id]: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {prop.options?.map((option: string) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : prop.type === 'checkbox' ? (
                  <Checkbox
                    checked={newRowData[prop.id] === true}
                    onCheckedChange={(checked) =>
                      setNewRowData({ ...newRowData, [prop.id]: checked })
                    }
                  />
                ) : prop.type === 'date' ? (
                  <Input
                    type="date"
                    value={newRowData[prop.id] || ''}
                    onChange={(e) =>
                      setNewRowData({ ...newRowData, [prop.id]: e.target.value })
                    }
                  />
                ) : prop.type === 'number' ? (
                  <Input
                    type="number"
                    value={newRowData[prop.id] || ''}
                    onChange={(e) =>
                      setNewRowData({ ...newRowData, [prop.id]: e.target.value })
                    }
                  />
                ) : (
                  <Input
                    value={newRowData[prop.id] || ''}
                    onChange={(e) =>
                      setNewRowData({ ...newRowData, [prop.id]: e.target.value })
                    }
                    placeholder={`Enter ${prop.name.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRowOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRow} disabled={createItemMutation.isPending}>
              Add Row
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
