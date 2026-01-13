'use client';

import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DateNavigatorMobileProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

export function DateNavigatorMobile({ selectedDate, onDateChange, className = '' }: DateNavigatorMobileProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const selected = new Date(selectedDate);
  selected.setHours(0, 0, 0, 0);
  
  const isToday = selected.getTime() === today.getTime();

  const formatDateDisplay = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
    
    // Format as date for other days
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return targetDate.toLocaleDateString('en-US', options);
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7); // 7 days from today
    
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    
    // Don't allow navigation beyond 7 days from today
    if (selected.getTime() >= maxDate.getTime()) {
      return;
    }
    
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    
    // Ensure we don't exceed the 7-day limit
    const newDateNormalized = new Date(newDate);
    newDateNormalized.setHours(0, 0, 0, 0);
    if (newDateNormalized.getTime() <= maxDate.getTime()) {
      onDateChange(newDate);
    }
  };
  
  // Check if we can navigate forward (not more than 7 days from today)
  const canNavigateForward = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7);
    
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    
    return selected.getTime() < maxDate.getTime();
  };

  return (
    <div className={`flex flex-col items-center gap-1.5 w-full ${className}`}>
      {/* Up arrow for previous day */}
      <button
        onClick={goToPreviousDay}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted active:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-manipulation"
        aria-label="Previous day"
      >
        <ChevronUp className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Date display with smooth transition - Compact for mobile */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDate.getTime()}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-0.5 min-h-[40px] justify-center"
        >
          <div className="text-xs font-medium text-foreground">
            {formatDateDisplay(selectedDate)}
          </div>
          <div className="text-[10px] text-muted-foreground/70">
            {selectedDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric'
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Down arrow for next day */}
      <button
        onClick={goToNextDay}
        disabled={!canNavigateForward()}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-manipulation ${
          canNavigateForward()
            ? 'hover:bg-muted active:bg-muted/80'
            : 'opacity-50 cursor-not-allowed'
        }`}
        aria-label="Next day"
      >
        <ChevronDown className={`w-4 h-4 ${
          canNavigateForward()
            ? 'text-muted-foreground'
            : 'text-muted-foreground/50'
        }`} />
      </button>

      {/* Quick jump to today button - Mobile compact */}
      {!isToday && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={() => onDateChange(today)}
          className="mt-1 px-2.5 py-1 text-[10px] font-medium text-primary hover:bg-primary/10 active:bg-primary/20 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-manipulation"
        >
          Today
        </motion.button>
      )}
    </div>
  );
}

