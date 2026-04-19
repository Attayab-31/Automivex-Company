import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const usePreferencesStore = create(
  persist(
    (set) => ({
      theme: "dark",
      cookieConsent: "pending",
      setTheme(theme) {
        set({
          theme: theme === "light" ? "light" : "dark",
        });
      },
      setCookieConsent(cookieConsent) {
        set({
          cookieConsent:
            cookieConsent === "accepted" || cookieConsent === "rejected"
              ? cookieConsent
              : "pending",
        });
      },
    }),
    {
      name: "automivex-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ theme, cookieConsent }) => ({
        theme,
        cookieConsent,
      }),
    }
  )
);
