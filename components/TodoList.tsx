'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  // Optional metadata for goal actions
  actionId?: string;
  goalId?: string;
  goalTitle?: string;
}

interface TodoListProps {
  todos: Todo[];
  onTodosChange: (todos: Todo[]) => void;
  selectedDate?: Date;
}

export function TodoList({ todos, onTodosChange, selectedDate = new Date() }: TodoListProps) {

  const [newTodo, setNewTodo] = useState('');
  const [isInputMode, setIsInputMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [selectedGoalTitle, setSelectedGoalTitle] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ).sort((a, b) => {
      // Sort: completed items first, then incomplete items
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      return 0;
    });
    onTodosChange(updatedTodos);
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodos = [...todos, {
        id: crypto.randomUUID(),
        text: newTodo.trim(),
        completed: false,
      }];
      // Sort: completed items first
      const sortedTodos = newTodos.sort((a, b) => {
        if (a.completed && !b.completed) return -1;
        if (!a.completed && b.completed) return 1;
        return 0;
      });
      onTodosChange(sortedTodos);
      setNewTodo('');
      // Stay in input mode, focus the input again
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const startEditing = (todo: Todo) => {
    // Don't allow editing action todos
    if (todo.actionId) return;
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const saveEdit = (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, text: editingText.trim() || todo.text } : todo
    );
    // Sort: completed items first
    const sortedTodos = updatedTodos.sort((a, b) => {
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      return 0;
    });
    onTodosChange(sortedTodos);
    setEditingId(null);
    setEditingText('');
  };

  const deleteTodo = (id: string) => {
    const filteredTodos = todos.filter(todo => todo.id !== id);
    onTodosChange(filteredTodos);
    setTodoToDelete(null);
  };

  const handleDeleteClick = (id: string) => {
    setTodoToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (todoToDelete) {
      deleteTodo(todoToDelete);
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

  // Get day of the week for the selected date
  const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="w-full max-w-full">
      <h2 className="text-2xl font-semibold mb-8 text-neutral-900 dark:text-neutral-50 px-2">
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
        <div className="space-y-1 px-2">
          <AnimatePresence mode="popLayout">
            {sortedTodos.map((todo) => (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, height: 0, marginTop: 0, marginBottom: 0 }}
              transition={{
                layout: { 
                  duration: 0.4, 
                  ease: [0.32, 0.72, 0, 1]
                },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
                height: { duration: 0.3 }
              }}
              onKeyDown={(e) => {
                // Only handle keyboard if not editing
                if (editingId !== todo.id) {
                  // Enter or Space to toggle completion
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTodo(todo.id);
                  }
                  // E key to edit (only for regular todos)
                  else if ((e.key === 'e' || e.key === 'E') && !todo.actionId) {
                    e.preventDefault();
                    startEditing(todo);
                  }
                  // Delete key to delete with confirmation (only for regular todos)
                  else if ((e.key === 'Delete' || e.key === 'Backspace') && !todo.actionId) {
                    e.preventDefault();
                    handleDeleteClick(todo.id);
                  }
                }
              }}
              tabIndex={editingId === todo.id ? -1 : 0}
              role="listitem"
              className="group flex items-center gap-3 py-1.5 px-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:bg-neutral-50 dark:focus:bg-neutral-900/50 cursor-pointer"
            >
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() => toggleTodo(todo.id)}
              onClick={(e) => e.stopPropagation()}
              tabIndex={-1}
              aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
              className="cursor-pointer size-5 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 dark:data-[state=checked]:bg-blue-500 dark:data-[state=checked]:border-blue-500 pointer-events-auto"
            />
            
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
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!todo.actionId) {
                      startEditing(todo);
                    }
                  }}
                  tabIndex={todo.actionId ? -1 : -1}
                  type="button"
                  disabled={!!todo.actionId}
                  className={`flex-1 text-left text-base text-neutral-900 dark:text-neutral-50 transition-opacity min-w-0 break-words ${
                    todo.completed
                      ? 'opacity-50 line-through'
                      : 'opacity-100'
                  } ${todo.actionId ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {todo.text}
                </button>
                {todo.actionId && todo.goalTitle && (
                  <>
                    {/* Desktop: Show badge */}
                    <span className="hidden md:inline text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
                      {todo.goalTitle}
                    </span>
                    {/* Mobile: Show circle indicator */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGoalTitle(todo.goalTitle || null);
                        setGoalDialogOpen(true);
                      }}
                      className="md:hidden flex-shrink-0 w-5 h-5 rounded-full bg-muted border border-border hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      aria-label={`View goal: ${todo.goalTitle}`}
                      tabIndex={0}
                    />
                  </>
                )}
              </div>
            )}
            
            {!todo.actionId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(todo.id);
                }}
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
            )}
            </motion.div>
          ))}
          </AnimatePresence>
        
                {/* Add new todo - always visible on mobile, conditional on desktop */}
                <div className={`flex items-center gap-3 py-1.5 px-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors ${isInputMode ? 'md:flex' : 'md:hidden'}`}>
                  <div className="flex-shrink-0 w-4 h-4" />
                  <input
            ref={inputRef}
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsInputMode(true)}
            onBlur={() => {
              // Only exit input mode on desktop if empty
              if (!newTodo.trim() && window.innerWidth >= 768) {
                setIsInputMode(false);
              }
            }}
            placeholder="Type to add a new task..."
            className="flex-1 bg-transparent border-none outline-none text-neutral-900 dark:text-neutral-50 text-base placeholder:text-neutral-400 dark:placeholder:text-neutral-600 rounded px-1 -mx-1 p-0"
            autoFocus={isInputMode}
            tabIndex={0}
          />
        </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!todoToDelete} onOpenChange={(open) => !open && setTodoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              {todoToDelete && (
                <>
                  Are you sure you want to delete "{todos.find(t => t.id === todoToDelete)?.text}"? This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTodoToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Goal Info Dialog (Mobile) */}
      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Goal</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-base text-foreground">{selectedGoalTitle}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

