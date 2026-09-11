import { createContext, useCallback, useContext, useState } from 'react';

interface SpotlightContextValue {
  open: boolean;
  openSpotlight: () => void;
  closeSpotlight: () => void;
}

const SpotlightContext = createContext<SpotlightContextValue>({
  open: false,
  openSpotlight: () => undefined,
  closeSpotlight: () => undefined,
});

export function SpotlightProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openSpotlight = useCallback(() => setOpen(true), []);
  const closeSpotlight = useCallback(() => setOpen(false), []);
  return (
    <SpotlightContext.Provider value={{ open, openSpotlight, closeSpotlight }}>
      {children}
    </SpotlightContext.Provider>
  );
}

export function useSpotlight() {
  return useContext(SpotlightContext);
}
