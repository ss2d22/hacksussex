import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/react-router";
import { BrowserRouter } from "react-router-dom";
import { store } from "@/state/store";
import { setupListeners } from "@reduxjs/toolkit/query";
import { Provider } from "react-redux";

setupListeners(store.dispatch);

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
          <App />
        </ClerkProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
