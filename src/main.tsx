import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import "@/lib/i18n.ts";
import { refreshExchangeRates } from "@/lib/currency.ts";
import App from "./App.tsx";
import "./index.css";

// Load live exchange rates in the background (static fallback until then).
refreshExchangeRates();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
