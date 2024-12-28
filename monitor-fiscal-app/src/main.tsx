import { TooltipProvider } from "@radix-ui/react-tooltip";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.tsx";
import "./index.css";
import { store } from "./store.tsx";
import { Modal } from "./components/modal.tsx";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TooltipProvider>
      <Provider store={store}>
        <App />
        <Modal />
      </Provider>
    </TooltipProvider>
  </React.StrictMode>
);
