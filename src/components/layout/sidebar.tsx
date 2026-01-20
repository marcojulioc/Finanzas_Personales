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
  ChevronRight,
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
    <aside className="hidden w-[280px] bg-sidebar md:flex md:flex-col glass-dark">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl stat-icon-primary">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">Finanzas</span>
            <p className="text-[11px] text-sidebar-foreground/60 font-medium">Panel de Control</p>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="px-5 mb-3 mt-4">
          <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Principal
          </span>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-[#4318ff] to-[#7551ff] text-white shadow-lg shadow-primary/30"
                    : "text-sidebar-foreground hover:text-white hover:bg-sidebar-accent"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-white/20" 
                    : "bg-sidebar-accent group-hover:bg-white/10"
                )}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 opacity-70" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Settings Section */}
        <div className="px-5 mb-3 mt-6">
          <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
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
                  "group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-r from-[#4318ff] to-[#7551ff] text-white shadow-lg shadow-primary/30"
                    : "text-sidebar-foreground hover:text-white hover:bg-sidebar-accent"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-white/20" 
                    : "bg-sidebar-accent group-hover:bg-white/10"
                )}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 opacity-70" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-8 mt-auto">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sidebar-accent to-transparent border border-sidebar-border">
            <p className="text-xs text-sidebar-foreground/70 mb-3">
              Sesion activa
            </p>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg shadow-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesion
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
