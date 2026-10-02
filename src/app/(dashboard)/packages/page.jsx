"use client"

import { useState } from "react"
import { Search, Edit, Download, Package, CheckCircle, Clock, XCircle, Plus, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import PlanDialog from "@/components/modals/PlanDialog"
import { useFetchData, useDelete } from "@/hooks/useApi"
import { format } from "date-fns"

export default function PlansManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Modal State
  const [open, setOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    planId: null,
  });

  const { data: plansRes, isLoading } = useFetchData("/admin/plans", ["plans"]);
  const plansData = Array.isArray(plansRes) ? plansRes : plansRes?.data || [];

  const deleteMutation = useDelete((id) => `/admin/plans/${id}`, ["plans"]);

  const handleDeleteClick = (id) => {
    setConfirmDialog({ isOpen: true, planId: id });
  };

  const executeDelete = async () => {
    if (confirmDialog.planId) {
      try {
        await deleteMutation.mutateAsync(confirmDialog.planId);
      } catch (error) {
        console.error("Failed to delete plan", error);
      } finally {
        setConfirmDialog({ isOpen: false, planId: null });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-blue-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (isFixed) => {
    if (isFixed) {
      return "bg-sky-100 text-sky-800"
    }
    return "bg-blue-100 text-blue-800"
  }

  const filteredPlans = plansData.filter((plan) => {
    const matchesSearch =
      plan.name?.toLowerCase().includes(searchTerm.toLowerCase())
      
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" ? plan.status === true : plan.status === false);
    
    let matchesType = true;
    if (typeFilter === "fixed") matchesType = plan.is_fixed_deposit === true;
    if (typeFilter === "flexible") matchesType = plan.is_fixed_deposit === false;

    return matchesSearch && matchesStatus && matchesType
  })

  // Dynamic stats
  const activeCount = plansData.filter(p => p.status === true).length;
  const inactiveCount = plansData.filter(p => p.status === false).length;
  const highestProfit = plansData.length > 0 
    ? Math.max(...plansData.map(p => Number(p.daily_income))) 
    : 0;

  const dynamicStats = [
    {
      title: "Total Packages",
      value: plansData.length.toString(),
      icon: Package,
    },
    {
      title: "Active Packages",
      value: activeCount.toString(),
      icon: CheckCircle,
    },
    {
      title: "Inactive Packages",
      value: inactiveCount.toString(),
      icon: Clock,
    },
    {
      title: "Highest Profit",
      value: `${highestProfit}%`,
      icon: XCircle,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investment Packages</h1>
          <p className="text-muted-foreground text-sm">Manage and track investment plans</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => {
              setSelectedPlan(null)
              setOpen(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-sm px-6 shadow-lg"
          >
            <Plus className="w-4 h-4 " />
            Create Package
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dynamicStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow border-border shadow-sm bg-card rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</h3>
                  <p className="text-[13px] font-medium text-muted-foreground mt-1 tracking-wide">{stat.title}</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
              <Input
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background h-10 w-full"
              />
            </div>
             <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-background">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48 bg-background">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="fixed">Fixed Deposit</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-none shadow-sm bg-card">
        <CardHeader>
          <CardTitle>Packages ({filteredPlans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="whitespace-nowrap">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold text-[#475f7b] text-[12px] uppercase">#</TableHead>
                  <TableHead className="font-bold text-[#475f7b] text-[12px] uppercase">Thumbnail</TableHead>
                  <TableHead className="font-bold text-[#475f7b] text-[12px] uppercase">Name</TableHead>
                  <TableHead className="font-bold text-[#475f7b] text-[12px] uppercase">Duration</TableHead>
                  <TableHead className="font-bold text-[#475f7b] text-[12px] uppercase">Daily %</TableHead>
                  <TableHead className="font-bold text-[#475f7b] text-[12px] uppercase">Min/Max</TableHead>
                  <TableHead className="font-bold text-[#475f7b] text-[12px] uppercase">Deposit Type</TableHead>
                  <TableHead className="font-bold text-[#475f7b] text-[12px] uppercase">Status</TableHead>
                  <TableHead className="font-bold text-[#475f7b] text-[12px] uppercase text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-gray-500 bg-gray-50/30">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading plans...
                    </TableCell>
                  </TableRow>
                ) : filteredPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-gray-500 bg-gray-50/30">
                      <Package className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                      <p className="text-base font-medium text-gray-600 mb-1">No plans available</p>
                      <p className="text-sm text-gray-500">There are no packages matching your search criteria.</p>
                    </TableCell>
                  </TableRow>
                ) : filteredPlans.map((plan, index) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium text-[13px] text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>
                      {plan.image ? (
                        <img src={plan.image} alt={plan.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                          <Package className="w-5 h-5 text-blue-500" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-[14px] text-foreground">{plan.name}</div>
                      <div className="text-[12px] text-muted-foreground">Created: {format(new Date(plan.created_at), 'MMM dd, yyyy')}</div>
                    </TableCell>
                    <TableCell className="text-[13px] font-medium text-muted-foreground">{plan.duration} Days</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100/50 hover:bg-green-100 text-green-700 border-0 shadow-none font-bold">
                        {Number(plan.daily_income)}% Daily
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-[13px] font-semibold text-foreground">${Number(plan.min_investment).toLocaleString()} - ${Number(plan.max_investment).toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getTypeColor(plan.is_fixed_deposit)} hover:${getTypeColor(plan.is_fixed_deposit)} border-0 shadow-none font-bold`}>
                        {plan.is_fixed_deposit ? "Fixed" : "Flexible"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(plan.status ? "active" : "inactive")} hover:${getStatusColor(plan.status ? "active" : "inactive")} border-0 capitalize shadow-none font-bold`}>
                        {plan.status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedPlan(plan)
                            setOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteClick(plan.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PlanDialog
        open={open}
        setOpen={setOpen}
        initialData={selectedPlan}
      />

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Plan Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this investment plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}