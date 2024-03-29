import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { navigatorDetector } from "typesafe-i18n/detectors";

import App from "./app";

const detectors = [navigatorDetector];

const container = document.getElementById("app") as HTMLElement;
const root = createRoot(container);
root.render(
  <StrictMode>
    <div style={{ height: "100vh", width: "100vw" }}>
      <App localeDetectors={detectors} />
    </div>
  </StrictMode>,
);
