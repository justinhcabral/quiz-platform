import type { Difficulty, QuizQuestion } from "../types/quiz";

export const TIMER_SECONDS_PER_QUESTION: Record<Difficulty, number> = {
  easy: 60,
  medium: 30,
  hard: 15,
};

export function getQuizRunSeconds(difficulty: Difficulty, questionCount: number) {
  return TIMER_SECONDS_PER_QUESTION[difficulty] * questionCount;
}

export interface ShuffledQuestion {
  questionId: string;
  choiceIds: string[];
}

export interface InitializedQuizRun {
  runId: string;
  quizSlug: string;
  startedAt: string;
  timerEndsAt: string;
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
  difficulty: Difficulty;
  now?: Date;
  random?: () => number;
}): InitializedQuizRun {
  const random = input.random ?? Math.random;
  const now = input.now ?? new Date();
  const questionOrder = shuffle(input.questions, random);
  const timerEndsAt = new Date(
    now.getTime() + getQuizRunSeconds(input.difficulty, input.questions.length) * 1000,
  );

  return {
    runId: createRunId(input.quizSlug),
    quizSlug: input.quizSlug,
    startedAt: now.toISOString(),
    timerEndsAt: timerEndsAt.toISOString(),
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
