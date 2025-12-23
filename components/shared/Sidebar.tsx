"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ items, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-lg transition-all duration-300 ease-in-out z-50",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "xl:translate-x-0 xl:shadow-none"
      )}
    >
      <nav className="flex flex-col gap-2 p-4 h-full overflow-y-auto">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                // Close sidebar on mobile after navigation
                if (onClose && window.innerWidth < 768) {
                  onClose();
                }
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-lg scale-[1.02]"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] hover:shadow-sm"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
