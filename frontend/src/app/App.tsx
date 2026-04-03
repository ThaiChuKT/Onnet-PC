import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./auth/AuthProvider";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "next-themes";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster richColors closeButton />
      </AuthProvider>
    </ThemeProvider>
  );
}