"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, TrendingUp, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Resumen de tus finanzas" },
  "/transactions": { title: "Movimientos", subtitle: "Historial de transacciones" },
  "/budgets": { title: "Presupuestos", subtitle: "Control de gastos mensuales" },
  "/import": { title: "Importar", subtitle: "Cargar transacciones desde CSV" },
  "/settings": { title: "Ajustes", subtitle: "Configuracion de tu cuenta" },
};

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;

  const currentPage = pageTitles[pathname] || { title: "Finanzas", subtitle: "" };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between h-20 px-4 md:px-8">
        {/* Mobile Logo */}
        <div className="flex items-center gap-3 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl stat-icon-primary">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Finanzas</span>
          </Link>
        </div>

        {/* Page Title & Search - Desktop */}
        <div className="hidden md:flex items-center gap-8 flex-1">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {currentPage.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentPage.subtitle}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full h-12 pl-11 pr-4 text-sm bg-secondary/60 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder:text-muted-foreground/50 transition-all duration-300"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative w-12 h-12 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border/50 transition-all duration-300"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#05cd99] rounded-full ring-2 ring-background" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-12 rounded-2xl px-2 gap-3 bg-secondary/60 hover:bg-secondary border border-border/50 transition-all duration-300"
              >
                <Avatar className="w-8 h-8 ring-2 ring-primary/20">
                  <AvatarImage
                    src={user?.image || undefined}
                    alt={user?.name || "Usuario"}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-[#4318ff] to-[#7551ff] text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-semibold text-foreground">
                    {user?.name || "Usuario"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Admin
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-3 shadow-xl border-border/50">
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl mb-2">
                <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                  <AvatarImage
                    src={user?.image || undefined}
                    alt={user?.name || "Usuario"}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-[#4318ff] to-[#7551ff] text-white font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  {user?.name && (
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                  )}
                  {user?.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer h-11 px-3">
                <Link href="/settings" className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium">Configuracion</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
