import React, { createContext, useContext, useState, useCallback } from "react";

export interface Customer {
  id: string;
  name: string;
  email: string;
  currentStepId: string | null;
}

export interface ProcessStep {
  id: string;
  label: string;
  order: number;
}

interface AppState {
  isLoggedIn: boolean;
  customers: Customer[];
  steps: ProcessStep[];
  login: () => void;
  logout: () => void;
  addStep: (label: string) => void;
  removeStep: (id: string) => void;
  moveStepUp: (id: string) => void;
  moveStepDown: (id: string) => void;
  setCustomerStep: (customerId: string, stepId: string | null) => void;
}

const DEFAULT_STEPS: ProcessStep[] = [
  { id: "1", label: "Order Received", order: 0 },
  { id: "2", label: "In Progress", order: 1 },
  { id: "3", label: "Shipped", order: 2 },
  { id: "4", label: "Delivered", order: 3 },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: "1", name: "Karthi", email: "benisaac1324@gmail.com", currentStepId: null },
];

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(DEFAULT_CUSTOMERS);
  const [steps, setSteps] = useState<ProcessStep[]>(DEFAULT_STEPS);

  const login = useCallback(() => setIsLoggedIn(true), []);
  const logout = useCallback(() => setIsLoggedIn(false), []);

  const addStep = useCallback((label: string) => {
    setSteps((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        label,
        order: prev.length,
      },
    ]);
  }, []);

  const removeStep = useCallback((id: string) => {
    setSteps((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order: i }))
    );
  }, []);

  const moveStepUp = useCallback((id: string) => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
  }, []);

  const moveStepDown = useCallback((id: string) => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
  }, []);

  const setCustomerStep = useCallback((customerId: string, stepId: string | null) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, currentStepId: stepId } : c))
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        customers,
        steps,
        login,
        logout,
        addStep,
        removeStep,
        moveStepUp,
        moveStepDown,
        setCustomerStep,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
