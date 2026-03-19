import { useEffect, useRef, useState } from "preact/hooks";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

export function useColumnDragDrop(columnId: string) {
  const [isDragging, setIsDragging] = useState(false);
  const [dropEdge, setDropEdge] = useState<"left" | "right" | null>(null);
  const ref = useRef<HTMLElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cleanupDraggable = draggable({
      element: el,
      dragHandle: handleRef.current ?? undefined,
      getInitialData: () => ({ columnId }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
    const updateDropEdge = (clientX: number) => {
      const rect = el.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      setDropEdge(clientX < mid ? "left" : "right");
    };

    const cleanupDropTarget = dropTargetForElements({
      element: el,
      getData: () => ({ columnId }),
      canDrop: ({ source }) => source.data.columnId !== columnId,
      onDragEnter: ({ location }) => updateDropEdge(location.current.input.clientX),
      onDrag: ({ location }) => updateDropEdge(location.current.input.clientX),
      onDragLeave: () => setDropEdge(null),
      onDrop: () => setDropEdge(null),
    });
    return () => {
      cleanupDraggable();
      cleanupDropTarget();
    };
  }, [columnId]);

  return { ref, handleRef, isDragging, dropEdge };
}
