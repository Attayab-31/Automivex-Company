import { useState, useCallback, useEffect } from "react";
import { UI } from "@/shared/constants/app";

/**
 * useTimedMessage Hook
 * Manages timed, auto-clearing status messages (success/error notifications)
 *
 * Usage:
 *   const { message, showMessage } = useTimedMessage();
 *   await save();
 *   showMessage("Saved!"); // Auto-clears after 3s
 *
 * @param {number} duration - Duration (ms) before message auto-clears. Default: 3000ms
 * @returns {object} { message, showMessage }
 */
export function useTimedMessage(duration = UI.MESSAGE_DISPLAY_DURATION_MS) {
  const [message, setMessage] = useState("");
  const [timeoutId, setTimeoutId] = useState(null);

  const showMessage = useCallback((msg) => {
    // Clear any existing timeout
    if (timeoutId) clearTimeout(timeoutId);

    setMessage(msg);

    // Set new timeout to clear message
    const id = setTimeout(() => {
      setMessage("");
    }, duration);

    setTimeoutId(id);
  }, [duration, timeoutId]);

  // Cleanup timeout if component unmounts
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return { message, showMessage };
}
