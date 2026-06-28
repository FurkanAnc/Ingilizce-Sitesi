import { createContext, useContext } from 'react';

interface NavigationContextType {
  navigate: (path: string) => void;
  currentPath: string;
}

export const NavigationContext = createContext<NavigationContextType | null>(null);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
