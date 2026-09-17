import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Mail,
  MessageSquareQuote,
  Palette,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/widget";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { to: "/layouts", label: "Layouts", icon: LayoutGrid },
  { to: "/forms", label: "Forms", icon: ClipboardList },
  { to: "/campaigns", label: "Campaigns", icon: Mail },
  { to: "/brand", label: "Brand", icon: Palette },
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName =
    profile?.name || (user?.user_metadata?.['name'] as string) || user?.email?.split("@")[0] || "There";

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to + "/");

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-2 border-r bg-sidebar px-4 py-5">
      <div className="px-2">
        <Logo />
      </div>
      <nav className="mt-6 flex flex-col gap-1">
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item.to)
                ? "bg-primary-soft text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-2 border-t pt-4">
        <div className="flex items-center gap-3 px-2">
          <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-soft text-xs font-semibold text-primary">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="size-full object-cover" />
            ) : (
              initials(displayName)
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            className="flex-1 justify-start text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" /> Logout
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b bg-background/85 px-5 backdrop-blur-xl lg:hidden">
            <Logo />
            <button
              className="grid size-10 place-items-center rounded-lg border"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-4" />
            </button>
          </header>

          <main className="px-5 py-6 sm:px-8 sm:py-8">{children}</main>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-sidebar">
            <button
              className="absolute right-3 top-4 grid size-9 place-items-center rounded-lg border"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X className="size-4" />
            </button>
            {sidebar}
          </div>
        </div>
      )}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface-card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
        <Icon className="size-6" />
      </span>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
