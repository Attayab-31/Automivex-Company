import { QueryProvider } from "@/app/providers/QueryProvider";
import { ConsentProvider } from "@/app/providers/ConsentProvider";
import { ThemeProvider } from "@/app/providers/ThemeProvider";

export function AppProviders({ children }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <ConsentProvider>{children}</ConsentProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
