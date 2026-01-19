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

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 bg-background">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        {/* Mobile Logo */}
        <div className="flex items-center gap-3 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Finanzas</span>
          </Link>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar transacciones..."
              className="w-full h-10 pl-10 pr-4 text-sm bg-secondary/50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60 transition-all"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative w-10 h-10 rounded-xl hover:bg-secondary/80"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative w-10 h-10 rounded-xl p-0 hover:bg-secondary/80"
              >
                <Avatar className="w-9 h-9 ring-2 ring-primary/20">
                  <AvatarImage
                    src={user?.image || undefined}
                    alt={user?.name || "Usuario"}
                  />
                  <AvatarFallback className="bg-primary text-white text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
              <div className="flex items-center gap-3 p-2">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={user?.image || undefined}
                    alt={user?.name || "Usuario"}
                  />
                  <AvatarFallback className="bg-primary text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  {user?.name && (
                    <p className="font-semibold text-sm">{user.name}</p>
                  )}
                  {user?.email && (
                    <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link href="/settings">
                  <User className="w-4 h-4 mr-2" />
                  Configuración
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
