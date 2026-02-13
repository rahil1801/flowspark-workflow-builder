import { ReactNode, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Activity,
  ChevronRight,
  History,
  PlayCircle,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const nav = [
  { href: "/", label: "Home", icon: Sparkles },
  { href: "/workflows/new", label: "Create", icon: Wand2 },
  { href: "/run", label: "Run", icon: PlayCircle },
  { href: "/history", label: "History", icon: History },
  { href: "/status", label: "Status", icon: Activity },
] as const;

function TopPill() {
  return (
    // <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1.5 text-xs text-muted-foreground shadow-[0_10px_30px_-22px_rgba(10,20,40,0.3)] backdrop-blur">
    <div>  
    {/* <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_0_4px_hsl(var(--accent)/0.18)]" />
      Clean minimal workflow tooling
      <span className="text-foreground/40">•</span>
      <span className="font-medium text-foreground">Lite</span> */}
      <img src="./text-logo.png" alt="logo" height={100} width={200} className="rounded-xl"/>
    </div>
  );
}

export default function AppShell({
  children,
  title,
  subtitle,
  actions,
  breadcrumb,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumb?: Array<{ label: string; href?: string }>;
}) {
  const [location] = useLocation();

  const crumb = useMemo(() => {
    if (!breadcrumb || breadcrumb.length === 0) return null;
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {breadcrumb.map((c, idx) => (
          <div key={`${c.label}-${idx}`} className="flex items-center gap-2">
            {c.href ? (
              <Link
                href={c.href}
                className="rounded-md px-1.5 py-1 hover:bg-muted/60 hover:text-foreground transition-colors"
              >
                {c.label}
              </Link>
            ) : (
              <span className="px-1.5 py-1">{c.label}</span>
            )}
            {idx !== breadcrumb.length - 1 ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : null}
          </div>
        ))}
      </div>
    );
  }, [breadcrumb]);

  return (
    <div className="page-shell grain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <header className="animate-float-in">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <TopPill />
              <div className="mt-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {crumb}
                  <h1
                    className="mt-2 text-3xl sm:text-4xl leading-[1.08] tracking-tight"
                    data-testid="page-title"
                  >
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted-foreground">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>

          <div className="mt-6 rounded-2xl glass shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between gap-3 p-2 sm:p-3">
              <nav className="flex items-center gap-1 overflow-x-auto">
                {nav.map((item) => {
                  const Icon = item.icon;
                  const active = location === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-testid={`nav-${item.label.toLowerCase()}`}
                      className={cn(
                        "group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                        "hover:bg-muted/60 hover:text-foreground",
                        active
                          ? "bg-foreground text-background shadow-sm"
                          : "text-muted-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          "group-hover:-rotate-6",
                          active ? "text-background" : "text-muted-foreground",
                        )}
                      />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden md:flex items-center gap-2">
                <Separator orientation="vertical" className="h-8" />
                <Button
                  variant="secondary"
                  className="rounded-xl"
                  onClick={() => {
                    const el = document.documentElement;
                    el.classList.toggle("dark");
                  }}
                  data-testid="toggle-theme"
                >
                  Toggle theme
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="mt-8 animate-float-in">{children}</main>

        <footer className="mt-14 pb-10 text-xs text-muted-foreground">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>
              FlowSpark - Workflow Builder — crafted for clarity, speed, and focus by Rahil.
              <a href="https://github.com/rahil1801" target="_blank"> GitHub Profile</a>
            </span>
            <button
              type="button"
              className="text-left sm:text-right hover:text-foreground transition-colors"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              data-testid="back-to-top"
            >
              Back to top
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
