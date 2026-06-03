import type { QuizQuestion } from "../types/quiz";

export interface ShuffledQuestion {
  questionId: string;
  choiceIds: string[];
}

export interface InitializedQuizRun {
  runId: string;
  quizSlug: string;
  startedAt: string;
  shuffledQuestions: ShuffledQuestion[];
}

function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createRunId(slug: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${slug}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function initializeQuizRun(input: {
  quizSlug: string;
  questions: QuizQuestion[];
  now?: Date;
  random?: () => number;
}): InitializedQuizRun {
  const random = input.random ?? Math.random;
  const questionOrder = shuffle(input.questions, random);

  return {
    runId: createRunId(input.quizSlug),
    quizSlug: input.quizSlug,
    startedAt: (input.now ?? new Date()).toISOString(),
    shuffledQuestions: questionOrder.map((question) => ({
      questionId: question.id,
      choiceIds: shuffle(
        question.choices.map((choice) => choice.id),
        random,
      ),
    })),
  };
}

export function getQuestionById(questions: QuizQuestion[], id: string) {
  return questions.find((question) => question.id === id);
}

export function getChoiceById(question: QuizQuestion, id: string) {
  return question.choices.find((choice) => choice.id === id);
}
