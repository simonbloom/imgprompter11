import { StyleExtractorWizard } from "@/components/StyleExtractorWizard";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border-color)]">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-medium">imgPrompter11</h1>
            <span className="mono-tag">v0.1</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-[var(--border-color)]">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="space-y-4">
            <p className="mono-label">AI Style Extraction</p>
            <h2 className="text-3xl font-medium leading-tight">
              Turn any image into an
              <br />
              <span className="accent-ai">AI style prompt</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-lg">
              Upload images, and Claude 4.5 Sonnet will analyze their visual
              style characteristics and generate a prompt you can use with any
              AI image generator.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <StyleExtractorWizard />
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] mt-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
            <p>
              Built with{" "}
              <a
                href="https://replicate.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-[var(--text-secondary)]"
              >
                Replicate
              </a>{" "}
              +{" "}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-[var(--text-secondary)]"
              >
                Vercel
              </a>
            </p>
            <p>BYOK · Your API key, your usage</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
