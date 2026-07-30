import { createContext, useContext, ReactNode } from 'react';

export const DEFAULT_LOADING_DURATION = 300;

export interface ButtonConfig {
  loadingMinDuration?: number;
}

const ButtonConfigContext = createContext<ButtonConfig>({});

export function ButtonConfigProvider({
  value,
  children,
}: {
  value: ButtonConfig;
  children: ReactNode;
}) {
  return (
    <ButtonConfigContext.Provider value={value}>
      {children}
    </ButtonConfigContext.Provider>
  );
}

export function useButtonConfig(): ButtonConfig {
  return useContext(ButtonConfigContext);
}
