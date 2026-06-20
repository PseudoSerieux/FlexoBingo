import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// @ts-ignore: side-effect import for CSS file
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
