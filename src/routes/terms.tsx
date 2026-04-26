import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — ZeroGap AI" },
      { name: "description", content: "Plain-English terms of service for ZeroGap AI. Free for verified college students. Use it honestly and we'll keep building it." },
      { property: "og:title", content: "Terms of Service — ZeroGap AI" },
      { property: "og:description", content: "Honest, short terms of service for ZeroGap AI users." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PageShell>
      <main className="container-narrow mx-auto px-6 py-20 max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: April 2026</p>

        <p className="text-[15px] text-foreground/85 mb-6">
          Short version: ZeroGap AI is free for college students. Be honest with us, don't abuse it,
          and we'll keep improving it.
        </p>

        <ul className="list-disc pl-5 space-y-3 text-[15px] text-foreground/85">
          <li>Free for students with verified college emails.</li>
          <li>Don't upload someone else's resume without permission.</li>
          <li>Don't use ZeroGap for automated scraping or reselling outputs.</li>
          <li>We may suspend accounts that misuse the platform.</li>
          <li>The AI analysis is advisory — it isn't a guarantee of any employment outcome.</li>
          <li>We may update these terms; we'll email you when major things change.</li>
        </ul>

        <h2 className="font-display text-2xl mt-12 mb-3">Contact</h2>
        <p className="text-[15px] text-foreground/85">
          Questions? Email <a href="mailto:hello@zerogap.ai">hello@zerogap.ai</a>.
        </p>

        <p className="text-center text-xs text-muted-foreground mt-16">Made with ❤️ for Indian students</p>
      </main>
    </PageShell>
  );
}
