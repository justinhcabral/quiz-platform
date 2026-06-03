export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 rounded-full border border-sky-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-700 shadow-sm">
          Quiz Platform
        </div>
        <h1 className="text-5xl font-black tracking-tight md:text-7xl">
          Learn fast.
          <br />
          Play louder.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-stone-600">
          A clean starter scaffold for the quiz platform. The prototype landing page lives on the `prototype/landing-page` branch.
        </p>
      </div>
    </main>
  );
}
