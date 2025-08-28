import { useState } from "react";
import apiClient from "./api";
import "./AddWidget.css";

const AddWidget = ({ onWidgetAdded }) => {
  const [widgetType, setWidgetType] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const widgetOptions = [
    { value: "", label: "Select a widget type" },
    { value: "github", label: "GitHub Stats" },
    { value: "weather", label: "Local Weather" },
    { value: "news", label: "Top News" },
    { value: "todo", label: "Personal Todo List" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!widgetType) return;

    setIsAdding(true);
    try {
      const response = await apiClient.post("/widgets/", {
        widget_type: widgetType,
        config: "{}",
        order: 0,
      });
      onWidgetAdded(response.data);
      setWidgetType("");
    } catch (error) {
      console.error("Error adding widget:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="add-widget-card">
      <h3 className="add-widget-title">➕ Add New Widget</h3>
      <form onSubmit={handleSubmit} className="add-widget-form">
        <select
          value={widgetType}
          onChange={(e) => setWidgetType(e.target.value)}
          disabled={isAdding}
          className="widget-select"
        >
          {widgetOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isAdding || !widgetType}
          className="add-widget-btn"
        >
          {isAdding ? "Adding..." : "Add Widget"}
        </button>
      </form>
    </div>
  );
};

export default AddWidget;
