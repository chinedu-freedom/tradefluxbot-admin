"use client"

import { useState } from "react"
import { Search, Edit, Trash2, Plus, Gift, History, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import GiftCodeDialog from "@/components/modals/GiftCodeDialog"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFetchData, useDelete } from "@/hooks/useApi"
import { toast } from "sonner"
import DeleteConfirmationDialog from "@/components/modals/DeleteConfirmationDialog"
import Link from "next/link"

export default function GiftBonusPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [editingGiftCode, setEditingGiftCode] = useState(null)
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const { data: giftCodes, isLoading } = useFetchData("/admin/rewards/gift-codes", ["admin-gift-codes"])
  const deleteMutation = useDelete((id) => `/admin/rewards/gift-codes/${id}`, ["admin-gift-codes"])

  const handleDeleteClick = (item) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteMutation.mutateAsync(itemToDelete.id)
        setDeleteDialogOpen(false)
        setItemToDelete(null)
      } catch (error) {
        // Handled by useApi
      }
    }
  }

  const giftCodesData = Array.isArray(giftCodes) ? giftCodes : []

  const filteredData = giftCodesData.filter((item) => {
    const matchesSearch = 
      (item.code_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.code || "").toLowerCase().includes(searchTerm.toLowerCase())
    
    const itemStatus = item.status ? "active" : "inactive"
    const matchesStatus = statusFilter === "all" || itemStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-[#0073b6]" />
          <h1 className="text-2xl font-bold text-gray-800">Gift Codes Management</h1>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Link href="/gift-bonus/uses-list" className="flex-1 md:flex-none">
            <Button className="w-full md:w-auto bg-[#00CFDD] hover:bg-[#00b5c2] text-white h-10 px-4 rounded-sm-sm shadow-sm border-0">
              <History className="w-4 h-4 mr-2" />
              Redemption History
            </Button>
          </Link>
          <Button 
            onClick={() => {
              setEditingGiftCode(null)
              setDialogOpen(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-sm px-6 shadow-lg"
          >
            <Plus className="w-4 h-4 " />
            Create Gift Code
          </Button>
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
                  placeholder="Search by code name or code..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
                  <TableHead className="w-[60px] font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4 pl-6 cursor-pointer hover:bg-gray-100 transition-colors">
                    S.N
                  </TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4 cursor-pointer hover:bg-gray-100 transition-colors">
                    CODE NAME <ChevronsUpDown className="ml-1 h-3 w-3 inline-block" />
                  </TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4 cursor-pointer hover:bg-gray-100 transition-colors">
                    GIFT CODE <ChevronsUpDown className="ml-1 h-3 w-3 inline-block" />
                  </TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4 cursor-pointer hover:bg-gray-100 transition-colors">
                    AMOUNT <ChevronsUpDown className="ml-1 h-3 w-3 inline-block" />
                  </TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4 cursor-pointer hover:bg-gray-100 transition-colors">
                    USAGE <ChevronsUpDown className="ml-1 h-3 w-3 inline-block" />
                  </TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4 cursor-pointer hover:bg-gray-100 transition-colors">
                    MAX USES <ChevronsUpDown className="ml-1 h-3 w-3 inline-block" />
                  </TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4 cursor-pointer hover:bg-gray-100 transition-colors">
                    STATUS <ChevronsUpDown className="ml-1 h-3 w-3 inline-block" />
                  </TableHead>
                  <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4 text-right pr-6 w-[120px]">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-500 bg-gray-50/30">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 border-b last:border-0">
                      <TableCell className="font-medium text-gray-700 text-[13px] py-4 pl-6">
                        {index + 1}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-medium text-gray-700 text-[13px]">{item.code_name}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-medium text-[#0073b6] text-[13px] bg-blue-50 px-2 py-1 rounded-sm">{item.code}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-medium text-gray-700 text-[13px]">${Number(item.reward_amount).toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-medium text-gray-700 text-[13px]">{item.used_count || 0}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-medium text-gray-700 text-[13px]">{item.max_uses}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`text-[12px] px-2.5 py-1 rounded-md font-medium ${
                          item.status
                            ? 'bg-blue-600/10 text-blue-600' 
                            : 'bg-yellow-50 text-yellow-600'
                        }`}>
                          {item.status ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="default" 
                            size="icon" 
                            className="h-8 w-8 bg-[#ffb822] hover:bg-[#e5a51f] text-white border-0 shadow-sm rounded-sm-sm"
                            title="Edit"
                            onClick={() => {
                              setEditingGiftCode(item)
                              setDialogOpen(true)
                            }}
                          >
                            <Edit className="w-[14px] h-[14px]" />
                          </Button>
                          <Button 
                            variant="default" 
                            size="icon" 
                            className="h-8 w-8 bg-[#ff5b5c] hover:bg-[#e55253] text-white border-0 shadow-sm rounded-sm-sm"
                            title="Delete"
                            onClick={() => handleDeleteClick(item)}
                          >
                            <Trash2 className="w-[14px] h-[14px]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-500 bg-gray-50/30">
                      No data available in table
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <GiftCodeDialog 
        open={isDialogOpen} 
        setOpen={setDialogOpen} 
        initialData={editingGiftCode} 
      />

      <DeleteConfirmationDialog 
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Gift Code"
        description={`Are you sure you want to delete the gift code "${itemToDelete?.code_name}"? This action cannot be undone.`}
      />
    </div>
  )
}
