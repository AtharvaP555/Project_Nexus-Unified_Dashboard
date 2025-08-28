import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const DragHandle = ({ widget }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="drag-handle"
      title="Drag to reorder"
    >
      ⋮⋮ {/* This is a drag handle icon */}
    </div>
  );
};

export default DragHandle;
