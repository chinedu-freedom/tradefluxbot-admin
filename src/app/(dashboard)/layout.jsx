"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useFetchData } from "@/hooks/useApi";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: settingsData } = useFetchData("/admin/settings/platform", ["admin-platform-settings"]);

  useEffect(() => {
    if (settingsData?.currency_symbol) {
      localStorage.setItem("admin-platform-settings-symbol", settingsData.currency_symbol);
      // Trigger a storage/render update for any components listening
      window.dispatchEvent(new Event("storage"));
    }
  }, [settingsData]);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#F2F4F4] font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
