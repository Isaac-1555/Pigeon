import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  saveEmailTemplates,
  loadEmailTemplates,
  saveBusinessName,
  loadBusinessName,
  saveCustomers,
  loadCustomers,
  StoredEmailTemplate,
} from "@/lib/storage";

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

export interface EmailTemplate {
  stepId: string;
  subject: string;
  body: string;
}

interface AppState {
  isLoggedIn: boolean;
  customers: Customer[];
  steps: ProcessStep[];
  emailTemplates: EmailTemplate[];
  businessName: string;
  login: () => void;
  logout: () => void;
  addStep: (label: string) => void;
  removeStep: (id: string) => void;
  moveStepUp: (id: string) => void;
  moveStepDown: (id: string) => void;
  setCustomerStep: (customerId: string, stepId: string | null) => void;
  updateEmailTemplate: (stepId: string, subject: string, body: string) => void;
  getEmailTemplate: (stepId: string) => EmailTemplate | undefined;
  setBusinessName: (name: string) => void;
}

const DEFAULT_STEPS: ProcessStep[] = [
  { id: "1", label: "Order Received", order: 0 },
  { id: "2", label: "In Progress", order: 1 },
  { id: "3", label: "Shipped", order: 2 },
  { id: "4", label: "Delivered", order: 3 },
];

const DEFAULT_BUSINESS_NAME = "Pigeon";

function buildDefaultTemplates(businessName: string): EmailTemplate[] {
  return [
    {
      stepId: "1",
      subject: "Order Received - Thank you, {{customer_name}}!",
      body: `Hi {{customer_name}},

Thank you for your order! We've received it and it's now in our queue.

We'll begin working on it shortly and keep you updated on the progress.

Estimated processing time: 3-5 business days.

If you have any questions in the meantime, feel free to reach out.

Best regards,
{{business_name}}`,
    },
    {
      stepId: "2",
      subject: "Your order is now in progress",
      body: `Hi {{customer_name}},

Great news! Your order is now {{step_name}}. Our team is giving it their full attention.

We'll notify you as soon as it moves to the next stage.

Best regards,
{{business_name}}`,
    },
    {
      stepId: "3",
      subject: "Your order has been shipped!",
      body: `Hi {{customer_name}},

Your order has been shipped and is on its way to you!

Please allow a few days for delivery. We'll let you know once it arrives.

Best regards,
{{business_name}}`,
    },
    {
      stepId: "4",
      subject: "Your order has been delivered!",
      body: `Hi {{customer_name}},

Your order has been successfully delivered! We hope everything meets your expectations.

If you have any questions or concerns about your order, please don't hesitate to contact us.

Thank you for choosing {{business_name}}!

Best regards,
{{business_name}}`,
    },
  ];
}

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: "1", name: "Karthi", email: "benisaac1324@gmail.com", currentStepId: null },
];

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(DEFAULT_CUSTOMERS);
  const [steps, setSteps] = useState<ProcessStep[]>(DEFAULT_STEPS);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(
    buildDefaultTemplates(DEFAULT_BUSINESS_NAME)
  );
  const [businessName, setBusinessNameState] = useState(DEFAULT_BUSINESS_NAME);

  // Load persisted data on mount
  useEffect(() => {
    (async () => {
      const [savedTemplates, savedName, savedCustomers] = await Promise.all([
        loadEmailTemplates(),
        loadBusinessName(),
        loadCustomers(),
      ]);
      if (savedName) {
        setBusinessNameState(savedName);
      }
      if (savedTemplates) {
        setEmailTemplates(savedTemplates);
      } else if (savedName) {
        setEmailTemplates(buildDefaultTemplates(savedName));
      }
      if (savedCustomers) {
        setCustomers(savedCustomers);
      }
    })();
  }, []);

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
    // Also remove the associated email template
    setEmailTemplates((prev) => {
      const updated = prev.filter((t) => t.stepId !== id);
      saveEmailTemplates(updated);
      return updated;
    });
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
    setCustomers((prev) => {
      const updated = prev.map((c) =>
        c.id === customerId ? { ...c, currentStepId: stepId } : c
      );
      saveCustomers(updated);
      return updated;
    });
  }, []);

  const updateEmailTemplate = useCallback(
    (stepId: string, subject: string, body: string) => {
      setEmailTemplates((prev) => {
        const exists = prev.some((t) => t.stepId === stepId);
        const updated = exists
          ? prev.map((t) => (t.stepId === stepId ? { ...t, subject, body } : t))
          : [...prev, { stepId, subject, body }];
        saveEmailTemplates(updated);
        return updated;
      });
    },
    []
  );

  const getEmailTemplate = useCallback(
    (stepId: string): EmailTemplate | undefined => {
      return emailTemplates.find((t) => t.stepId === stepId);
    },
    [emailTemplates]
  );

  const handleSetBusinessName = useCallback((name: string) => {
    setBusinessNameState(name);
    saveBusinessName(name);
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        customers,
        steps,
        emailTemplates,
        businessName,
        login,
        logout,
        addStep,
        removeStep,
        moveStepUp,
        moveStepDown,
        setCustomerStep,
        updateEmailTemplate,
        getEmailTemplate,
        setBusinessName: handleSetBusinessName,
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
