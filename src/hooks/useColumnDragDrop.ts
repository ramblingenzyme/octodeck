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
    const handle = handleRef.current;
    if (!el) return;
    const cleanupDraggable = draggable({
      element: el,
      dragHandle: handle ?? undefined,
      getInitialData: () => ({ columnId }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });

    // pragmatic-drag-and-drop permanently sets draggable="true" on `el`,
    // which prevents cursor repositioning in child form elements.
    // Only enable draggable during drag-handle interaction.
    el.removeAttribute("draggable");
    const enableDrag = () => {
      el.setAttribute("draggable", "true");
    };
    const disableDrag = () => {
      el.removeAttribute("draggable");
    };
    handle?.addEventListener("pointerdown", enableDrag);
    window.addEventListener("pointerup", disableDrag);

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
      handle?.removeEventListener("pointerdown", enableDrag);
      window.removeEventListener("pointerup", disableDrag);
    };
  }, [columnId]);

  return { ref, handleRef, isDragging, dropEdge };
}
