"use client";

import { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar, SidebarItem } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
}

export function DashboardLayout({
  children,
  sidebarItems,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 xl:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        items={sidebarItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="xl:pl-64 transition-all duration-300">
        <div className="p-4 xl:p-8">{children}</div>
      </main>
    </div>
  );
}
