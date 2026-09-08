/* Toasts are fired from a dozen unrelated places — ticking an exercise,
   saving a form, toggling a rest day — so they get their own tiny context
   rather than being threaded through props. */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [text, setText] = useState("");
  const [show, setShow] = useState(false);
  const timer = useRef(null);

  const toast = useCallback((message) => {
    setText(message);
    setShow(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), 1700);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div id="toast" className={show ? "show" : ""} role="status" aria-live="polite">
        {text}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
