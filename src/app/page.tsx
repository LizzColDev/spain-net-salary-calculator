import { CalculatorForm } from "@/components/calculator/calculator-form";
import { getStructuredData } from "@/lib/structured-data";

export default function Home() {
  const jsonLd = getStructuredData();

  return (
    <main className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container py-6 sm:py-10">
        <CalculatorForm />
      </div>
    </main>
  );
}
