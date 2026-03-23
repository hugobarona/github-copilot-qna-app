import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { QuestionsProvider } from "./context/QuestionsContext";
import "./styles/index.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QuestionsProvider>
      <App />
    </QuestionsProvider>
  </StrictMode>,
)
