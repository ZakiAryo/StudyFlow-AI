"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Mata Kuliah", icon: BookOpen },
  { href: "/tasks", label: "Tugas", icon: GraduationCap },
  { href: "/schedule", label: "Jadwal", icon: CalendarDays },
  { href: "/ai/priority", label: "AI Priority", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  const content = (
    <aside className="flex h-full w-72 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <Image
          src="/logo.png"
          alt="Logo StudyFlow AI"
          width={60}
          height={60}
          className="h-11 w-11 shrink-0 object-contain"
          priority
        />
        <div className="min-w-0">
          <p className="truncate font-semibold">StudyFlow AI</p>
          <p className="text-xs text-muted-foreground">Academic workspace</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                active && "bg-muted text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-md bg-background p-3">
          <p className="text-sm font-medium">Akun aktif</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Data pribadi akan dibatasi oleh Supabase Auth dan RLS.
          </p>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden min-h-screen lg:fixed lg:inset-y-0 lg:flex">
        {content}
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Tutup sidebar"
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <div className="relative h-full w-72 max-w-[85vw]">
            <button
              aria-label="Tutup menu"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-md border bg-card"
            >
              <X className="h-4 w-4" />
            </button>
            {content}
          </div>
        </div>
      ) : null}
    </>
  );
}
