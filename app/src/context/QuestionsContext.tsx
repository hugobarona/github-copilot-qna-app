import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createQuestion,
  type CreateQuestionResult,
  getQuestion,
  getQuestions,
  upvoteQuestion,
} from "../services/questionsApi";
import type { Question } from "../types/question";

interface QuestionsContextValue {
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  loadQuestions: () => Promise<void>;
  addQuestion: (questionText: string) => Promise<CreateQuestionResult>;
  toggleUpvote: (id: string) => Promise<void>;
  getQuestionById: (id: string) => Question | undefined;
  fetchQuestionById: (id: string) => Promise<Question>;
}

const QuestionsContext = createContext<QuestionsContextValue | undefined>(
  undefined,
);

export function QuestionsProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getQuestions();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Failed to load questions";
      setError(message);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  const addQuestion = useCallback(async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) {
      throw new Error("Question cannot be empty");
    }

    const optimisticQuestion: Question = {
      id: `temp-${crypto.randomUUID()}`,
      question: trimmed,
      upvotes: 0,
      status: "unanswered",
      upvotedByUser: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setQuestions((prev) => [optimisticQuestion, ...prev]);

    try {
      const result = await createQuestion(trimmed);

      setQuestions((prev) =>
        prev.map((item) =>
          item.id === optimisticQuestion.id ? result.question : item
        ),
      );

      return result;
    } catch (error) {
      setQuestions((prev) =>
        prev.filter((item) => item.id !== optimisticQuestion.id),
      );
      throw error;
    }
  }, []);

  const toggleUpvote = useCallback(async (id: string) => {
    const updatedQuestion = await upvoteQuestion(id);

    setQuestions((prev) =>
      prev.map((item) => (item.id === id ? updatedQuestion : item)),
    );
  }, []);

  const getQuestionById = useCallback(
    (id: string) => questions.find((item) => item.id === id),
    [questions],
  );

  const fetchQuestionById = useCallback(async (id: string) => {
    const loadedQuestion = await getQuestion(id);

    setQuestions((prev) => {
      const exists = prev.some((item) => item.id === loadedQuestion.id);
      if (exists) {
        return prev.map((item) =>
          item.id === loadedQuestion.id ? loadedQuestion : item,
        );
      }

      return [loadedQuestion, ...prev];
    });

    return loadedQuestion;
  }, []);

  const value = useMemo(
    () => ({
      questions,
      isLoading,
      error,
      loadQuestions,
      addQuestion,
      toggleUpvote,
      getQuestionById,
      fetchQuestionById,
    }),
    [
      questions,
      isLoading,
      error,
      loadQuestions,
      addQuestion,
      toggleUpvote,
      getQuestionById,
      fetchQuestionById,
    ],
  );

  return (
    <QuestionsContext.Provider value={value}>{children}</QuestionsContext.Provider>
  );
}

export function useQuestions() {
  const context = useContext(QuestionsContext);

  if (!context) {
    throw new Error("useQuestions must be used within a QuestionsProvider");
  }

  return context;
}
