import { isScoreInvalidatedBySuspiciousActivity, type SuspiciousActivityEvent } from "./anti-cheat";
import type { QuizPak } from "../types/quiz";
import { getChoiceById, getQuestionById, type ShuffledQuestion } from "./quiz-run";

export interface LockedAnswerWithCorrectness {
  questionId: string;
  selectedChoiceId: string | null;
  correctChoiceId: string;
  isCorrect: boolean;
}

export interface QuestionReviewItem {
  questionId: string;
  prompt: string;
  selectedChoiceId: string | null;
  selectedAnswerLabel: string | null;
  correctChoiceId: string;
  correctAnswerLabel: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizResult {
  quizSlug: string;
  quizTitle: string;
  category: string;
  difficulty: QuizPak["difficulty"];
  passingScore: number;
  submittedAt: string;
  startedAt: string;
  elapsedSeconds: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  scorePercent: number;
  status: "RUN CLEARED" | "TRY AGAIN";
  answers: LockedAnswerWithCorrectness[];
  review: QuestionReviewItem[];
  suspiciousActivityEvents: SuspiciousActivityEvent[];
  suspiciousActivityCount: number;
  isScoreInvalidated: boolean;
}

export function lockAnswer(input: {
  quiz: QuizPak;
  questionId: string;
  selectedChoiceId: string;
}): LockedAnswerWithCorrectness {
  const question = getQuestionById(input.quiz.questions, input.questionId);
  if (!question) {
    throw new Error(`Cannot lock answer for missing question ${input.questionId}`);
  }

  return {
    questionId: input.questionId,
    selectedChoiceId: input.selectedChoiceId,
    correctChoiceId: question.correctChoiceId,
    isCorrect: input.selectedChoiceId === question.correctChoiceId,
  };
}

export function scoreQuizRun(input: {
  quiz: QuizPak;
  startedAt: string;
  submittedAt?: string;
  shuffledQuestions: ShuffledQuestion[];
  lockedAnswers: LockedAnswerWithCorrectness[];
  suspiciousActivityEvents?: SuspiciousActivityEvent[];
}): QuizResult {
  const submittedAt = input.submittedAt ?? new Date().toISOString();
  const byQuestionId = new Map(
    input.lockedAnswers.map((answer) => [answer.questionId, answer]),
  );

  const answers = input.shuffledQuestions.map((slot) => {
    const existing = byQuestionId.get(slot.questionId);
    if (existing) return existing;

    const question = getQuestionById(input.quiz.questions, slot.questionId);
    if (!question) {
      throw new Error(`Cannot score missing question ${slot.questionId}`);
    }

    return {
      questionId: slot.questionId,
      selectedChoiceId: null,
      correctChoiceId: question.correctChoiceId,
      isCorrect: false,
    } satisfies LockedAnswerWithCorrectness;
  });

  const suspiciousActivityEvents = input.suspiciousActivityEvents ?? [];
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const totalQuestions = input.shuffledQuestions.length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const passingScore = input.quiz.passingScore ?? 70;

  const review = answers.map((answer) => {
    const question = getQuestionById(input.quiz.questions, answer.questionId);
    if (!question) {
      throw new Error(`Cannot review missing question ${answer.questionId}`);
    }

    const selected = answer.selectedChoiceId
      ? getChoiceById(question, answer.selectedChoiceId)
      : undefined;
    const correct = getChoiceById(question, answer.correctChoiceId);
    if (!correct) {
      throw new Error(`Cannot review missing correct choice ${answer.correctChoiceId}`);
    }

    return {
      questionId: answer.questionId,
      prompt: question.prompt,
      selectedChoiceId: answer.selectedChoiceId,
      selectedAnswerLabel: selected?.label ?? null,
      correctChoiceId: answer.correctChoiceId,
      correctAnswerLabel: correct.label,
      isCorrect: answer.isCorrect,
      explanation: question.explanation,
    } satisfies QuestionReviewItem;
  });

  return {
    quizSlug: input.quiz.slug,
    quizTitle: input.quiz.title,
    category: input.quiz.category,
    difficulty: input.quiz.difficulty,
    passingScore,
    startedAt: input.startedAt,
    submittedAt,
    elapsedSeconds: Math.max(
      0,
      Math.round((Date.parse(submittedAt) - Date.parse(input.startedAt)) / 1000),
    ),
    totalQuestions,
    correctCount,
    incorrectCount: totalQuestions - correctCount,
    scorePercent,
    status: scorePercent >= passingScore ? "RUN CLEARED" : "TRY AGAIN",
    answers,
    review,
    suspiciousActivityEvents,
    suspiciousActivityCount: suspiciousActivityEvents.length,
    isScoreInvalidated: isScoreInvalidatedBySuspiciousActivity(suspiciousActivityEvents),
  };
}
