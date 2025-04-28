"use client";

import { type ReactNode, createContext, useContext } from "react";
import { useElevatorSystem } from "../hooks/useElevatorSystem";

// createContextの型を指定
const ElevatorSystemContext = createContext<ReturnType<
  typeof useElevatorSystem
> | null>(null);

// プロバイダーコンポーネント
export function ElevatorSystemProvider({ children }: { children: ReactNode }) {
  const elevatorSystem = useElevatorSystem();

  return (
    <ElevatorSystemContext.Provider value={elevatorSystem}>
      {children}
    </ElevatorSystemContext.Provider>
  );
}

// カスタムフック
export function useSharedElevatorSystem() {
  const context = useContext(ElevatorSystemContext);
  if (!context) {
    throw new Error(
      "useSharedElevatorSystem must be used within an ElevatorSystemProvider",
    );
  }
  return context;
}
