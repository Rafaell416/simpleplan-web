'use client';

import React from 'react';
import { SettingsContext, useSettingsInternal } from '@/lib/useSettings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const settingsValue = useSettingsInternal();

  return (
    <SettingsContext.Provider value={settingsValue}>
      {children}
    </SettingsContext.Provider>
  );
}

