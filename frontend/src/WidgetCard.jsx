import { useState, useEffect } from "react";
import apiClient from "./api";
import GitHubWidget from "./components/GitHubWidget";
import WeatherWidget from "./components/WeatherWidget";
import NewsWidget from "./components/NewsWidget";
import TodoWidget from "./components/TodoWidget";
import WidgetConfigModal from "./components/WidgetConfigModal";
import "./WidgetCard.css";

const WidgetCard = ({ widget, onDelete, onUpdate }) => {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState({});

  // Parse config when widget changes
  useEffect(() => {
    try {
      const config = widget.config ? JSON.parse(widget.config) : {};
      setWidgetConfig(config);
    } catch (error) {
      console.error("Error parsing widget config:", error);
      setWidgetConfig({});
    }
  }, [widget.config]);

  const handleSaveConfig = async (newConfig) => {
    try {
      const response = await apiClient.patch(`/widgets/${widget.id}/`, {
        config: JSON.stringify(newConfig),
      });
      onUpdate(response.data);
      setIsConfigModalOpen(false);
    } catch (error) {
      console.error("Error updating widget config:", error);
      alert("Failed to save configuration");
    }
  };

  const getWidgetIcon = (type) => {
    const icons = {
      github: "🐙",
      weather: "☀️",
      news: "📰",
      todo: "✅",
    };
    return icons[type] || "📊";
  };

  // Render the appropriate widget content
  const renderWidgetContent = () => {
    switch (widget.widget_type) {
      case "github":
        return (
          <GitHubWidget
            key={`${widget.id}-${widgetConfig.username || "default"}`}
            config={widgetConfig}
          />
        );
      case "weather":
        return <WeatherWidget config={widgetConfig} />;
      case "news":
        return <NewsWidget config={widgetConfig} />;
      case "todo":
        return <TodoWidget config={widgetConfig} />;
      default:
        return <p>Unknown widget type</p>;
    }
  };

  return (
    <>
      <div className="widget-card">
        <div className="widget-header">
          <span className="widget-icon">
            {getWidgetIcon(widget.widget_type)}
          </span>
          <h3 className="widget-title">
            {getWidgetDisplayName(widget.widget_type)}
          </h3>
          {/* This div will be replaced by the actual drag handle */}
          <div className="drag-handle-placeholder"></div>
        </div>

        <div className="widget-type">
          <span className="type-badge">{widget.widget_type}</span>
          {/* Show configured values */}
          {widgetConfig.username && (
            <span className="config-badge">@{widgetConfig.username}</span>
          )}
          {widgetConfig.city && (
            <span className="config-badge">📍{widgetConfig.city}</span>
          )}
        </div>

        {/* Widget Content */}
        <div className="widget-content">{renderWidgetContent()}</div>

        <div className="widget-actions">
          {/* Only show Configure button for widgets that need configuration */}
          {widget.widget_type !== "todo" && (
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="btn-configure"
            >
              ⚙️ Configure
            </button>
          )}
          <button onClick={() => onDelete(widget.id)} className="btn-delete">
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Configuration Modal */}
      <WidgetConfigModal
        widget={widget}
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleSaveConfig}
      />
    </>
  );
};

function getWidgetDisplayName(type) {
  const names = {
    github: "GitHub Stats",
    weather: "Local Weather",
    news: "Top News",
    todo: "Todo List",
  };
  return names[type] || type;
}

export default WidgetCard;
