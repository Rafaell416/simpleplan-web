'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TodoList, type Todo } from '@/components/TodoList';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { CircularProgress } from '@/components/CircularProgress';
import { Confetti } from '@/components/Confetti';
import { DateNavigator } from '@/components/DateNavigator';
import { DateNavigatorMobile } from '@/components/DateNavigatorMobile';
import { useGoals } from '@/lib/useGoals';
import { isActionApplicableOnDay, isActionCompletedOnDate, formatDate } from '@/lib/utils/actionUtils';

const STORAGE_KEY = 'simpleplan-todos';

const defaultTodos: Todo[] = [
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
];

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>(defaultTodos);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { goals, isLoading: goalsLoading, toggleActionCompletion } = useGoals();

  // Get actions applicable for selected date from all goals
  const actionsForSelectedDate = useMemo(() => {
    if (goalsLoading) return [];
    
    const selectedDateCopy = new Date(selectedDate);
    selectedDateCopy.setHours(0, 0, 0, 0);
    const dateStr = formatDate(selectedDateCopy);
    const applicableActions: Todo[] = [];

    goals.forEach(goal => {
      goal.actions.forEach(action => {
        // Check if action is applicable on selected date
        if (isActionApplicableOnDay(action, selectedDateCopy)) {
          // Check if action is already completed on selected date
          const isCompleted = isActionCompletedOnDate(action, dateStr);
          
          applicableActions.push({
            id: `action-${action.id}-${dateStr}`,
            text: action.name,
            completed: isCompleted,
            actionId: action.id,
            goalId: action.goalId,
            goalTitle: goal.title,
          });
        }
      });
    });

    return applicableActions;
  }, [goals, goalsLoading, selectedDate]);

  // Merge regular todos with action todos for selected date
  const allTodos = useMemo(() => {
    // Regular todos appear on all days (they're ongoing/recurring)
    const regularTodos = todos.filter(todo => !todo.actionId);
    
    // Combine regular todos with actions for selected date
    const combined = [...regularTodos, ...actionsForSelectedDate];
    
    // Sort: completed items first, then incomplete items
    return combined.sort((a, b) => {
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      return 0;
    });
  }, [todos, actionsForSelectedDate]);

  // Load todos from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedTodos = JSON.parse(stored);
        if (Array.isArray(parsedTodos) && parsedTodos.length > 0) {
          setTodos(parsedTodos);
        } else {
          // If stored data is invalid, use defaults and save them
          setTodos(defaultTodos);
        }
      } else {
        // If no stored data, use defaults
        setTodos(defaultTodos);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
      setTodos(defaultTodos);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save regular todos to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && !goalsLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      } catch (error) {
        console.error('Failed to save todos:', error);
      }
    }
  }, [todos, isLoaded, goalsLoading]);

  // Handle todo changes (both regular todos and action todos)
  const handleTodosChange = (updatedTodos: Todo[]) => {
    const selectedDateCopy = new Date(selectedDate);
    selectedDateCopy.setHours(0, 0, 0, 0);
    const dateStr = formatDate(selectedDateCopy);
    
    // Separate regular todos from action todos
    const regularTodos = updatedTodos.filter(todo => !todo.actionId);
    setTodos(regularTodos);
    
    // Handle action todo completions separately - only update if completion state changed
    updatedTodos.forEach(updatedTodo => {
      if (updatedTodo.actionId && updatedTodo.goalId) {
        // Find the original action todo to compare completion state
        const originalActionTodo = actionsForSelectedDate.find(
          todo => todo.actionId === updatedTodo.actionId && todo.goalId === updatedTodo.goalId
        );
        
        // Only call toggleActionCompletion if the completion state changed
        if (originalActionTodo && originalActionTodo.completed !== updatedTodo.completed) {
          toggleActionCompletion(
            updatedTodo.goalId,
            updatedTodo.actionId,
            dateStr,
            updatedTodo.completed
          );
        }
      }
    });
  };

  // Calculate progress
  const totalTodos = allTodos.length;
  const completedTodos = allTodos.filter(todo => todo.completed).length;
  const progress = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;
  
  // Track previous progress for confetti trigger
  const prevProgressRef = useRef(progress);
  const [confettiKey, setConfettiKey] = useState(0);

  // Track navigation direction for animation
  const [navigationDirection, setNavigationDirection] = useState<'up' | 'down'>('down');
  const prevDateRef = useRef<Date>(selectedDate);

  // Update navigation direction based on date change
  useEffect(() => {
    const currentTime = selectedDate.getTime();
    const prevTime = prevDateRef.current.getTime();
    
    if (currentTime > prevTime) {
      setNavigationDirection('down'); // Going forward (tomorrow)
    } else if (currentTime < prevTime) {
      setNavigationDirection('up'); // Going backward (yesterday)
    }
    
    prevDateRef.current = selectedDate;
  }, [selectedDate]);

  // Handle keyboard shortcuts for date navigation (Option + Arrow Up/Down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Option (Alt) key is pressed (Alt on Mac is Option key)
      const isOptionPressed = e.altKey;
      
      // Only trigger if not in an input/textarea
      if (isOptionPressed && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const newDate = new Date(selectedDate);
          newDate.setDate(newDate.getDate() - 1);
          setSelectedDate(newDate);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const newDate = new Date(selectedDate);
          newDate.setDate(newDate.getDate() + 1);
          setSelectedDate(newDate);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDate]);

  // Trigger confetti when progress reaches 100% from less than 100% (only for today)
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    const isToday = selected.getTime() === today.getTime();
    
    if (isToday && progress === 100 && prevProgressRef.current < 100 && totalTodos > 0) {
      // Increment key to trigger confetti animation
      setConfettiKey(prev => prev + 1);
    }
    prevProgressRef.current = progress;
  }, [progress, totalTodos, selectedDate]);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Confetti Effect */}
      {confettiKey > 0 && <Confetti key={confettiKey} trigger={true} />}
      
      {/* Circular Progress Indicator - Top Right Corner */}
      {isLoaded && !goalsLoading && totalTodos > 0 && (
        <div className="fixed top-4 right-4 z-50 pointer-events-auto">
          <CircularProgress value={progress} size={56} strokeWidth={5} />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center pt-16 md:pt-24 pb-20 md:pb-32 relative">
        <div className="w-full max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Todo List with smooth vertical pagination */}
            <div className="flex-1 min-w-0 relative">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={formatDate(selectedDate)}
                  initial={{ 
                    opacity: 0, 
                    y: navigationDirection === 'down' ? 40 : -40 
                  }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ 
                    opacity: 0, 
                    y: navigationDirection === 'down' ? -40 : 40 
                  }}
                  transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                  className="w-full"
                >
                  <TodoList 
                    todos={allTodos} 
                    onTodosChange={handleTodosChange}
                    selectedDate={selectedDate}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Date Navigator - Fixed at center, vertical on both mobile and desktop */}
        <div className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-40 pointer-events-auto">
          {/* Mobile version - compact vertical */}
          <div className="md:hidden">
            <DateNavigatorMobile 
              selectedDate={selectedDate} 
              onDateChange={setSelectedDate}
            />
          </div>
          {/* Desktop version - full vertical */}
          <div className="hidden md:flex">
            <DateNavigator 
              selectedDate={selectedDate} 
              onDateChange={setSelectedDate}
            />
          </div>
        </div>
      </div>
      <KeyboardShortcuts />
    </main>
  );
}
