// src/contexts/GummyGumContext.tsx
import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { resolveGummyGumLaunch, type GummyGumSession } from "../lib/gummygumSession";

type GgAccessState = "checking" | "granted" | "denied";

interface GummyGumContextType {
  ggSession: GummyGumSession | null;
  ggAccessState: GgAccessState;
}

const GummyGumContext = createContext<GummyGumContextType | undefined>(undefined);

export const GummyGumProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ggSession, setGgSession] = useState<GummyGumSession | null>(null);
  const [ggAccessState, setGgAccessState] = useState<GgAccessState>("checking");

  useEffect(() => {
    resolveGummyGumLaunch().then((session) => {
      setGgSession(session);
      setGgAccessState(session ? "granted" : "denied");
    });
  }, []);

  return (
    <GummyGumContext.Provider value={{ ggSession, ggAccessState }}>
      {children}
    </GummyGumContext.Provider>
  );
};

export const useGummyGum = () => {
  const context = useContext(GummyGumContext);
  if (!context) throw new Error("useGummyGum must be used within GummyGumProvider");
  return context;
};
