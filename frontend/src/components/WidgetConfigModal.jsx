import { useState, useEffect } from "react";

const WidgetConfigModal = ({ widget, isOpen, onClose, onSave }) => {
  // Only store the config part, not the entire widget object
  const [config, setConfig] = useState({});

  // Initialize config when modal opens or widget changes
  useEffect(() => {
    if (isOpen && widget?.config) {
      try {
        const parsedConfig =
          typeof widget.config === "string"
            ? JSON.parse(widget.config)
            : widget.config;
        setConfig(parsedConfig);
      } catch (error) {
        console.error("Error parsing config:", error);
        setConfig({});
      }
    }
  }, [isOpen, widget?.config]); // Only depend on these values

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(config);
  };

  const handleInputChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderConfigForm = () => {
    switch (widget.widget_type) {
      case "github":
        return (
          <div className="config-group">
            <label htmlFor="githubUsername">GitHub Username:</label>
            <input
              type="text"
              id="githubUsername"
              value={config.username || ""}
              onChange={(e) => handleInputChange("username", e.target.value)}
              placeholder="Enter GitHub username"
            />
          </div>
        );

      case "weather":
        return (
          <div className="config-group">
            <label htmlFor="weatherCity">City:</label>
            <input
              type="text"
              id="weatherCity"
              value={config.city || ""}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="Enter city name"
            />
          </div>
        );

      case "news":
        return (
          <>
            <div className="config-group">
              <label htmlFor="newsCategory">Category:</label>
              <select
                id="newsCategory"
                value={config.category || "general"}
                onChange={(e) => handleInputChange("category", e.target.value)}
              >
                <option value="general">General</option>
                <option value="business">Business</option>
                <option value="technology">Technology</option>
                <option value="science">Science</option>
                <option value="health">Health</option>
                <option value="sports">Sports</option>
                <option value="entertainment">Entertainment</option>
              </select>
            </div>
            <div className="config-group">
              <label htmlFor="newsCountry">Country:</label>
              <select
                id="newsCountry"
                value={config.country || "us"}
                onChange={(e) => handleInputChange("country", e.target.value)}
              >
                <option value="us">United States</option>
                <option value="gb">United Kingdom</option>
                <option value="in">India</option>
                <option value="au">Australia</option>
                <option value="ca">Canada</option>
              </select>
            </div>
          </>
        );

      case "todo":
        return (
          <div className="config-group">
            <label htmlFor="todoTheme">Color Theme:</label>
            <select
              id="todoTheme"
              value={config.theme || "default"}
              onChange={(e) => handleInputChange("theme", e.target.value)}
              className="config-select"
            >
              <option value="default">Default Theme</option>
              <option value="dark">Dark Mode</option>
              <option value="blue">Blue Theme</option>
              <option value="green">Green Theme</option>
              <option value="purple">Purple Theme</option>
            </select>

            <label htmlFor="todoSort">Sort Tasks:</label>
            <select
              id="todoSort"
              value={config.sort || "created"}
              onChange={(e) => handleInputChange("sort", e.target.value)}
              className="config-select"
            >
              <option value="created">By Creation Date (Newest First)</option>
              <option value="created-asc">
                By Creation Date (Oldest First)
              </option>
              <option value="alphabetical">Alphabetically (A-Z)</option>
              <option value="alphabetical-desc">Alphabetically (Z-A)</option>
              <option value="completed">Completed First</option>
              <option value="pending">Pending First</option>
            </select>

            <div className="config-checkbox-group">
              <label className="config-checkbox-label">
                <input
                  type="checkbox"
                  checked={config.showCount || true}
                  onChange={(e) =>
                    handleInputChange("showCount", e.target.checked)
                  }
                  className="config-checkbox"
                />
                Show Progress Counter
              </label>
            </div>

            <div className="config-checkbox-group">
              <label className="config-checkbox-label">
                <input
                  type="checkbox"
                  checked={config.autoFocus || false}
                  onChange={(e) =>
                    handleInputChange("autoFocus", e.target.checked)
                  }
                  className="config-checkbox"
                />
                Auto-focus Input Field
              </label>
            </div>

            <div className="config-info">
              <p>🎨 Themes change the color scheme of your todo list</p>
              <p>📊 Sorting affects how tasks are displayed</p>
            </div>
          </div>
        );

      default:
        return <p>No configuration available for this widget type.</p>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Configure {getWidgetDisplayName(widget.widget_type)}</h3>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {renderConfigForm()}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper function
function getWidgetDisplayName(type) {
  const names = {
    github: "GitHub Stats",
    weather: "Weather",
    news: "News",
    todo: "Todo List",
  };
  return names[type] || type;
}

export default WidgetConfigModal;
