// YouQuizz — production landing page.
// Visual direction: "Cartridge Shelf" (Variant B from the prototype session).
// See /tmp/quiz-platform-style-guides-handoff.md for the canonical style spec.

import { LandingPage, type LandingQuizPak } from "../components/landing/LandingPage";
import { listPublishedValidQuizPaks } from "../lib/quiz-repository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const quizzes = await listPublishedValidQuizPaks();
  const paks: LandingQuizPak[] = quizzes.map((quiz) => ({
    slug: quiz.slug,
    title: quiz.title,
    category: quiz.category,
    difficulty: quiz.difficulty,
    questionCount: quiz.questions.length,
  }));

  return <LandingPage paks={paks} />;
}
