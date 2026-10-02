"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Search, CheckCircle2, XCircle, Clock, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { useFetchData } from "@/hooks/useApi";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const mockDeposits = [
  { id: "DEP-8492", user: "Alex Chen", amount: "$5,000.00", method: "Bitcoin (BTC)", status: "Completed", date: "Nov 02, 2025 14:30" },
  { id: "DEP-8493", user: "Sarah Miller", amount: "$1,200.00", method: "Ethereum (ETH)", status: "Pending", date: "Nov 02, 2025 15:45" },
  { id: "DEP-8494", user: "James Wilson", amount: "$10,000.00", method: "USDT (TRC20)", status: "Completed", date: "Nov 01, 2025 09:15" },
  { id: "DEP-8495", user: "Elena Rodriguez", amount: "$500.00", method: "Bitcoin (BTC)", status: "Failed", date: "Oct 31, 2025 18:20" },
];

export default function DepositsPage() {
  const { data: depositsRes, isLoading, refetch } = useFetchData("/admin/transactions/deposits", ["deposits"]);
  const deposits = Array.isArray(depositsRes) ? depositsRes : depositsRes?.data || [];
  
  let symbol = "$";
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("admin-platform-settings-symbol");
      if (cached) symbol = cached;
    } catch (e) {}
  }
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, type: "", depositId: null });

  const handleProcess = async () => {
    const { type, depositId } = confirmModal;
    
    // Close dialog immediately
    setConfirmModal(prev => ({ ...prev, show: false }));
    setIsProcessing(true);
    
    try {
      const token = document.cookie.split("; ").find(row => row.startsWith("sec-admin-token="))?.split("=")[1];
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/transactions/deposits/${depositId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: type }) // 'APPROVED' or 'REJECTED'
      });
      
      const data = await res.json();
      if (res.ok) {
        // toast call removed per user
        refetch();
      } else {
        // toast call removed per user
      }
    } catch (error) {
      // toast call removed per user
    } finally {
      setIsProcessing(false);
      setConfirmModal({ show: false, type: "", depositId: null });
    }
  };

  const safeFormatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch (e) {
      return dateString;
    }
  };

  const displayData = deposits.length > 0 ? deposits : mockDeposits.map(m => ({
    id: m.id,
    user_id: m.id,
    user: { full_name: m.user },
    amount: m.amount.replace(/[^0-9.]/g, ''),
    cryptocurrency: m.method,
    status: m.status === 'Completed' ? 'APPROVED' : (m.status === 'Failed' ? 'REJECTED' : 'PENDING'),
    created_at: m.date
  }));

  const filteredDeposits = displayData.filter(d => {
    const matchesSearch = (d.id || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (d.user?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "ALL" || d.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#475f7b] mb-1">Deposits</h1>
          <p className="text-[#828d99] text-sm">Monitor and approve user deposits.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex bg-gray-100 border border-gray-200 rounded-xl p-1">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search TXN ID or User..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-500/50 w-full sm:w-64 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 bg-white">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
              <tr>
                <th className="px-6 py-4 font-semibold text-[13px]">Transaction ID</th>
                <th className="px-6 py-4 font-semibold text-[13px]">User</th>
                <th className="px-6 py-4 font-semibold text-[13px]">Amount</th>
                <th className="px-6 py-4 font-semibold text-[13px]">Method</th>
                <th className="px-6 py-4 font-semibold text-[13px]">Status</th>
                <th className="px-6 py-4 font-semibold text-[13px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading && deposits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading deposits...
                  </td>
                </tr>
              ) : filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No deposits found matching "{searchTerm}"
                  </td>
                </tr>
              ) : filteredDeposits.map((deposit) => (
                <tr key={deposit.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">{(deposit.id || "").substring(0, 12)}...</span>
                      <span className="text-xs text-gray-400">{safeFormatDate(deposit.created_at)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">
                    <Link href={`/customers/${deposit.user_id}`} className="hover:text-blue-600 hover:underline transition-colors flex items-center gap-2.5">
                      <Avatar className="w-7 h-7 shrink-0 border border-gray-100 shadow-xs">
                        <AvatarImage src={deposit.user?.profile_image} alt={deposit.user?.full_name || "User"} className="object-cover" />
                        <AvatarFallback className="bg-[#0073b6] text-white text-[11px] font-bold">
                          {(deposit.user?.full_name || deposit.user?.email || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{deposit.user?.full_name || "Unknown"}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{symbol}{Number(deposit.amount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-500">{deposit.cryptocurrency || deposit.payment_method?.method_name || "Crypto"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      deposit.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                      deposit.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' : 
                      'bg-orange-100 text-orange-700 border border-orange-200'
                    }`}>
                      {deposit.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                      {deposit.status === 'PENDING' && <Clock className="w-3 h-3" />}
                      {deposit.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                      {deposit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {deposit.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setConfirmModal({ show: true, type: 'APPROVED', depositId: deposit.id })} className="px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors border border-emerald-200">
                          Approve
                        </button>
                        <button onClick={() => setConfirmModal({ show: true, type: 'REJECTED', depositId: deposit.id })} className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors border border-red-200">
                          Reject
                        </button>
                      </div>
                    ) : (
                      <button className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={confirmModal.show} onOpenChange={(open) => setConfirmModal(prev => ({ ...prev, show: open }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm {confirmModal.type === 'APPROVED' ? 'Approval' : 'Rejection'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmModal.type === 'APPROVED' ? 'approve' : 'reject'} this deposit?
              {confirmModal.type === 'APPROVED' && " This will automatically credit the user's account balance."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleProcess}
              className={confirmModal.type === "REJECTED" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
