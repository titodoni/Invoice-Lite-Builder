import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root");
if (!root) {
  console.error("Root element not found!");
} else {
  console.log("Mounting app to root...");
  try {
    createRoot(root).render(<App />);
    console.log("App mounted successfully");
  } catch (e) {
    console.error("Error mounting app:", e);
  }
}
