import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import "./App.css";
import Login from "./Login";
import AddWidget from "./AddWidget";
import SortableWidget from "./components/SortableWidget";
import {
  setAuthToken,
  getUserWidgets,
  deleteUserWidget,
  updateWidgetOrder,
} from "./api";

function App() {
  const [widgets, setWidgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
      fetchWidgets();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchWidgets = async () => {
    try {
      const widgetsData = await getUserWidgets();
      const sortedWidgets = widgetsData.sort((a, b) => a.order - b.order);
      setWidgets(widgetsData);
    } catch (error) {
      console.error("Could not fetch widgets", error);
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (token) => {
    setAuthToken(token);
    fetchWidgets();
  };

  const handleLogout = () => {
    setAuthToken(null);
    setWidgets([]);
  };

  const handleWidgetAdded = (newWidget) => {
    setWidgets((prev) => [...prev, newWidget]);
  };

  const handleDeleteWidget = async (widgetId) => {
    if (!window.confirm("Are you sure you want to delete this widget?")) {
      return;
    }

    try {
      await deleteUserWidget(widgetId);
      setWidgets((prev) => prev.filter((widget) => widget.id !== widgetId));
    } catch (error) {
      console.error("Error deleting widget:", error);
      alert("Failed to delete widget");
    }
  };

  const handleUpdateWidget = (updatedWidget) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === updatedWidget.id ? updatedWidget : widget
      )
    );
  };

  // Handle drag end event
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((item) => item.id === active.id);
      const newIndex = widgets.findIndex((item) => item.id === over.id);

      // Update UI immediately for smooth experience
      const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex);
      const updatedWidgets = reorderedWidgets.map((item, index) => ({
        ...item,
        order: index,
      }));

      setWidgets(updatedWidgets);

      // Send update to backend
      try {
        const updatePromises = updatedWidgets.map((widget, index) =>
          updateWidgetOrder(widget.id, index)
        );
        await Promise.all(updatePromises);
        console.log("Widget orders updated successfully");
      } catch (error) {
        console.error("Error updating widget orders:", error);
        // Revert to previous order if update fails
        setWidgets(widgets); // Revert to original order
        alert("Failed to save widget order. Please try again.");
      }
    }
  };

  // Update widget orders in backend
  const updateWidgetOrders = async (updatedWidgets) => {
    try {
      const updatePromises = updatedWidgets.map((widget, index) =>
        updateWidgetOrder(widget.id, index)
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error updating widget orders:", error);
      // Revert to previous order if update fails
      fetchWidgets(); // Reload from server
    }
  };

  if (isLoading) {
    return <div className="loading">Loading your dashboard</div>;
  }

  if (!localStorage.getItem("authToken")) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Project Nexus</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main className="app-main">
        <div className="content-wrapper">
          <AddWidget onWidgetAdded={handleWidgetAdded} />

          <h2 className="dashboard-title">Your Dashboard</h2>
          {widgets.length === 0 ? (
            <div className="empty-state">
              <p>No widgets configured yet. Add one above!</p>
              <p>✨ Start building your perfect dashboard ✨</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={widgets}
                strategy={verticalListSortingStrategy}
              >
                <div className="widgets-grid">
                  {widgets.map((widget) => (
                    <SortableWidget
                      key={widget.id}
                      widget={widget}
                      onDelete={handleDeleteWidget}
                      onUpdate={handleUpdateWidget}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </main>
    </div>
  );
}

// Helper function to display nice widget names
function getWidgetDisplayName(type) {
  const names = {
    github: "GitHub Stats",
    weather: "Local Weather",
    news: "Top News",
    todo: "Todo List",
  };
  return names[type] || type;
}

export default App;
