"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Search, CheckCircle2, XCircle, Clock, Loader2, Copy } from "lucide-react";
import { useFetchData } from "@/hooks/useApi";
import { format } from "date-fns";
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const mockWithdrawals = [
  { id: "WTH-2091", user: "Sarah Miller", amount: "850.00", method: "USDT (TRC20)", address: "T9zX...4kP2", status: "PENDING", date: "Nov 02, 2025 10:15" },
  { id: "WTH-2092", user: "David Kim", amount: "3,400.00", method: "Bitcoin (BTC)", address: "bc1q...x89m", status: "COMPLETED", date: "Nov 01, 2025 16:40" },
  { id: "WTH-2093", user: "Alex Chen", amount: "12,000.00", method: "Ethereum (ETH)", address: "0x7A...9f1E", status: "REJECTED", date: "Oct 30, 2025 09:20" },
];

export default function WithdrawalsPage() {
  const { data: withdrawalsRes, isLoading, refetch } = useFetchData("/admin/transactions/withdrawals", ["withdrawals"]);
  const withdrawals = Array.isArray(withdrawalsRes) ? withdrawalsRes : withdrawalsRes?.data || [];

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
  const [confirmModal, setConfirmModal] = useState({ show: false, type: "", withdrawalId: null });

  const handleProcess = async () => {
    const { type, withdrawalId } = confirmModal;
    
    setConfirmModal(prev => ({ ...prev, show: false }));
    setIsProcessing(true);
    
    try {
      const token = document.cookie.split("; ").find(row => row.startsWith("sec-admin-token="))?.split("=")[1];
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/transactions/withdrawals/${withdrawalId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: type })
      });
      
      if (res.ok) {
        toast.success(`Withdrawal ${type.toLowerCase()} successfully`);
        refetch();
      } else {
        toast.error("Failed to update withdrawal status");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsProcessing(false);
      setConfirmModal({ show: false, type: "", withdrawalId: null });
    }
  };

  const safeFormatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch (e) {
      return dateString;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Wallet address copied!");
  };

  const displayData = withdrawals.length > 0 ? withdrawals.map(w => ({
    id: w.id,
    user_id: w.user_id,
    user: { full_name: w.user?.full_name || "Unknown" },
    amount: w.amount,
    method: w.withdrawal_method,
    address: w.wallet_address,
    status: w.status?.toUpperCase() || 'PENDING',
    date: safeFormatDate(w.created_at)
  })) : mockWithdrawals.map(m => ({
    ...m,
    user: { full_name: m.user },
    amount: m.amount.replace(/[^0-9.]/g, ''),
  }));

  const filteredWithdrawals = displayData.filter(d => {
    const matchesSearch = (d.id || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (d.user?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (d.address || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "ALL" || d.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#475f7b] mb-1">Withdrawals</h1>
          <p className="text-[#828d99] text-sm">Process and track user withdrawal requests.</p>
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
              placeholder="Search ID, User or Address..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-500/50 w-full sm:w-64 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 bg-white min-w-[1000px]">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
              <tr>
                <th className="px-6 py-4 font-semibold text-[13px]">Request ID</th>
                <th className="px-6 py-4 font-semibold text-[13px]">User</th>
                <th className="px-6 py-4 font-semibold text-[13px]">Amount</th>
                <th className="px-6 py-4 font-semibold text-[13px]">Destination</th>
                <th className="px-6 py-4 font-semibold text-[13px]">Status</th>
                <th className="px-6 py-4 font-semibold text-[13px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading && withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading withdrawals...
                  </td>
                </tr>
              ) : filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No withdrawals found matching "{searchTerm}"
                  </td>
                </tr>
              ) : filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">{(withdrawal.id || "").substring(0, 12)}...</span>
                      <span className="text-xs text-gray-400">{withdrawal.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">
                    <Link href={`/customers/${withdrawal.user_id}`} className="hover:text-blue-600 hover:underline transition-colors flex items-center gap-2.5">
                      <Avatar className="w-7 h-7 shrink-0 border border-gray-100 shadow-xs">
                        <AvatarImage src={withdrawal.user?.profile_image} alt={withdrawal.user?.full_name || "User"} className="object-cover" />
                        <AvatarFallback className="bg-[#0073b6] text-white text-[11px] font-bold">
                          {(withdrawal.user?.full_name || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{withdrawal.user.full_name}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-bold text-red-500">{symbol}{Number(withdrawal.amount).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-600 font-medium">{withdrawal.method}</span>
                      <div className="flex items-center gap-2 group">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded truncate max-w-[150px]" title={withdrawal.address}>
                          {withdrawal.address}
                        </span>
                        <button 
                          onClick={() => copyToClipboard(withdrawal.address)}
                          className="text-gray-400 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                          title="Copy address"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      withdrawal.status === 'APPROVED' || withdrawal.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                      withdrawal.status === 'REJECTED' || withdrawal.status === 'FAILED' ? 'bg-red-100 text-red-700 border border-red-200' : 
                      'bg-orange-100 text-orange-700 border border-orange-200'
                    }`}>
                      {(withdrawal.status === 'APPROVED' || withdrawal.status === 'COMPLETED') && <CheckCircle2 className="w-3 h-3" />}
                      {withdrawal.status === 'PENDING' && <Clock className="w-3 h-3" />}
                      {(withdrawal.status === 'REJECTED' || withdrawal.status === 'FAILED') && <XCircle className="w-3 h-3" />}
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {withdrawal.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setConfirmModal({ show: true, type: 'APPROVED', withdrawalId: withdrawal.id })} 
                          className="px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors border border-emerald-200"
                        >
                          Process
                        </button>
                        <button 
                          onClick={() => setConfirmModal({ show: true, type: 'REJECTED', withdrawalId: withdrawal.id })} 
                          className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors border border-red-200"
                        >
                          Deny
                        </button>
                      </div>
                    ) : (
                      <button className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                        View Receipt
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
              Are you sure you want to {confirmModal.type === 'APPROVED' ? 'approve' : 'reject'} this withdrawal?
              {confirmModal.type === 'REJECTED' && " This will refund the amount to the user's balance."}
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
              disabled={isProcessing}
              className={confirmModal.type === "REJECTED" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
