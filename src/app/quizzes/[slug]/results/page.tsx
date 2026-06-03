import { QuizResults } from "../../../../components/quiz/QuizResults";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <QuizResults slug={slug} />;
}
