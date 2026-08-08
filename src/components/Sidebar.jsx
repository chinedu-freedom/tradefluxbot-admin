"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home,
  ArrowRight,
  Play,
  ClipboardCheck,
  CalendarCheck,
  Loader,
  Newspaper,
  Building,
  Activity,
  LogOut,
  ChevronDown,
  ChevronUp,
  TrendingUp
} from "lucide-react";
import { CookieManager } from "@/utils/cookie-utils";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { type: "divider", name: "APPS" },
  { name: "Packages", href: "/packages", icon: ArrowRight },
  { 
    name: "Gift Bonus", 
    icon: Play,
    children: [
      { name: "Bonus", href: "/gift-bonus/bonus" },
      { name: "Uses List", href: "/gift-bonus/uses-list" }
    ]
  },
  { name: "Tasks", href: "/tasks", icon: ClipboardCheck },
  { name: "Daily Check-In", href: "/daily-check-in", icon: CalendarCheck },
  { name: "Spin Wheel", href: "/spin-wheel", icon: Loader },
  { name: "News", href: "/news", icon: Newspaper },
  { name: "Partners", href: "/partners", icon: Building },
  { name: "Live Market", href: "/live-market", icon: TrendingUp }, 
  { name: "Customers", href: "/customers", icon: ArrowRight },
  { name: "Activity Monitor", href: "/activity-monitor", icon: Activity },
  // { name: "Purchase Record", href: "/purchase-record", icon: ArrowRight },
  {
    name: "Recharge Payments",
    icon: Play,
    children: [
      { name: "Pending", href: "/recharge/pending" },
      { name: "Approved", href: "/recharge/approved" },
      { name: "Rejected", href: "/recharge/rejected" }
    ]
  },
  {
    name: "Withdrawal Payments",
    icon: Play,
    children: [
      { name: "Pending", href: "/withdrawals/pending" },
      { name: "Approved", href: "/withdrawals/approved" },
      { name: "Rejected", href: "/withdrawals/rejected" }
    ]
  },
  { name: "Slider Images", href: "/slider-images", icon: ArrowRight },
  {
    name: "Settings",
    icon: Play,
    children: [
      { name: "Profile", href: "/settings/profile" },
      { name: "Basic", href: "/settings/basic" },
      { name: "Email Settings", href: "/settings/email" },
      { name: "Countries & Rates", href: "/settings/countries" },
      { name: "Languages", href: "/settings/languages" },
      { name: "About Us", href: "/settings/about" },
      { name: "Commission", href: "/settings/commission" },

      { name: "Payout Cryptos", href: "/settings/payout-cryptos" },
      { name: "Verification Password", href: "/settings/security" },
    ]
  }
];

export function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (name) => {
    setOpenMenu(prev => (prev === name ? "" : name));
  };

  const isActive = (href) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isChildActive = (children) => {
    return children?.some(child => isActive(child.href));
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 flex h-full w-[260px] flex-col bg-[#F9FAFB] shadow-[0_0_15px_0_rgba(0,0,0,0.05)] font-['Rubik',sans-serif] transition-transform duration-300 ease-in-out`}>
        <div className="flex h-[80px] items-center px-6 mt-2">
          <Link href="/ktdevpro/dashboard" className="flex items-center gap-3 w-full" onClick={handleLinkClick}>
            <span className="text-[1.8rem] font-medium text-[#475f7b] tracking-wide">Dashboard</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="space-y-1">
            {navigation.map((item, index) => {
              if (item.type === "divider") {
                return (
                  <div key={index} className="px-6 pt-6 pb-2">
                    <span className="text-xs font-bold text-[#b4b7bd] tracking-wider uppercase">{item.name}</span>
                  </div>
                );
              }

              const active = isActive(item.href) || isChildActive(item.children);
              const isMenuOpen = openMenu !== null ? openMenu === item.name : isChildActive(item.children);

              if (item.children) {
                return (
                  <div key={item.name} className={`px-3 mb-1 transition-all ${isMenuOpen ? 'py-1' : ''}`}>
                    <div className={`rounded-[6px] overflow-hidden transition-all duration-200 ${isMenuOpen ? 'bg-white border border-gray-100 shadow-sm' : ''}`}>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`w-full flex items-center justify-between px-3 py-[12px] transition-all duration-200 group ${
                          !isMenuOpen && active ? "bg-blue-50 rounded-[4px]" : !isMenuOpen ? "hover:bg-slate-50 hover:pl-4 rounded-[4px]" : "border-b border-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {item.icon && <item.icon className={`w-[22px] h-[22px] ${(active || isMenuOpen) ? "text-blue-600" : "text-[#475f7b] group-hover:text-blue-600 transition-colors"}`} />}
                          <span className={`text-[15px] ${(!isMenuOpen && active) ? "text-blue-600 font-medium" : "text-[#475f7b]"}`}>{item.name}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-[#828d99] transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isMenuOpen && (
                        <div className="py-2 space-y-1 bg-white">
                          {item.children.map((child) => {
                            const childActive = isActive(child.href);
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                onClick={handleLinkClick}
                                className={`flex items-center gap-4 pl-[20px] pr-3 py-[8px] transition-all duration-200 group ${
                                  childActive ? "text-blue-600 font-medium" : "text-[#475f7b] hover:text-blue-600"
                                }`}
                              >
                                <ArrowRight className={`w-[18px] h-[18px] ml-1 ${childActive ? "text-blue-600" : "text-[#1a233a] group-hover:text-blue-600"}`} />
                                <span className="text-[15px]">{child.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.name} className="px-3 mb-1">
                  <Link
                    href={item.href || "#"}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-4 px-3 py-[12px] rounded-[4px] transition-all duration-200 group ${
                      active ? "bg-blue-50 text-blue-600 font-medium" : "text-[#475f7b] hover:bg-slate-50 hover:pl-4"
                    }`}
                  >
                    {item.icon ? (
                      <item.icon className={`w-[22px] h-[22px] ${active ? "text-blue-600" : "text-[#475f7b] group-hover:text-blue-600 transition-colors"}`} />
                    ) : (
                      <div className="w-[22px] h-[22px]" /> // Placeholder for items without icon
                    )}
                    <span className={`text-[15px] ${active ? "text-blue-600" : "text-[#475f7b]"}`}>{item.name}</span>
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => {
              CookieManager.remove("sec-admin-token");
              localStorage.removeItem("adminToken");
              localStorage.removeItem("adminUser");
              window.location.href = "/";
            }}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-[4px] text-[#475f7b] hover:bg-red-50 hover:text-red-500 transition-all group"
          >
            <LogOut className="w-[22px] h-[22px] group-hover:text-red-500 transition-colors" />
            <span className="font-medium text-[15px]">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
