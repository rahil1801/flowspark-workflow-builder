import AppShell from "@/components/AppShell";
import { Link } from "wouter";
import { ArrowRight, History, PlayCircle, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function FeatureCard({
  icon,
  title,
  description,
  href,
  testId,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  testId: string;
  tone: "primary" | "accent" | "neutral";
}) {
  const toneClass =
    tone === "primary"
      ? "from-primary/16 via-primary/7 to-transparent"
      : tone === "accent"
        ? "from-accent/16 via-accent/7 to-transparent"
        : "from-foreground/8 via-foreground/4 to-transparent";

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card/70 backdrop-blur",
        "shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-all duration-300",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-70",
          "bg-gradient-to-br",
          toneClass,
        )}
      />
      <div className="relative p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="grid place-items-center h-12 w-12 rounded-2xl border bg-background shadow-sm">
            {icon}
          </div>
          <Link
            href={href}
            className={cn(
              "inline-flex items-center gap-1 text-sm font-medium",
              "text-muted-foreground hover:text-foreground transition-colors",
            )}
            data-testid={testId}
          >
            Open <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <h3 className="mt-5 text-xl">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
}

export default function Home() {
  return (
    <AppShell
      title="Workflow Builder Lite"
      subtitle="Design tiny text workflows, run them instantly, and keep a crisp history — all in one clean place."
      breadcrumb={[{ label: "Home" }]}
      actions={
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/workflows/new" className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto rounded-xl shadow-sm hover:shadow-md transition-all"
              data-testid="home-cta-create"
              onClick={() => {}}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Create workflow
            </Button>
          </Link>
          <Link href="/run" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              className="w-full sm:w-auto rounded-xl"
              data-testid="home-cta-run"
              onClick={() => {}}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Run
            </Button>
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <div className="rounded-3xl glass shadow-[var(--shadow-soft)] overflow-hidden border">
            <div className="p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Minimal interface. Max clarity.
              </div>

              <h2 className="mt-4 text-2xl sm:text-3xl leading-tight">
                Build a workflow in minutes —
                <span className="text-foreground/70"> keep it legible forever.</span>
              </h2>

              <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl">
                Choose 2–4 steps like cleaning text, summarizing, extracting key points, or tagging categories.
                Run it on any input and inspect each step output with zero noise.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link href="/workflows/new" className="w-full sm:w-auto">
                  <Button
                    className="w-full sm:w-auto rounded-xl"
                    data-testid="home-primary"
                    onClick={() => {}}
                  >
                    Start a new workflow
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/history" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto rounded-xl"
                    data-testid="home-secondary"
                    onClick={() => {}}
                  >
                    View recent runs
                  </Button>
                </Link>
              </div>
            </div>

            <div className="border-t bg-background/60">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
                {[
                  { k: "2–4", v: "steps per workflow" },
                  { k: "5", v: "runs kept on History" },
                  { k: "10s", v: "status auto-refresh" },
                ].map((s) => (
                  <div key={s.v} className="p-5 sm:p-6">
                    <div className="text-2xl font-semibold">{s.k}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          <FeatureCard
            icon={<Wand2 className="h-5 w-5 text-primary" />}
            title="Create workflows"
            description="Name it, pick 2–4 steps, and validate instantly."
            href="/workflows/new"
            testId="home-link-create"
            tone="primary"
          />
          <FeatureCard
            icon={<PlayCircle className="h-5 w-5 text-accent" />}
            title="Run & inspect"
            description="See each step output as a clean card, plus final output."
            href="/run"
            testId="home-link-run"
            tone="accent"
          />
          <FeatureCard
            icon={<History className="h-5 w-5 text-foreground" />}
            title="History & status"
            description="Review the last runs and check system health."
            href="/history"
            testId="home-link-history"
            tone="neutral"
          />
        </div>
      </div>
    </AppShell>
  );
}
