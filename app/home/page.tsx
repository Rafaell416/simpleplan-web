'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TodoList, type Todo } from '@/components/TodoList';
import { TodoSkeleton } from '@/components/TodoSkeleton';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { CircularProgress } from '@/components/CircularProgress';
import { Confetti } from '@/components/Confetti';
import { DateNavigator } from '@/components/DateNavigator';
import { DateNavigatorMobile } from '@/components/DateNavigatorMobile';
import { useGoals } from '@/lib/useGoals';
import { isActionApplicableOnDay, isActionCompletedOnDate, formatDate } from '@/lib/utils/actionUtils';
import { isActionOverdue } from '@/lib/utils/goalUtils';
import { supabase } from '@/lib/supabase/client';
import { getUserId } from '@/lib/supabase/rls';
import { useAuth } from '@/lib/auth/AuthProvider';
import { AuthGuard } from '@/components/AuthGuard';

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}

function HomeContent() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useSupabase, setUseSupabase] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { goals, isLoading: goalsLoading, toggleActionCompletion } = useGoals();
  const { user, loading: authLoading } = useAuth();
  const lastSavedDateRef = useRef<string>('');
  // Tracks which date the current `todos` state belongs to (set when load completes).
  // Prevents saving today's todos under tomorrow's date when switching days.
  const todosDateRef = useRef<string>('');

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
          // Check if action is overdue
          const overdue = isActionOverdue(action, goal, selectedDateCopy);
          
          applicableActions.push({
            id: `action-${action.id}-${dateStr}`,
            text: action.name,
            completed: isCompleted,
            actionId: action.id,
            goalId: action.goalId,
            goalTitle: goal.title,
            isOverdue: overdue,
          });
        }
      });
    });

    return applicableActions;
  }, [goals, goalsLoading, selectedDate]);

  // Merge regular todos with action todos for selected date
  const allTodos = useMemo(() => {
    // Regular todos are already filtered by selected date when loaded
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

  // Load todos from Supabase for the selected date
  useEffect(() => {
    // Wait for auth to finish loading before trying to load todos
    if (authLoading) return;
    
    // If user is not authenticated, don't try to load todos
    // AuthGuard should handle redirect, but we need to set loaded to true to avoid infinite skeleton
    if (!user) {
      setIsLoaded(true);
      setTodos([]);
      return;
    }

    // Don't clear todos here: keep showing previous date until load completes.
    // Clearing immediately caused the save effect to run with new selectedDate but
    // old todos, writing them to the wrong day.
    setIsLoaded(false);

    let isCancelled = false;

    const loadTodos = async () => {
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase not configured. Todos require Supabase.');
        if (!isCancelled) {
          setIsLoaded(true);
        }
        return;
      }

      setUseSupabase(true);

      // Load todos from Supabase for the selected date
      try {
        let userId: string;
        try {
          userId = await getUserId();
        } catch (authError) {
          console.error('Error getting user ID:', authError);
          // If we can't get user ID, user is not authenticated
          // Set loaded to true so we don't show skeleton forever
          if (!isCancelled) {
            setTodos([]);
            setIsLoaded(true);
          }
          return;
        }
        
        // Check if this effect was cancelled (date changed while loading)
        if (isCancelled) return;
        
        // Normalize the date to ensure consistent formatting
        const normalizedDate = new Date(selectedDate);
        normalizedDate.setHours(0, 0, 0, 0);
        const selectedDateStr = formatDate(normalizedDate);
        
        const { data: dbTodos, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', userId)
          .eq('date', selectedDateStr) // Filter by selected date
          .is('action_id', null) // Only get regular todos, not action todos
          .order('created_at', { ascending: true });

        // Check again if cancelled
        if (isCancelled) return;

        if (error) {
          console.error('Error loading todos from Supabase:', error);
          if (!isCancelled) {
            setTodos([]);
            todosDateRef.current = selectedDateStr;
          }
        } else {
          const convertedTodos: Todo[] = (dbTodos || []).map((todo: any) => ({
            id: todo.id,
            text: todo.text,
            completed: todo.completed,
            actionId: todo.action_id || undefined,
            goalId: undefined,
            goalTitle: todo.goal_title || undefined,
          }));
          if (!isCancelled) {
            setTodos(convertedTodos);
            todosDateRef.current = selectedDateStr;
          }
        }
      } catch (error) {
        console.error('Error loading todos:', error);
        if (!isCancelled) {
          setTodos([]);
          todosDateRef.current = formatDate(new Date(selectedDate));
        }
      } finally {
        // Always set loaded to true, even on error, but only if not cancelled
        if (!isCancelled) {
          setIsLoaded(true);
        }
      }
    };

    loadTodos();

    // Cleanup function to cancel the async operation if the effect re-runs
    return () => {
      isCancelled = true;
    };
  }, [authLoading, selectedDate, user]);

  // Save regular todos to Supabase whenever they change
  useEffect(() => {
    if (!isLoaded || goalsLoading || !useSupabase || authLoading) return;

    const selectedDateStr = formatDate(new Date(selectedDate.getTime()));
    // Only save when the todos we have belong to the selected date.
    // Otherwise we'd write one day's todos to another day when switching dates.
    if (todosDateRef.current !== selectedDateStr) return;

    if (todos.length === 0) return;

    const saveTodos = async () => {
      try {
        const userId = await getUserId();
        if (!userId) {
          console.warn('No user ID available, skipping todo save');
          return;
        }

        const dateStr = todosDateRef.current;

        // Get current todos from database for this date to compare
        const { data: existingTodos } = await supabase
          .from('todos')
          .select('id')
          .eq('user_id', userId)
          .eq('date', dateStr)
          .is('action_id', null);

        const existingIds = new Set((existingTodos || []).map((t: any) => t.id));
        const currentIds = new Set(todos.map((t: Todo) => t.id));

        // Delete todos that are no longer in the list for this date
        const toDelete = Array.from(existingIds).filter((id: unknown): id is string => typeof id === 'string' && !currentIds.has(id));
        if (toDelete.length > 0) {
          await supabase
            .from('todos')
            .delete()
            .in('id', toDelete)
            .eq('user_id', userId)
            .eq('date', dateStr);
        }

        const todosToUpsert = todos.map(todo => ({
          id: todo.id,
          user_id: userId,
          text: todo.text,
          completed: todo.completed,
          date: dateStr,
          action_id: null,
          goal_title: null,
        }));

        if (todosToUpsert.length > 0) {
          const { error } = await supabase
            .from('todos')
            .upsert(todosToUpsert, { onConflict: 'id' });

          if (error) {
            console.error('Error saving todos to Supabase:', error);
          } else {
            lastSavedDateRef.current = dateStr;
          }
        }
      } catch (error) {
        console.error('Error saving todos:', error);
      }
    };

    saveTodos();
  }, [todos, isLoaded, goalsLoading, useSupabase, authLoading, selectedDate]);

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
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const minDate = new Date(today);
          minDate.setDate(today.getDate() - 10); // 10 days in the past
          
          const selected = new Date(selectedDate);
          selected.setHours(0, 0, 0, 0);
          
          // Don't allow navigation beyond 10 days in the past
          if (selected.getTime() <= minDate.getTime()) {
            return;
          }
          
          const newDate = new Date(selectedDate);
          newDate.setDate(newDate.getDate() - 1);
          
          // Ensure we don't exceed the 10-day limit
          const newDateNormalized = new Date(newDate);
          newDateNormalized.setHours(0, 0, 0, 0);
          if (newDateNormalized.getTime() >= minDate.getTime()) {
            setSelectedDate(newDate);
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const maxDate = new Date(today);
          maxDate.setDate(today.getDate() + 10); // 10 days from today
          
          const selected = new Date(selectedDate);
          selected.setHours(0, 0, 0, 0);
          
          // Don't allow navigation beyond 10 days from today
          if (selected.getTime() >= maxDate.getTime()) {
            return;
          }
          
          const newDate = new Date(selectedDate);
          newDate.setDate(newDate.getDate() + 1);
          
          // Ensure we don't exceed the 10-day limit
          const newDateNormalized = new Date(newDate);
          newDateNormalized.setHours(0, 0, 0, 0);
          if (newDateNormalized.getTime() <= maxDate.getTime()) {
            setSelectedDate(newDate);
          }
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
          <div className="flex items-start gap-4 md:gap-6">
            {/* Todo List with swipe animation */}
            <div className="flex-1 relative bg-background" style={{ height: 'calc(100vh - 200px)', minHeight: '600px', overflow: 'hidden' }}>
              <AnimatePresence initial={false} custom={navigationDirection}>
                <motion.div
                  key={formatDate(selectedDate)}
                  custom={navigationDirection}
                  initial={{ 
                    y: navigationDirection === 'down' ? '100%' : '-100%',
                    opacity: 0
                  }}
                  animate={{ 
                    y: 0,
                    opacity: 1
                  }}
                  exit={{ 
                    y: navigationDirection === 'down' ? '-100%' : '100%',
                    opacity: 0
                  }}
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.4, 0, 0.2, 1],
                    opacity: { 
                      duration: 0.25,
                      ease: 'easeOut'
                    }
                  }}
                  className="w-full absolute inset-0 bg-background overflow-y-auto"
                  style={{ padding: '4px' }}
                >
                  {!isLoaded || goalsLoading ? (
                    <TodoSkeleton />
                  ) : (
                    <TodoList 
                      todos={allTodos} 
                      onTodosChange={handleTodosChange}
                      selectedDate={selectedDate}
                    />
                  )}
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
