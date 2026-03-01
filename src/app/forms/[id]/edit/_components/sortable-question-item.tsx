"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export function SortableQuestionItem({
    id,
    children,
}: {
    id: string;
    children: React.ReactNode;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        position: "relative" as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={isDragging ? "opacity-50" : ""}
        >
            <div
                {...attributes}
                {...listeners}
                className="absolute left-1/2 -top-3 -translate-x-1/2 cursor-grab active:cursor-grabbing z-10 bg-background border shadow-sm rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
                <GripVertical className="w-4 h-4" />
            </div>

            {children}
        </div>
    );
}
