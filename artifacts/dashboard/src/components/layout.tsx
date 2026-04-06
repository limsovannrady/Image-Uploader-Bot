import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Activity, LayoutDashboard, Terminal, Settings } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navbar */}
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur flex items-center px-6 sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2 text-primary font-mono font-bold tracking-tight">
          <Terminal className="w-5 h-5" />
          <span>TG_MEDIA_BOT_CTRL</span>
        </div>
        <div className="ml-auto flex items-center gap-4 text-sm font-mono">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            SYSTEM_ONLINE
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card/30 flex flex-col shrink-0">
          <nav className="p-4 flex flex-col gap-2">
            <div className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">
              Navigation
            </div>
            <Link
              href="/"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location === "/"
                  ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/activity"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location === "/activity"
                  ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Activity className="w-4 h-4" />
              Activity Logs
            </Link>
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location === "/settings"
                  ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Settings className="w-4 h-4" />
              Configuration
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-background/50">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
