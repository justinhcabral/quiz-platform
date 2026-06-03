import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { QuizRunner } from "../../../components/quiz/QuizRunner";
import { getQuizPakBySlug } from "../../../lib/quiz-repository";

export const dynamic = "force-dynamic";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getQuizPakBySlug(slug);

  if (!result.ok) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#1b1340] px-6 text-white">
        <section className="max-w-xl rounded-[2rem] border-2 border-rose-300/30 bg-rose-950/35 p-8 text-center shadow-[0_10px_0_rgba(0,0,0,.35)]">
          <AlertTriangle className="mx-auto mb-4 text-rose-200" size={40} />
          <h1 className="text-3xl font-black">PAK CORRUPTED</h1>
          <p className="mt-3 text-sm leading-6 text-white/65">
            This quiz pak is missing, unpublished, or failed validation. Pick a
            different cartridge from the library.
          </p>
          <Link
            href="/quizzes"
            className="mt-6 inline-block rounded-xl bg-yellow-300 px-5 py-3 font-black text-black"
          >
            BACK TO LIBRARY
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1b1340] bg-[radial-gradient(circle_at_top,#ffcf5a38,transparent_35%)]">
      <QuizRunner quiz={result.quiz} />
    </main>
  );
}
