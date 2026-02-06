'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { TimePhase, TIME_PHASES } from '@/lib/constants';

interface ThemeContextValue {
  phase: TimePhase;
  theme: typeof TIME_PHASES[TimePhase];
}

const ThemeContext = createContext<ThemeContextValue>({
  phase: 'afternoon',
  theme: TIME_PHASES.afternoon,
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: ReactNode;
  phase: TimePhase;
}

export function ThemeProvider({ children, phase }: ThemeProviderProps) {
  const theme = TIME_PHASES[phase];

  // Update CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;

    // Set CSS variables for smooth transitions
    root.style.setProperty('--theme-bg', theme.bg);
    root.style.setProperty('--theme-bg-gradient', theme.bgGradient || theme.bg);
    root.style.setProperty('--theme-text', theme.text);
    root.style.setProperty('--theme-text-muted', theme.textMuted);
    root.style.setProperty('--theme-accent', theme.accent);

    // Add phase class for additional styling
    root.setAttribute('data-theme-phase', phase);
  }, [theme, phase]);

  return (
    <ThemeContext.Provider value={{ phase, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}
