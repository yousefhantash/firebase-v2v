import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // استيراد BrowserRouter
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter> {/* التفاف التطبيق داخل BrowserRouter */}
    <App />
  </BrowserRouter>
);
