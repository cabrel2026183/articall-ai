"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import Toast from "../ui/Toast";

type ToastType = "success" | "error" | "info";

type ToastData = {
  open: boolean;
  title: string;
  message?: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (toast: Omit<ToastData, "open">) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toast, setToast] = useState<ToastData>({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  const showToast = useCallback(
    ({
      title,
      message,
      type = "info",
    }: Omit<ToastData, "open">) => {
      setToast({
        open: true,
        title,
        message,
        type,
      });

      setTimeout(() => {
        setToast((previous) => ({
          ...previous,
          open: false,
        }));
      }, 3000);
    },
    []
  );

  const value = useMemo(
    () => ({
      showToast,
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <Toast
        open={toast.open}
        title={toast.title}
        message={toast.message}
        type={toast.type}
        onClose={() =>
          setToast((previous) => ({
            ...previous,
            open: false,
          }))
        }
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast doit être utilisé dans ToastProvider."
    );
  }

  return context;
}