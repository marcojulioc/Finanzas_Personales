"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Settings,
  Upload,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/budgets", label: "Presupuestos", icon: PiggyBank },
  { href: "/import", label: "Importar", icon: Upload },
];

const settingsNavItems = [
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 bg-sidebar md:flex md:flex-col">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Finanzas</span>
        </div>

        {/* Main Navigation */}
        <div className="px-4 mb-2">
          <span className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Principal
          </span>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Settings Section */}
        <div className="px-4 mb-2">
          <span className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Preferencias
          </span>
        </div>
        <nav className="px-4 space-y-1 mb-4">
          {settingsNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-6 mt-auto">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
}
