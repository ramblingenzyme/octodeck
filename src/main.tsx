import { render } from "preact";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./globals.css";
import { App } from "@/components/App";

const queryClient = new QueryClient();

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
  root,
);
