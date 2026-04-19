import { useEffect } from "react";
import { usePreferencesStore } from "@/shared/stores/preferencesStore";

export function ThemeProvider({ children }) {
  const theme = usePreferencesStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return children;
}
