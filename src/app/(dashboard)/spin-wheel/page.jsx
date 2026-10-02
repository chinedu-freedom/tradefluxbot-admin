"use client"

import { useState } from "react"
import { Search, Edit, Trash2, EyeOff, Settings, Plus, Trophy, Target, PieChart, FileText, Copy, Printer, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFetchData, useDelete } from "@/hooks/useApi"
import SpinPrizeDialog from "@/components/modals/SpinPrizeDialog"
import SpinSettingsDialog from "@/components/modals/SpinSettingsDialog"
import DeleteConfirmationDialog from "@/components/modals/DeleteConfirmationDialog"
import { Icon } from '@iconify/react'

export default function SpinWheelPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Modals state
  const [prizeDialogOpen, setPrizeDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  const [selectedPrize, setSelectedPrize] = useState(null)
  const [prizeToDelete, setPrizeToDelete] = useState(null)

  let symbol = "$";
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("admin-platform-settings-symbol");
      if (cached) symbol = cached;
    } catch (e) {}
  }

  // Data Fetching
  const { data: spinPrizes = [], isLoading: loadingPrizes } = useFetchData("/admin/rewards/spin-prizes", ["admin-spin-prizes"])
  const { data: spinSettings = {}, isLoading: loadingSettings } = useFetchData("/admin/rewards/spin-settings", ["admin-spin-settings"])
  
  const deleteMutation = useDelete(["admin-spin-prizes"])

  // Handlers
  const handleCreatePrize = () => {
    setSelectedPrize(null)
    setPrizeDialogOpen(true)
  }

  const handleEditPrize = (prize) => {
    setSelectedPrize(prize)
    setPrizeDialogOpen(true)
  }

  const handleDeleteClick = (prize) => {
    setPrizeToDelete(prize)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!prizeToDelete) return
    try {
      await deleteMutation.mutateAsync(`/admin/rewards/spin-prizes/${prizeToDelete.id}`)
      setDeleteDialogOpen(false)
      setPrizeToDelete(null)
    } catch (error) {
      // Error handled by hook
    }
  }

  // Calculated Stats
  const totalWeight = spinPrizes.reduce((acc, curr) => acc + curr.weight, 0)
  const totalPrizes = spinPrizes.length
  const activePrizes = spinPrizes.filter(p => p.status).length

  const stats = [
    {
      title: "Total Prizes",
      value: totalPrizes.toString(),
      icon: Trophy,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Active Prizes",
      value: activePrizes.toString(),
      icon: Target,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Spins Used",
      value: (spinSettings.total_spins_used || 0).toString(),
      icon: PieChart,
      color: "text-[#0073b6]",
      bg: "bg-blue-100",
    },
    {
      title: "Total Prizes Paid",
      value: `${symbol}${Number(spinSettings.total_rewards_earned || 0).toFixed(2)}`,
      icon: Activity,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Free Spins Used",
      value: (spinSettings.free_spins_used || 0).toString(),
      icon: FileText,
      color: "text-teal-600",
      bg: "bg-teal-100",
    }
  ]

  const filteredPrizes = spinPrizes.filter((prize) => {
    const matchesSearch =
      prize.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prize.icon && prize.icon.toLowerCase().includes(searchTerm.toLowerCase()))
      
    let matchesStatus = true
    if (statusFilter === "active") matchesStatus = prize.status === true
    if (statusFilter === "inactive") matchesStatus = prize.status === false

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Spin Wheel Configuration</h1>
          <p className="text-muted-foreground text-sm">Manage prizes, probabilities, and global settings for the spin wheel</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setSettingsDialogOpen(true)} className="text-[#00cfdd] border-[#00cfdd] hover:bg-[#00cfdd]/10">
            <Settings className="w-4 h-4 mr-2" />
            Global Settings
          </Button>
          <Button 
            onClick={handleCreatePrize}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-sm-sm px-6 shadow-lg"
          >
            <Plus className="w-4 h-4 " />
            Add Prize
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-[#00cfdd] text-white px-4 py-3 rounded-md flex items-center shadow-sm">
        <Target className="w-5 h-5 mr-3" />
        <span className="font-medium">Global Feature Status: <strong>{spinSettings.feature_enabled ? "ENABLED" : "DISABLED"}</strong> | Total weight of all prizes: <strong>{totalWeight}</strong></span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow border-border shadow-sm bg-card rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">{stat.value}</h3>
                  <p className="text-[12px] font-medium text-muted-foreground mt-1 tracking-wide">{stat.title}</p>
                </div>
                <div className={`w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400`}>
                  <stat.icon className="w-4 h-4" strokeWidth={2} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                <Input
                  placeholder="Search prizes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36 bg-background">
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

      {/* Prizes Table */}
      <Card className="border-none shadow-sm bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[80px] font-bold text-gray-500 uppercase text-xs">POS</TableHead>
                  <TableHead className="w-[80px] font-bold text-gray-500 uppercase text-xs">COLOR</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs">NAME</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs">VALUE</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs">WEIGHT</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs">PROBABILITY</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs text-center">JACKPOT</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs">STATUS</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs text-right pr-6">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingPrizes ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-gray-500">
                      Loading prizes...
                    </TableCell>
                  </TableRow>
                ) : filteredPrizes.length > 0 ? (
                  filteredPrizes.map((prize) => {
                    // Calculate displayed probability based on weight
                    const calcProb = totalWeight > 0 ? ((prize.weight / totalWeight) * 100).toFixed(2) : 0
                    
                    return (
                      <TableRow key={prize.id} className="hover:bg-gray-50/50">
                        <TableCell className="font-medium text-gray-700">{prize.position}</TableCell>
                        <TableCell>
                          <div 
                            className="w-6 h-6 rounded-sm shadow-sm border border-gray-200" 
                            style={{ backgroundColor: prize.color }}
                            title={prize.color}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {prize.icon && <Icon icon={prize.icon} className="w-5 h-5 text-gray-500" />}
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 text-[13px]">{prize.name}</span>
                              <span className="text-[10px] text-gray-400">{prize.icon}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={Number(prize.value) > 0 ? "bg-blue-600 text-white hover:bg-blue-700 border-0" : "bg-[#475f7b] text-white hover:bg-[#34465b] border-0"} 
                            variant="outline"
                          >
                            {symbol}{Number(prize.value).toFixed(2)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-700 font-medium">{prize.weight}</TableCell>
                        <TableCell>
                          <Badge className="bg-gray-200 text-gray-600 hover:bg-gray-300 border-0" variant="secondary">
                            {calcProb}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {prize.is_jackpot ? (
                            <Badge className="bg-[#f59e0b] hover:bg-[#d97706] text-white border-0 px-3 py-0.5">
                              ★ JACKPOT
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={prize.status ? "bg-blue-600 hover:bg-blue-700 text-white border-0 text-[10px] tracking-wider uppercase px-2 py-0.5" : "bg-gray-400 hover:bg-gray-500 text-white border-0 text-[10px] tracking-wider uppercase px-2 py-0.5"}>
                            {prize.status ? "ACTIVE" : "INACTIVE"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end space-x-1.5">
                            <Button 
                              variant="default" 
                              size="icon" 
                              className="h-8 w-8 bg-[#f59e0b] hover:bg-[#d97706] text-white border-0"
                              title="Edit"
                              onClick={() => handleEditPrize(prize)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="default" 
                              size="icon" 
                              className="h-8 w-8 bg-[#ff5b5c] hover:bg-red-500 text-white border-0"
                              title="Delete"
                              onClick={() => handleDeleteClick(prize)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-gray-500">
                      No prizes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <SpinPrizeDialog 
        open={prizeDialogOpen} 
        setOpen={setPrizeDialogOpen} 
        initialData={selectedPrize} 
      />
      
      <SpinSettingsDialog 
        open={settingsDialogOpen} 
        setOpen={setSettingsDialogOpen} 
        initialData={spinSettings}
        totalPrizes={totalPrizes}
        activePrizes={activePrizes}
      />

      <DeleteConfirmationDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Spin Prize"
        description={`Are you sure you want to delete the prize "${prizeToDelete?.name}"? This action cannot be undone.`}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
