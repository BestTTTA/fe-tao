"use client";

import { createContext, useCallback, useContext, useState } from "react";

type LoadingContextType = {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType>({
  showLoading: () => {},
  hideLoading: () => {},
});

export function useLoading() {
  return useContext(LoadingContext);
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("กำลังโหลด...");

  const showLoading = useCallback((msg?: string) => {
    setMessage(msg ?? "กำลังโหลด...");
    setVisible(true);
  }, []);

  const hideLoading = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {visible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white" />
            <p className="text-white text-sm">{message}</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}
