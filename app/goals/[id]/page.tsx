'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { GoalForm } from '@/components/GoalForm';
import { ActionRecurrenceDialog } from '@/components/ActionRecurrenceDialog';
import { ActionProgressTracker } from '@/components/ActionProgressTracker';
import { Goal, Action, ActionRecurrence } from '@/lib/types';
import { formatRecurrence } from '@/lib/utils/actionUtils';
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
import { Progress } from '@/components/ui/progress';

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { goals, updateGoal, deleteGoal, addAction, updateAction, deleteAction, toggleActionCompletion, isLoading } = useGoals();
  const [isEditMode, setIsEditMode] = useState(false);
  const [newActionName, setNewActionName] = useState('');
  const [isInputMode, setIsInputMode] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editingActionName, setEditingActionName] = useState('');
  const [editingActionRecurrence, setEditingActionRecurrence] = useState<ActionRecurrence>({ type: 'daily' });
  const [actionToDelete, setActionToDelete] = useState<string | null>(null);
  const [showRecurrenceDialog, setShowRecurrenceDialog] = useState(false);
  const [pendingActionName, setPendingActionName] = useState('');
  const [justUpdatedRecurrence, setJustUpdatedRecurrence] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const goal = goals.find((g) => g.id === params.id);
  
  // Backward compatibility: handle goals with old 'habits' property
  const goalActions: Action[] = goal?.actions ?? (goal as any)?.habits ?? [];

  // Calculate progress based on target date
  const calculateProgress = (): number => {
    if (!goal?.targetDate) return 0;
    
    const now = new Date();
    const created = new Date(goal.createdAt);
    const target = new Date(goal.targetDate);
    
    const totalDuration = target.getTime() - created.getTime();
    const elapsed = now.getTime() - created.getTime();
    
    if (totalDuration <= 0) return 100;
    if (elapsed < 0) return 0;
    
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    return Math.round(progress);
  };

  const progress = calculateProgress();

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
      // Show recurrence dialog instead of directly adding
      setPendingActionName(newActionName.trim());
      setShowRecurrenceDialog(true);
    }
  };

  const handleRecurrenceConfirm = (recurrence: ActionRecurrence) => {
    if (goal && editingActionId) {
      // Find the current action to get its name as fallback
      const currentAction = goalActions.find(a => a.id === editingActionId);
      if (!currentAction) return;
      
      // Update the recurrence in the editing state FIRST (for immediate UI update)
      setEditingActionRecurrence(recurrence);
      
      // Update the action with current editing name (or existing name if not changed) and new recurrence
      const nameToUse = editingActionName.trim() || currentAction.name;
      
      // Update the action immediately with the new recurrence
      // We pass the recurrence object directly to ensure it's saved correctly
      const updatedAction: Partial<Action> = {
        name: nameToUse,
        recurrence: { ...recurrence }, // Create a new object to ensure it's a clean copy
      };
      
      updateAction(goal.id, editingActionId, updatedAction);
      
      // Set flag to prevent handleSaveEditAction from overwriting the recurrence
      setJustUpdatedRecurrence(true);
      // Clear the flag after a short delay to allow any pending blur events to use the correct value
      setTimeout(() => {
        setJustUpdatedRecurrence(false);
      }, 100);
      
      // Also update editingActionName if it was empty, so handleSaveEditAction uses correct value
      if (!editingActionName.trim()) {
        setEditingActionName(currentAction.name);
      }
      
      // Keep edit mode open so user can continue editing if needed
      // They can save by clicking away or pressing Enter
    } else if (goal && pendingActionName) {
      // Otherwise, add a new action
      addAction(goal.id, {
        name: pendingActionName,
        recurrence,
      });
      setNewActionName('');
      setPendingActionName('');
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
    if (editingActionId && goal) {
      // Get current action to get the name if editingActionName is empty
      const currentAction = goalActions.find(a => a.id === editingActionId);
      if (!currentAction) return;
      
      const nameToUse = editingActionName.trim() || currentAction.name;
      
      if (nameToUse) {
        // If recurrence was just updated via dialog, use the actual action's recurrence
        // (which was already updated) instead of the potentially stale editing state
        const recurrenceToUse = justUpdatedRecurrence 
          ? currentAction.recurrence 
          : editingActionRecurrence;
        
        updateAction(goal.id, editingActionId, {
          name: nameToUse,
          recurrence: recurrenceToUse,
        });
        setEditingActionId(null);
        setEditingActionName('');
        setEditingActionRecurrence({ type: 'daily' });
        setJustUpdatedRecurrence(false);
      }
    }
  };

  const handleDeleteActionClick = (actionId: string) => {
    setActionToDelete(actionId);
  };

  const handleConfirmDeleteAction = () => {
    if (goal && actionToDelete) {
      deleteAction(goal.id, actionToDelete);
      setActionToDelete(null);
    }
  };

  const handleToggleActionCompletion = (actionId: string, date: string, completed: boolean) => {
    if (goal) {
      toggleActionCompletion(goal.id, actionId, date, completed);
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
      <div className="pointer-events-none">
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
      
      <div className="flex-1 flex items-start justify-center pb-20 md:pb-32">
        <div className="w-full max-w-3xl mx-auto px-6 py-8">

          {/* Progress Bar */}
          {goal.targetDate && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Progress
                </span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {progress}%
                </span>
              </div>
              <Progress 
                value={progress}
                className="h-2 bg-neutral-200 dark:bg-neutral-800"
                indicatorClassName="bg-green-500 dark:bg-green-400"
              />
            </div>
          )}

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

          {/* Actions List */}
          <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Actions
              </h2>
              {goalActions.length > 0 && (
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {goalActions.length} {goalActions.length === 1 ? 'action' : 'actions'}
                </span>
              )}
            </div>
            
            {goalActions.length === 0 && !isInputMode ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-2">
                    <svg
                      className="w-8 h-8 text-neutral-400 dark:text-neutral-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-1">
                      No actions yet
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                      Add actions to track your progress towards this goal
                    </p>
                    <div className="flex flex-col items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <p>Press <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded font-mono">+</kbd> to add your first action</p>
                      <p className="text-neutral-400 dark:text-neutral-500">or click the input field below</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {goalActions.map((action) => (
                  <div
                    key={action.id}
                    className="group flex items-center gap-3 py-3 px-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all"
                  >
                    {editingActionId === action.id ? (
                      <>
                        <input
                          type="text"
                          value={editingActionName}
                          onChange={(e) => setEditingActionName(e.target.value)}
                          onBlur={(e) => {
                            // Don't save if clicking on the recurrence button
                            const relatedTarget = e.relatedTarget as HTMLElement;
                            if (relatedTarget && relatedTarget.closest('button[data-recurrence-button]')) {
                              return;
                            }
                            handleSaveEditAction();
                          }}
                          onKeyDown={(e) => handleKeyDown(e, action.id)}
                          className="flex-1 bg-transparent border-none outline-none text-neutral-900 dark:text-neutral-50 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                          autoFocus
                          tabIndex={0}
                        />
                        <button
                          data-recurrence-button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Open recurrence dialog for editing - keep edit mode active
                            setShowRecurrenceDialog(true);
                          }}
                          onMouseDown={(e) => {
                            // Prevent blur on the input
                            e.preventDefault();
                          }}
                          className="text-xs px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700 font-medium"
                          tabIndex={0}
                        >
                          {formatRecurrence(editingActionRecurrence)}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 flex items-center gap-3">
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></div>
                          <button
                            onClick={() => handleStartEditAction(action)}
                            onKeyDown={(e) => {
                              if (e.key === 'e' || e.key === 'E') {
                                e.preventDefault();
                                handleStartEditAction(action);
                              } else if (e.key === 'Delete' || e.key === 'Backspace') {
                                e.preventDefault();
                                handleDeleteActionClick(action.id);
                              }
                            }}
                            tabIndex={0}
                            className="flex-1 text-left text-base font-medium text-neutral-900 dark:text-neutral-50 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 -mx-1"
                          >
                            {action.name}
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-md border border-neutral-200 dark:border-neutral-700 font-medium">
                            {formatRecurrence(action.recurrence)}
                          </span>
                          <button
                            onClick={() => handleDeleteActionClick(action.id)}
                            tabIndex={-1}
                            className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded focus:opacity-100"
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
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Add new action input - Mobile */}
                <div 
                  className={`md:hidden flex items-center gap-3 py-3 px-4 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
                    isInputMode 
                      ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10' 
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                  onClick={() => !isInputMode && setIsInputMode(true)}
                >
                  <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full border-2 border-neutral-300 dark:border-neutral-700 text-neutral-400 dark:text-neutral-600">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={newActionName}
                    onChange={(e) => setNewActionName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsInputMode(true)}
                    onBlur={() => {
                      if (!newActionName.trim()) {
                        setIsInputMode(false);
                      }
                    }}
                    placeholder={isInputMode ? "Type action name and press Enter..." : "Click to add a new action"}
                    className="flex-1 bg-transparent border-none outline-none text-neutral-900 dark:text-neutral-50 text-base placeholder:text-neutral-400 dark:placeholder:text-neutral-600 rounded"
                    autoFocus={isInputMode}
                    tabIndex={0}
                  />
                </div>
                
                {/* Add new action input - Desktop */}
                <div 
                  className={`hidden md:flex items-center gap-3 py-3 px-4 rounded-lg border-2 border-dashed transition-colors ${
                    isInputMode 
                      ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10' 
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer'
                  }`}
                  onClick={() => !isInputMode && setIsInputMode(true)}
                >
                  <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full border-2 border-neutral-300 dark:border-neutral-700 text-neutral-400 dark:text-neutral-600">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={newActionName}
                    onChange={(e) => setNewActionName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsInputMode(true)}
                    onBlur={() => {
                      if (!newActionName.trim()) {
                        setIsInputMode(false);
                      }
                    }}
                    placeholder="Type action name and press Enter..."
                    className="flex-1 bg-transparent border-none outline-none text-neutral-900 dark:text-neutral-50 text-base placeholder:text-neutral-400 dark:placeholder:text-neutral-600 rounded"
                    autoFocus={isInputMode}
                    tabIndex={0}
                  />
                  {!isInputMode && (
                    <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-600 whitespace-nowrap">
                      <span>or press</span>
                      <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-xs font-mono border border-neutral-200 dark:border-neutral-700">+</kbd>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Progress Tracker */}
          {goalActions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
                Progress Tracker
              </h2>
              <ActionProgressTracker
                actions={goalActions}
                goalCreatedAt={goal.createdAt}
                onToggleCompletion={handleToggleActionCompletion}
              />
            </div>
          )}
        </div>
      </div>

      {/* Edit Form Modal */}
      <GoalForm
        goal={goal}
        open={isEditMode}
        onOpenChange={setIsEditMode}
        onSubmit={handleUpdate}
      />

      {/* Delete Action Confirmation Dialog */}
      <AlertDialog open={!!actionToDelete} onOpenChange={(open) => !open && setActionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Action</AlertDialogTitle>
            <AlertDialogDescription>
              {actionToDelete && goal && (
                <>
                  Are you sure you want to delete "{goalActions.find(a => a.id === actionToDelete)?.name}"? This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActionToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteAction}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Recurrence Selection Dialog */}
      <ActionRecurrenceDialog
        open={showRecurrenceDialog}
        onOpenChange={(open) => {
          setShowRecurrenceDialog(open);
          // No need to sync here - handleRecurrenceConfirm already updates both state and action
        }}
        onConfirm={handleRecurrenceConfirm}
        actionName={pendingActionName || editingActionName}
        initialRecurrence={editingActionId ? editingActionRecurrence : undefined}
      />
    </main>
  );
}
