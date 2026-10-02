"use client";

import { Bell, Search, Menu } from "lucide-react";
import * as Avatar from "@radix-ui/react-avatar";
import { useFetchData } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";

export function Header({ onMenuClick }) {
  const { data, isLoading } = useFetchData("/admin/profile", "profile");
  const { data: settingsData } = useFetchData("/settings", "platform-settings");
  
  const admin = data?.success && data?.data ? data.data : null;
  const siteLogo = settingsData?.settings?.platform_logo || "/logo.jpeg";

  const displayName = admin?.username || (admin?.email ? admin.email.split("@")[0] : "tradefluxbot");
  const avatarLetter = (admin?.username ? admin.username[0] : (admin?.email ? admin.email[0] : "T")).toUpperCase();

  return (
    <header className="h-[60px] flex items-center justify-between px-6 bg-white/95 backdrop-blur-md border-b border-gray-150 sticky top-0 z-20 font-sans">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-[#475f7b] hover:text-blue-600 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 cursor-pointer">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </>
          ) : (
            <>
              <div className="flex flex-col items-end">
                <span className="text-[14px] font-semibold text-[#475f7b] capitalize">{displayName}</span>
              </div>
              <Avatar.Root className={`inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full shadow-sm ${(!siteLogo && !admin?.image) ? 'bg-blue-600' : 'bg-transparent'}`}>
                {admin?.image ? (
                  <Avatar.Image src={admin.image} className="h-full w-full object-cover" />
                ) : siteLogo ? (
                  <Avatar.Image src={siteLogo} className="h-full w-full object-cover" />
                ) : (
                  <Avatar.Fallback className="text-xl font-bold text-white leading-1 font-sans">
                    {avatarLetter}
                  </Avatar.Fallback>
                )}
              </Avatar.Root>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
