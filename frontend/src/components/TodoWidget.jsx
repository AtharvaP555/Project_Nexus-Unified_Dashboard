import { useState, useEffect, useRef } from "react";

const TodoWidget = ({ config }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  // Apply theme based on configuration
  const theme = config?.theme || "default";
  const sortMethod = config?.sort || "created";
  const showCount = config?.showCount !== false; // Default to true
  const autoFocus = config?.autoFocus || false;

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem("dashboardTodos");
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (error) {
        console.error("Error parsing saved todos:", error);
      }
    }
    setLoading(false);
  }, []);

  // Auto-focus input if configured
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("dashboardTodos", JSON.stringify(todos));
    }
  }, [todos, loading]);

  // Sort todos based on configuration
  const sortedTodos = [...todos].sort((a, b) => {
    switch (sortMethod) {
      case "created":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "created-asc":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "alphabetical":
        return a.text.localeCompare(b.text);
      case "alphabetical-desc":
        return b.text.localeCompare(a.text);
      case "pending":
        return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
      case "completed":
        return a.completed === b.completed ? 0 : a.completed ? -1 : 1;
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodoItem = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTodos([...todos, newTodoItem]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;

  if (loading) return <div className="widget-loading">Loading todos...</div>;

  return (
    <div className={`todo-widget theme-${theme}`}>
      <h4>Todo List</h4>

      <div className="todo-input-container">
        <input
          ref={inputRef}
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new task..."
          className="todo-input"
        />
        <button
          onClick={addTodo}
          className="todo-add-btn"
          disabled={!newTodo.trim()}
        >
          ➕
        </button>
      </div>

      <div className="todo-list">
        {sortedTodos.length === 0 ? (
          <p className="todo-empty">No tasks yet. Add one above!</p>
        ) : (
          sortedTodos.map((todo) => (
            <div
              key={todo.id}
              className={`todo-item ${todo.completed ? "completed" : ""}`}
            >
              <label className="todo-label">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="todo-checkbox"
                />
                <span className="todo-text">{todo.text}</span>
              </label>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="todo-delete-btn"
                title="Delete task"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {totalCount > 0 && showCount && (
        <div className="todo-footer">
          <span className="todo-count">
            {completedCount} of {totalCount} completed
          </span>
          {completedCount > 0 && (
            <button onClick={clearCompleted} className="todo-clear-btn">
              Clear completed
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TodoWidget;
