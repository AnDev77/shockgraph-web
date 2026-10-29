import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./app/router";
import "../styles.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});
const element = document.getElementById("app");
if (!element) throw new Error("앱 시작 영역이 없습니다");
createRoot(element).render(
  <StrictMode><QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider></StrictMode>,
);
