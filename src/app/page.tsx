import { Suspense } from "react";
import VariantA from "./_prototype/VariantA";
import VariantB from "./_prototype/VariantB";
import VariantC from "./_prototype/VariantC";
import VariantD from "./_prototype/VariantD";
import { PrototypeSwitcher } from "./_prototype/PrototypeSwitcher";

// PROTOTYPE — landing page is currently four switchable variants.
// All share the "colorful + gamified" brief. Switch via ?variant=A|B|C|D
// or the floating bar (←/→). Once a winner is chosen, fold it into this
// page and delete _prototype/.

const VARIANTS = [
  { key: "A", name: "Arcade (TETR.io-style)" },
  { key: "B", name: "Cartridge Shelf" },
  { key: "C", name: "Quest Map" },
  { key: "D", name: "Gameshow Stage" },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>;
}) {
  const { variant } = await searchParams;
  const v = (variant ?? "A").toUpperCase();

  return (
    <>
      {v === "B" ? (
        <VariantB />
      ) : v === "C" ? (
        <VariantC />
      ) : v === "D" ? (
        <VariantD />
      ) : (
        <VariantA />
      )}
      <Suspense fallback={null}>
        <PrototypeSwitcher variants={VARIANTS} />
      </Suspense>
    </>
  );
}
