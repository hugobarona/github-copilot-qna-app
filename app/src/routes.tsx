import { createBrowserRouter } from "react-router-dom";
import { AskQuestion } from "./screens/AskQuestion";
import { Home } from "./screens/Home";
import { QuestionDetail } from "./screens/QuestionDetail";
import { QuestionFeed } from "./screens/QuestionFeed";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/questions",
    Component: QuestionFeed,
  },
  {
    path: "/ask",
    Component: AskQuestion,
  },
  {
    path: "/question/:id",
    Component: QuestionDetail,
  },
]);
