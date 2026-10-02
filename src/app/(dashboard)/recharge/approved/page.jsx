"use client"

import { useState } from "react"
import { Search, CreditCard, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useFetchData } from "@/hooks/useApi"
import { format } from "date-fns"

export default function ApprovedRechargePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: depositsRes, isLoading } = useFetchData("/admin/transactions/deposits", ["deposits"]);
  const deposits = Array.isArray(depositsRes) ? depositsRes : depositsRes?.data || [];

  let symbol = "$";
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("admin-platform-settings-symbol");
      if (cached) symbol = cached;
    } catch (e) {}
  }
  
  const safeFormatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd-MM-yyyy HH:mm:ss");
    } catch (e) {
      return dateString;
    }
  };

  const approvedDeposits = deposits.filter(d => d.status === 'APPROVED');

  const displayData = approvedDeposits.map((d, index) => ({
    id: d.id,
    sn: index + 1,
    userInfo: {
      name: d.user?.full_name || "Unknown",
      username: d.user?.email || "Unknown",
      refId: (d.user_id || "").substring(0, 6).toUpperCase() || "N/A",
      profile_image: d.user?.profile_image
    },
    paymentInfo: {
      paymentNumber: d.id,
      transactionId: d.id,
      date: safeFormatDate(d.created_at)
    },
    amounts: {
      paymentAmount: Number(d.amount) || 0,
      finalAmount: Number(d.amount) || 0
    },
    operation: {
      status: d.status,
      type: "AUTO",
      methodName: d.cryptocurrency || d.payment_method?.name || "Crypto",
      gateway: "manual"
    }
  }));

  const filteredData = displayData.filter((item) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      item.userInfo.name.toLowerCase().includes(searchLower) ||
      item.userInfo.username.toLowerCase().includes(searchLower) ||
      item.paymentInfo.paymentNumber.toLowerCase().includes(searchLower) ||
      item.paymentInfo.transactionId.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full mb-6 gap-4">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-[#0073b6]" />
          <h1 className="text-2xl font-bold text-gray-800">Approved Payment Lists</h1>
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
                  placeholder="Search by name, username, payment number or transaction id..."
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
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4">PAYMENT INFO</TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4">PAYMENT AMOUNTS</TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4">PAYMENT OPERATION</TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4 pr-6">ACTIVE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="">
                {isLoading ? (
                  <TableRow className="">
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500 bg-gray-50/30">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading approved deposits...
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
                            <div className="text-[13px] text-gray-700">
                              Ref_id: <span className="font-medium">{item.userInfo.refId}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* PAYMENT INFO */}
                      <TableCell className="py-4">
                        <div className="flex flex-col space-y-1.5">
                          <div className="text-[13px] text-gray-700">
                            Payment Number: <br />
                            <span className="font-bold text-gray-900">{item.paymentInfo.paymentNumber}</span>
                          </div>
                          <div className="text-[13px] text-gray-700">
                            Transaction ID: <span className="font-bold text-gray-900">{item.paymentInfo.transactionId}</span>
                          </div>
                          <div className="text-[13px] text-gray-700">
                            Date : <span className="font-medium">{item.paymentInfo.date}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* PAYMENT AMOUNTS */}
                      <TableCell className="py-4">
                        <div className="flex flex-col space-y-1.5">
                          <div className="text-[13px] text-gray-700">
                            Payment Amount: <span className="font-medium">{symbol}{item.amounts.paymentAmount.toFixed(2)}</span>
                          </div>
                          <div className="text-[13px] text-gray-700">
                            Final Amount: <span className="font-bold text-gray-900">{symbol}{item.amounts.finalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-2 text-[13px] text-gray-700">
                            Status: 
                            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-bold bg-blue-600 text-white">
                              {item.operation.status}
                            </span>
                          </div>
                          <div className="text-[13px] text-gray-700">
                            Method Name: <span className="font-medium">{item.operation.methodName}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* ACTIVE */}
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
