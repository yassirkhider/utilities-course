import type { ReactNode } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export interface DragHandleProps {
  attributes: object;
  listeners: object | undefined;
}

export function SortableItem({ id, children }: { id: string; children: (handleProps: DragHandleProps) => ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ attributes, listeners })}
    </div>
  );
}

export function DragHandle(props: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 touch-none" aria-label="Drag to reorder">
      <GripVertical size={16} />
    </span>
  );
}

export default function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  className,
}: {
  items: T[];
  onReorder: (newItems: T[]) => void;
  renderItem: (item: T, handleProps: DragHandleProps) => ReactNode;
  className?: string;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {(handleProps) => renderItem(item, handleProps)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
