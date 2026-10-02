"use client"

import { useState } from "react"
import { Search, ClipboardList, Gift } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useFetchData } from "@/hooks/useApi"
import { format } from "date-fns"

export default function BonusUsesListPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data: claimsData, isLoading } = useFetchData("/admin/rewards/gift-code-claims", ["admin-gift-claims"])

  const usesData = Array.isArray(claimsData) ? claimsData : []

  const filteredData = usesData.filter((item) => {
    const matchesSearch = 
      (item.user?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.gift_code?.code || "").toLowerCase().includes(searchTerm.toLowerCase())
    
    // Gift code claims are successful once they are created
    const itemStatus = "successful"
    const matchesStatus = statusFilter === "all" || itemStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full mb-6 gap-4">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-[#0073b6]" />
          <h1 className="text-2xl font-bold text-gray-800">Bonus Uses List</h1>
        </div>
      </div>
      {/* Filters Container */}
      <Card className="border-none shadow-sm bg-white rounded-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                <Input
                  placeholder="Search by customer name, email or gift code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white border-gray-200 h-10 w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-52 bg-white border-gray-200 h-10">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="successful">Successful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="border-none shadow-sm bg-white rounded-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50 border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[80px] font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4 pl-6">
                    S.N
                  </TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4">
                    DATE
                  </TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4">
                    CUSTOMER INFO
                  </TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4">
                    BONUS INFO
                  </TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4 pr-6">
                    STATUS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500 bg-gray-50/30">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></span>
                        <span>Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 border-b last:border-0">
                      <TableCell className="font-medium text-gray-700 text-[13px] py-4 pl-6">
                        {index + 1}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-medium text-gray-700 text-[13px]">
                          {item.claimed_at ? format(new Date(item.claimed_at), "MMM dd, yyyy HH:mm") : "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-7 h-7 shrink-0 border border-gray-100 shadow-xs">
                            <AvatarImage src={item.user?.profile_image} alt={item.user?.full_name || "User"} className="object-cover" />
                            <AvatarFallback className="bg-[#0073b6] text-white text-[11px] font-bold">
                              {(item.user?.full_name || item.user?.email || "U").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-[#0073b6] text-[13px]">{item.user?.full_name || "Unknown"}</span>
                            <span className="text-gray-500 text-[12px]">{item.user?.email || "N/A"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700 text-[13px] bg-blue-50 px-2 py-1 rounded-sm w-fit">
                            {item.gift_code?.code || "N/A"}
                          </span>
                          <span className="text-gray-500 text-[12px] mt-1">
                            Amount: ${Number(item.reward_amount || 0).toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 pr-6">
                        <span className="text-[12px] px-2.5 py-1 rounded-md font-medium bg-blue-600/10 text-blue-600">
                          Successful
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-gray-500 bg-gray-50/30">
                      <div className="flex flex-col items-center justify-center space-y-3 py-6">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <Gift className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="text-sm font-medium text-gray-700">No redemption history found</div>
                        <p className="text-xs text-gray-400 max-w-[280px]">
                          Claims or uses of gift codes will appear here once users redeem them.
                        </p>
                      </div>
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
