'use client';

import { useState, useEffect, useRef } from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: 'Work on copilotIQ', completed: true },
    { id: '2', text: 'Chat gpt therapy', completed: false },
    { id: '3', text: 'Cortex fu', completed: false },
    { id: '4', text: 'Work on simple plan web', completed: false },
    { id: '5', text: 'Time with God', completed: false },
    { id: '6', text: 'Duolingo', completed: false },
    { id: '7', text: 'Continue reading nutrition app document', completed: false },
    { id: '8', text: 'Continue working on tripby spreadsheet', completed: false },
    { id: '9', text: 'Call Juan Pablo Apriori', completed: false },
    { id: '10', text: 'Stretch and mobility', completed: false },
  ]);

  const [newTodo, setNewTodo] = useState('');
  const [isInputMode, setIsInputMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ).sort((a, b) => {
      // Sort: completed items first, then incomplete items
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      return 0;
    }));
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodos = [...todos, {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
      }];
      // Sort: completed items first
      setTodos(newTodos.sort((a, b) => {
        if (a.completed && !b.completed) return -1;
        if (!a.completed && b.completed) return 1;
        return 0;
      }));
      setNewTodo('');
      // Stay in input mode, focus the input again
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const saveEdit = (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, text: editingText.trim() || todo.text } : todo
    );
    // Sort: completed items first
    setTodos(updatedTodos.sort((a, b) => {
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      return 0;
    }));
    setEditingId(null);
    setEditingText('');
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleDeleteWithConfirmation = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTodo(id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id?: string) => {
    if (e.key === 'Enter') {
      if (id && editingId === id) {
        saveEdit(id);
      } else if (isInputMode) {
        e.preventDefault();
        addTodo();
      }
    } else if (e.key === 'Escape') {
      if (id && editingId === id) {
        setEditingId(null);
        setEditingText('');
      } else if (isInputMode) {
        setIsInputMode(false);
        setNewTodo('');
      }
    }
  };

  // Listen for "+" key to enter input mode
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if "+" key is pressed (works for both regular "+" and numpad "+")
      const isPlusKey = e.key === '+' || e.code === 'NumpadAdd';
      
      // Only trigger if not in an input/textarea and not already in input mode
      if (isPlusKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA' && !isInputMode) {
        e.preventDefault();
        setIsInputMode(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isInputMode]);

  // Focus input when entering input mode
  useEffect(() => {
    if (isInputMode) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isInputMode]);

  // Sort todos: completed items first
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed && !b.completed) return -1;
    if (!a.completed && b.completed) return 1;
    return 0;
  });

  // Get day of the week
  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-8 text-neutral-900 dark:text-neutral-50">
        {dayOfWeek}
      </h2>
      {todos.length === 0 && !isInputMode ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-center">
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2">
              No tasks yet
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              Press <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs font-mono">+</kbd> to add your first task
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {sortedTodos.map((todo) => (
          <div
            key={todo.id}
            className="group flex items-center gap-3 py-1.5 px-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              tabIndex={-1}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                todo.completed
                  ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 focus:ring-blue-400 dark:focus:ring-blue-600'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 focus:ring-neutral-400 dark:focus:ring-neutral-600'
              }`}
              aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {todo.completed && (
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
            
            {editingId === todo.id ? (
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={() => saveEdit(todo.id)}
                onKeyDown={(e) => handleKeyDown(e, todo.id)}
                className="flex-1 bg-transparent border-none outline-none text-neutral-900 dark:text-neutral-50 text-base focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 -mx-1 p-0"
                autoFocus
                tabIndex={0}
              />
            ) : (
              <button
                onClick={() => startEditing(todo)}
                onKeyDown={(e) => {
                  // E key to edit
                  if (e.key === 'e' || e.key === 'E') {
                    e.preventDefault();
                    startEditing(todo);
                  }
                  // Enter key to toggle completion
                  else if (e.key === 'Enter') {
                    e.preventDefault();
                    toggleTodo(todo.id);
                  }
                  // Delete key to delete with confirmation
                  else if (e.key === 'Delete' || e.key === 'Backspace') {
                    e.preventDefault();
                    handleDeleteWithConfirmation(todo.id);
                  }
                }}
                tabIndex={0}
                className={`flex-1 text-left text-base text-neutral-900 dark:text-neutral-50 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 -mx-1 ${
                  todo.completed
                    ? 'opacity-50 line-through'
                    : 'opacity-100'
                }`}
              >
                {todo.text}
              </button>
            )}
            
            <button
              onClick={() => deleteTodo(todo.id)}
              tabIndex={-1}
              className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded focus:opacity-100"
              aria-label="Delete task"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
        
        {/* Add new todo - only show when in input mode */}
        {isInputMode && (
          <div className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
            <div className="flex-shrink-0 w-5 h-5 rounded border-2 border-neutral-300 dark:border-neutral-700" />
            <input
              ref={inputRef}
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type to add a new task..."
              className="flex-1 bg-transparent border-none outline-none text-neutral-900 dark:text-neutral-50 text-base placeholder:text-neutral-400 dark:placeholder:text-neutral-600 rounded px-1 -mx-1 p-0"
              autoFocus
              tabIndex={0}
            />
          </div>
        )}
        </div>
      )}
    </div>
  );
}

