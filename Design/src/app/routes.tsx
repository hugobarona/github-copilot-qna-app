import { createBrowserRouter } from "react-router";
import { QuestionFeed } from "./screens/QuestionFeed";
import { AskQuestion } from "./screens/AskQuestion";
import { QuestionDetail } from "./screens/QuestionDetail";

export const router = createBrowserRouter([
  {
    path: "/",
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
