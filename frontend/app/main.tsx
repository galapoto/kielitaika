import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { AppStateProvider } from "./state/AppStateProvider";
import "./theme/tokens.css";
import "./theme/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>,
);
