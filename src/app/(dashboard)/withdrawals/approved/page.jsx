"use client"

import { useState } from "react"
import { Search, ArrowDownToLine, Loader2, Copy, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useFetchData } from "@/hooks/useApi"
import { format } from "date-fns"
import { toast } from "sonner"

export default function ApprovedWithdrawPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: withdrawalsRes, isLoading } = useFetchData("/admin/transactions/withdrawals", ["withdrawals"]);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, address) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    toast.success("Wallet address copied!");
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };
  
  let symbol = "$";
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("admin-platform-settings-symbol");
      if (cached) symbol = cached;
    } catch (e) {}
  }

  const withdrawals = Array.isArray(withdrawalsRes) ? withdrawalsRes : withdrawalsRes?.data || [];
  
  const safeFormatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd-MM-yyyy HH:mm:ss");
    } catch (e) {
      return dateString;
    }
  };

  const approvedWithdrawals = withdrawals.filter(w => w.status === 'APPROVED');

  const displayData = approvedWithdrawals.map((w, index) => ({
    id: w.id,
    sn: index + 1,
    userInfo: {
      name: w.user?.full_name || "Unknown",
      username: w.user?.email || "Unknown",
      profile_image: w.user?.profile_image
    },
    withdrawInfo: {
      method: w.network || w.withdrawal_method || "Crypto",
      transactionId: w.id,
      date: safeFormatDate(w.created_at),
      walletAddress: w.wallet_address || ""
    },
    amountDetails: {
      amount: Number(w.amount) || 0,
      charge: Number(w.fees) || 0,
      payable: Number(w.net_amount) || Number(w.amount) || 0
    },
    status: w.status
  }));

  const filteredData = displayData.filter((item) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      item.userInfo?.name?.toLowerCase().includes(searchLower) ||
      item.userInfo?.username?.toLowerCase().includes(searchLower) ||
      item.withdrawInfo?.transactionId?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full mb-6 gap-4">
        <div className="flex items-center gap-3">
          <ArrowDownToLine className="w-6 h-6 text-[#0073b6]" />
          <h1 className="text-2xl font-bold text-gray-800">Approved Withdraw Lists</h1>
        </div>
      </div>

      {/* Filters Container */}
      <Card className="border-none shadow-sm bg-white rounded-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex items-center gap-4 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                <Input
                  placeholder="Search by name, username or transaction id..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white border-gray-200 h-10 w-full"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="border-none shadow-sm bg-white rounded-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px] whitespace-nowrap">
              <TableHeader className="bg-gray-50/50 border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[60px] font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4 pl-6">S.N</TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4">USER INFO</TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4">WITHDRAW INFO</TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4">AMOUNT DETAILS</TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4">STATUS</TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4 pr-6">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="">
                {isLoading ? (
                  <TableRow className="">
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500 bg-gray-50/30">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading approved withdrawals...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 border-b last:border-0 align-top">
                      <TableCell className="font-medium text-gray-700 text-[13px] py-4 pl-6">
                        {item.sn}
                      </TableCell>
                      
                      {/* USER INFO */}
                      <TableCell className="py-4">
                        <div className="flex items-start gap-2.5">
                          <Avatar className="w-8 h-8 shrink-0 mt-0.5 border border-gray-100 shadow-xs">
                            <AvatarImage src={item.userInfo.profile_image} alt={item.userInfo.name} className="object-cover" />
                            <AvatarFallback className="bg-[#0073b6] text-white text-[11px] font-bold">
                              {(item.userInfo.name || item.userInfo.username || "U").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col space-y-1">
                            <div className="text-[13px] text-gray-700">
                              Name: <span className="font-medium">{item.userInfo.name}</span>
                            </div>
                            <div className="text-[13px] text-gray-700">
                              Username: <span className="font-medium">{item.userInfo.username}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* WITHDRAW INFO */}
                      <TableCell className="py-4">
                        <div className="flex flex-col space-y-1.5">
                          <div className="text-[13px] text-gray-700">
                            Method: <span className="font-medium">{item.withdrawInfo.method}</span>
                          </div>
                          {item.withdrawInfo.walletAddress && (
                            <div className="text-[13px] text-gray-700 flex items-center gap-1.5">
                              Address: 
                              <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded text-[12px] text-gray-800 break-all select-all font-semibold">
                                {item.withdrawInfo.walletAddress}
                              </span>
                              <button
                                onClick={() => handleCopy(item.id, item.withdrawInfo.walletAddress)}
                                className="text-gray-400 hover:text-blue-600 transition-colors p-0.5 inline-flex items-center cursor-pointer"
                                title="Copy Address"
                              >
                                {copiedId === item.id ? (
                                  <Check size={13} className="text-green-500" />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                            </div>
                          )}
                          <div className="text-[13px] text-gray-700">
                            Transaction ID: <span className="font-bold text-gray-900">{item.withdrawInfo.transactionId}</span>
                          </div>
                          <div className="text-[13px] text-gray-700">
                            Date: <span className="font-medium">{item.withdrawInfo.date}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* AMOUNT DETAILS */}
                      <TableCell className="py-4">
                        <div className="flex flex-col space-y-1.5">
                          <div className="text-[13px] text-gray-700">
                            Amount: <span className="font-medium">{symbol}{item.amountDetails.amount.toFixed(2)}</span>
                          </div>
                          <div className="text-[13px] text-gray-700">
                            Charge: <span className="text-red-500">{symbol}{item.amountDetails.charge.toFixed(2)}</span>
                          </div>
                          <div className="text-[13px] text-gray-700">
                            Payable: <span className="font-bold text-gray-900">{symbol}{item.amountDetails.payable.toFixed(2)}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* STATUS */}
                      <TableCell className="py-4">
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-bold bg-blue-600 text-white">
                          APPROVED
                        </span>
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell className="py-4 pr-6 align-middle">
                        <div className="text-[#00CFDD] font-medium text-[14px]">
                          Already<br />processed
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="">
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500 bg-gray-50/30">
                      No data available in table
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
