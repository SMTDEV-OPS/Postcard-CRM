import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface MobileNavContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  close: () => void;
}

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <MobileNavContext.Provider value={{ open, setOpen, close }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  const ctx = useContext(MobileNavContext);
  if (!ctx) {
    return {
      open: false,
      setOpen: () => {},
      close: () => {},
    };
  }
  return ctx;
}
