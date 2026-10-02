"use client"

import { useState, useMemo } from "react"
import { Search, Edit, Trash2, Plus, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import SliderDialog from "@/components/modals/SliderDialog"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFetchData, useDelete } from "@/hooks/useApi"
import Pagination from "@/components/Pagination"
import { toast } from "sonner"
import DeleteConfirmationDialog from "@/components/modals/DeleteConfirmationDialog"

export default function SliderImagesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [editingSlider, setEditingSlider] = useState(null)
  
  // Delete state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sliderToDelete, setSliderToDelete] = useState(null)
  
  const deleteMutation = useDelete(
    sliderToDelete ? `/admin/sliders/${sliderToDelete.id}` : null,
    "admin-sliders"
  )

  // Use debounce for inputs
  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Build query string
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: "10"
  })

  if (debouncedSearch) queryParams.append("search", debouncedSearch)
  if (statusFilter !== "all") queryParams.append("status", statusFilter)

  const { data, isLoading, refetch } = useFetchData(`/admin/sliders?${queryParams.toString()}`, [
    "admin-sliders", 
    page, 
    debouncedSearch, 
    statusFilter
  ])

  const sliders = data?.sliders || []
  const meta = data?.meta || { total: 0, page: 1, pages: 1 }

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val)
    setPage(1)
  }

  const handleDeleteClick = (slider) => {
    setSliderToDelete(slider)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!sliderToDelete) return
    
    try {
      await deleteMutation.mutateAsync()
      refetch()
    } catch (error) {
      // toast.error is handled by useDelete
    } finally {
      setIsDeleteDialogOpen(false)
      setSliderToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Slider Lists</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => {
              setEditingSlider(null)
              setDialogOpen(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-sm px-6 shadow-lg"
          >
            <Plus className="w-4 h-4 " />
            Add New Item
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
                  placeholder="Search page view..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white border-gray-200 h-10 w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-52 bg-white border-gray-200 h-10">
                  <SelectValue placeholder="Status" />
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
          <div className="overflow-x-auto min-h-[300px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
                <p className="text-sm font-medium">Loading slider images...</p>
              </div>
            ) : (
              <>
                <Table className="min-w-[1000px] whitespace-nowrap">
                  <TableHeader className="bg-gray-50/50 border-b">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4 pl-6">ID</TableHead>
                      <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4">PHOTO</TableHead>
                      <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4">PAGE VIEW</TableHead>
                      <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4">STATUS</TableHead>
                      <TableHead className="font-bold text-gray-600 uppercase text-[12px] tracking-wider py-4 text-right pr-6 w-[120px]">ACTION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="">
                    {sliders.length > 0 ? (
                      sliders.map((item, index) => (
                        <TableRow key={item.id} className="hover:bg-gray-50 border-b last:border-0">
                          <TableCell className="font-medium text-gray-700 text-[13px] py-4 pl-6">
                            {(meta.page - 1) * meta.limit + index + 1}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="w-[100px] h-[60px] bg-gray-100 border border-gray-200 rounded-sm overflow-hidden flex items-center justify-center text-gray-400 shadow-sm">
                              {item.image ? (
                                <img src={item.image} alt={item.display_location} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-6 h-6 opacity-50" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="font-medium text-[#0073b6] text-[13px]">{item.display_location}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded uppercase ${
                              item.status 
                                ? "bg-blue-100 text-blue-600" 
                                : "bg-[#ff9f43]/10 text-[#ff9f43]"
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
                                  setEditingSlider(item)
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
                      <TableRow className="">
                        <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                          No slider images found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                {meta.pages > 1 && (
                  <div className="p-4 border-t">
                    <Pagination
                      currentPage={meta.page}
                      totalPages={meta.pages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <SliderDialog 
        open={isDialogOpen} 
        setOpen={setDialogOpen} 
        initialData={editingSlider}
        onSuccess={refetch}
      />
      
      <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Slider Image"
        description="Are you sure you want to delete this slider image? This action cannot be undone."
      />
    </div>
  )
}
