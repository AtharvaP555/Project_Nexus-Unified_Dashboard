import WidgetCard from "../WidgetCard";
import DragHandle from "./DragHandle";

const SortableWidget = ({ widget, onDelete, onUpdate }) => {
  return (
    <div className="sortable-widget">
      <DragHandle widget={widget} />
      <WidgetCard widget={widget} onDelete={onDelete} onUpdate={onUpdate} />
    </div>
  );
};

export default SortableWidget;
