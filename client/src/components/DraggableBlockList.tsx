import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { BlockEditor } from './BlockEditor';

interface Block {
  id: number;
  type: string;
  content: string;
  position: number;
}

interface DraggableBlockProps {
  block: Block;
  onContentChange: (id: number, content: string) => void;
}

/**
 * DraggableBlock wraps a block with drag-and-drop functionality.
 */
function DraggableBlock({ block, onContentChange }: DraggableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleContentChange = (content: string) => {
    onContentChange(block.id, content);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-start gap-2 mb-4"
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mt-2 p-1 hover:bg-muted rounded"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Block Content */}
      <div className="flex-1">
        <BlockEditor
          content={JSON.parse(block.content).text || ''}
          onChange={handleContentChange}
          placeholder="Type something..."
        />
      </div>
    </div>
  );
}

interface DraggableBlockListProps {
  blocks: Block[];
  onReorder: (blocks: Block[]) => void;
  onContentChange: (id: number, content: string) => void;
}

/**
 * DraggableBlockList provides drag-and-drop reordering for blocks.
 */
export function DraggableBlockList({
  blocks,
  onReorder,
  onContentChange,
}: DraggableBlockListProps) {
  const [items, setItems] = useState(blocks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before dragging starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        position: index,
      }));

      setItems(newItems);
      onReorder(newItems);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((block) => block.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((block) => (
            <DraggableBlock
              key={block.id}
              block={block}
              onContentChange={onContentChange}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
