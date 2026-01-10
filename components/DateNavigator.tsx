'use client';

import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DateNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

export function DateNavigator({ selectedDate, onDateChange, className = '' }: DateNavigatorProps) {
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
    // Set navigation direction for animation (passing through a custom event or prop would be cleaner, but using a simple approach)
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Up arrow for previous day */}
      <button
        onClick={goToPreviousDay}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Previous day"
      >
        <ChevronUp className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
      </button>

      {/* Date display with smooth transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDate.getTime()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1 min-h-[60px] justify-center"
        >
          <div className="text-sm font-medium text-muted-foreground">
            {formatDateDisplay(selectedDate)}
          </div>
          <div className="text-xs text-muted-foreground/70">
            {selectedDate.toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Down arrow for next day */}
      <button
        onClick={goToNextDay}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Next day"
      >
        <ChevronDown className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
      </button>

      {/* Quick jump to today button */}
      {!isToday && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => onDateChange(today)}
          className="mt-2 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Back to Today
        </motion.button>
      )}
    </div>
  );
}

