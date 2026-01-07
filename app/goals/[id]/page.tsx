'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { GoalForm } from '@/components/GoalForm';
import { Goal, Action } from '@/lib/types';
import { useGoals } from '@/lib/useGoals';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { goals, updateGoal, deleteGoal, addAction, updateAction, deleteAction, isLoading } = useGoals();
  const [isEditMode, setIsEditMode] = useState(false);
  const [newActionName, setNewActionName] = useState('');
  const [isInputMode, setIsInputMode] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editingActionName, setEditingActionName] = useState('');
  const [editingActionRecurrence, setEditingActionRecurrence] = useState<'daily' | 'weekly'>('daily');
  const inputRef = useRef<HTMLInputElement>(null);

  const goal = goals.find((g) => g.id === params.id);
  
  // Backward compatibility: handle goals with old 'habits' property
  const goalActions: Action[] = goal?.actions ?? (goal as any)?.habits ?? [];

  const handleUpdate = (goalData: Omit<Goal, 'id' | 'createdAt' | 'actions'>) => {
    if (goal) {
      updateGoal(goal.id, goalData);
      setIsEditMode(false);
    }
  };

  const handleDelete = () => {
    if (goal) {
      deleteGoal(goal.id);
      router.push('/goals');
    }
  };

  const handleAddAction = () => {
    if (newActionName.trim() && goal) {
      addAction(goal.id, {
        name: newActionName.trim(),
        recurrence: 'daily',
      });
      setNewActionName('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleStartEditAction = (action: Action) => {
    setEditingActionId(action.id);
    setEditingActionName(action.name);
    setEditingActionRecurrence(action.recurrence);
  };

  const handleSaveEditAction = () => {
    if (editingActionId && goal && editingActionName.trim()) {
      updateAction(goal.id, editingActionId, {
        name: editingActionName.trim(),
        recurrence: editingActionRecurrence,
      });
      setEditingActionId(null);
      setEditingActionName('');
    }
  };

  const handleDeleteAction = (actionId: string) => {
    if (goal && window.confirm('Are you sure you want to delete this action?')) {
      deleteAction(goal.id, actionId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, actionId?: string) => {
    if (e.key === 'Enter') {
      if (actionId && editingActionId === actionId) {
        handleSaveEditAction();
      } else if (isInputMode) {
        e.preventDefault();
        handleAddAction();
      }
    } else if (e.key === 'Escape') {
      if (actionId && editingActionId === actionId) {
        setEditingActionId(null);
        setEditingActionName('');
      } else if (isInputMode) {
        setIsInputMode(false);
        setNewActionName('');
      }
    }
  };

  // Listen for "+" key to enter input mode
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const isPlusKey = e.key === '+' || e.code === 'NumpadAdd';
      if (isPlusKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA' && !isInputMode && goal) {
        e.preventDefault();
        setIsInputMode(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isInputMode, goal]);

  // Focus input when entering input mode
  useEffect(() => {
    if (isInputMode) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isInputMode]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col bg-slate-50 font-sans text-neutral-900 dark:bg-black dark:text-white">
        <Header title="Loading..." />
        <div className="flex-1 flex items-center justify-center pt-24 pb-20 md:pb-32">
          <div className="text-neutral-500 dark:text-neutral-400">Loading...</div>
        </div>
      </main>
    );
  }

  if (!goal) {
    return (
      <main className="flex min-h-screen flex-col bg-slate-50 font-sans text-neutral-900 dark:bg-black dark:text-white">
        <Header title="Goal not found" />
        <div className="flex-1 flex items-center justify-center pt-24 pb-20 md:pb-32">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
              Goal not found
            </h2>
            <button
              onClick={() => router.push('/goals')}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Back to Goals
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 font-sans text-neutral-900 dark:bg-black dark:text-white">
      {/* Header with Title and Actions */}
      <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
        <div className="w-full max-w-3xl px-6 mx-auto pt-8">
          <div className="flex items-center justify-between pointer-events-auto">
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
              {goal.title}
            </h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
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
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setIsEditMode(true)}>
                  Edit Goal
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      variant="destructive"
                    >
                      Delete Goal
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete "{goal.title}" and all its associated actions.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex items-start justify-center pt-24 pb-20 md:pb-32">
        <div className="w-full max-w-3xl mx-auto px-6 py-8">

          {/* Target Date */}
          {goal.targetDate && (
            <div className="mb-8 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                Target: {new Date(goal.targetDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}

          {/* Actions List - Similar to TodoList */}
          <div className="w-full">
            {goalActions.length === 0 && !isInputMode ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-center">
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2">
                    No actions yet
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500">
                    Press <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs font-mono">+</kbd> to add your first action
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {goalActions.map((action) => (
                  <div
                    key={action.id}
                    className="group flex items-center gap-3 py-1.5 px-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                  >
                    {editingActionId === action.id ? (
                      <>
                        <div className="flex-shrink-0 w-5 h-5" />
                        <input
                          type="text"
                          value={editingActionName}
                          onChange={(e) => setEditingActionName(e.target.value)}
                          onBlur={handleSaveEditAction}
                          onKeyDown={(e) => handleKeyDown(e, action.id)}
                          className="flex-1 bg-transparent border-none outline-none text-neutral-900 dark:text-neutral-50 text-base focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 -mx-1 p-0"
                          autoFocus
                          tabIndex={0}
                        />
                        <select
                          value={editingActionRecurrence}
                          onChange={(e) => setEditingActionRecurrence(e.target.value as 'daily' | 'weekly')}
                          className="text-sm bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          tabIndex={0}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </>
                    ) : (
                      <>
                        <div className="flex-shrink-0 w-5 h-5 rounded border-2 border-neutral-300 dark:border-neutral-700" />
                        <button
                          onClick={() => handleStartEditAction(action)}
                          onKeyDown={(e) => {
                            if (e.key === 'e' || e.key === 'E') {
                              e.preventDefault();
                              handleStartEditAction(action);
                            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                              e.preventDefault();
                              handleDeleteAction(action.id);
                            }
                          }}
                          tabIndex={0}
                          className="flex-1 text-left text-base text-neutral-900 dark:text-neutral-50 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 -mx-1"
                        >
                          {action.name}
                          <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                            ({action.recurrence})
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteAction(action.id)}
                          tabIndex={-1}
                          className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded focus:opacity-100"
                          aria-label="Delete action"
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
                      </>
                    )}
                  </div>
                ))}

                {/* Add new action input */}
                <div className={`flex items-center gap-3 py-1.5 px-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors ${isInputMode ? 'md:flex' : 'md:hidden'}`}>
                  <div className="flex-shrink-0 w-5 h-5 rounded border-2 border-neutral-300 dark:border-neutral-700" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={newActionName}
                    onChange={(e) => setNewActionName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsInputMode(true)}
                    onBlur={() => {
                      if (!newActionName.trim() && window.innerWidth >= 768) {
                        setIsInputMode(false);
                      }
                    }}
                    placeholder="Type to add a new action..."
                    className="flex-1 bg-transparent border-none outline-none text-neutral-900 dark:text-neutral-50 text-base placeholder:text-neutral-400 dark:placeholder:text-neutral-600 rounded px-1 -mx-1 p-0"
                    autoFocus={isInputMode}
                    tabIndex={0}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      <GoalForm
        goal={goal}
        open={isEditMode}
        onOpenChange={setIsEditMode}
        onSubmit={handleUpdate}
      />
    </main>
  );
}
