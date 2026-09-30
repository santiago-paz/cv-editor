"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface ToastAction {
  label: string;
  run: () => void;
}

interface Message {
  text: string;
  action?: ToastAction;
  id: number;
}

/** One message at a time, with an optional action such as Undo. */
export function useToast() {
  const [message, setMessage] = useState<Message | null>(null);
  const timer = useRef(0);

  const show = useCallback((text: string, options: { action?: ToastAction; ms?: number } = {}) => {
    window.clearTimeout(timer.current);
    setMessage({ text, action: options.action, id: Date.now() });
    timer.current = window.setTimeout(() => setMessage(null), options.ms ?? (options.action ? 7000 : 3600));
  }, []);

  const hide = useCallback(() => {
    window.clearTimeout(timer.current);
    setMessage(null);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { message, show, hide };
}

export function Toast({ message, onDone }: { message: Message | null; onDone: () => void }) {
  return (
    <div className={"toast" + (message ? " on" : "")} role="status" aria-live="polite">
      {message && <span>{message.text}</span>}
      {message?.action && (
        <button
          type="button"
          onClick={() => {
            message.action?.run();
            onDone();
          }}
        >
          {message.action.label}
        </button>
      )}
    </div>
  );
}
