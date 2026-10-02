"use client"

import { useState, useRef } from "react"
import { Search, Edit, Lock, LogIn, Users, CheckCircle, Clock, Ban, UserCog, History, RotateCcw, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import Link from "next/link"

import { useFetchData } from "@/hooks/useApi"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

export default function CustomersManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all-status")
  const [countryFilter, setCountryFilter] = useState("all-countries")
  const [userToDelete, setUserToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const deletingRef = useRef(false)

  let symbol = "$";
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("admin-platform-settings-symbol");
      if (cached) symbol = cached;
    } catch (e) {}
  }

  const { data: usersRes, isLoading, mutate } = useFetchData("/admin/users", ["adminUsers"]);
  const usersData = Array.isArray(usersRes) ? usersRes : usersRes?.data || [];

  const handleDeleteClick = (user) => {
    setUserToDelete(user)
  }

  const executeDeleteUser = async () => {
    if (!userToDelete || deletingRef.current) return
    deletingRef.current = true
    setIsDeleting(true)
    try {
      const token = document.cookie.split("; ").find(row => row.startsWith("sec-admin-token="))?.split("=")[1];
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (res.ok) {
        toast.success("User deleted successfully")
        mutate() // Refresh data
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to delete user")
      }
    } catch (error) {
      toast.error("An error occurred while deleting user")
    } finally {
      setIsDeleting(false)
      setUserToDelete(null)
      deletingRef.current = false
    }
  }



  const uniqueCountriesMap = usersData.reduce((acc, user) => {
    if (user.country && user.country.country_code) {
      acc[user.country.country_code.toLowerCase()] = user.country.country_name || user.country.country_code;
    }
    return acc;
  }, {});

  const filteredUsers = usersData.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (user.username || "").toLowerCase().includes(searchTerm.toLowerCase())
      
    const statusStr = user.is_active ? "active" : "banned"
    const matchesStatus = statusFilter === "all-status" || statusStr === statusFilter.toLowerCase()
    const matchesCountry = countryFilter === "all-countries" || (user.country?.country_code || "").toLowerCase() === countryFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesCountry
  })

  const activeUsersCount = usersData.filter(u => u.is_active).length;
  const bannedUsersCount = usersData.filter(u => !u.is_active).length;

  const stats = [
    { title: "Total Users", value: usersData.length.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Active Users", value: activeUsersCount.toString(), icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Unverified Users", value: "0", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
    { title: "Banned Users", value: bannedUsersCount.toString(), icon: Ban, color: "text-red-600", bg: "bg-red-100" },
  ]

  return (
    <div className="space-y-6">
      
      {/* Stats Cards - Built using packages page format */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow border-none shadow-sm bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-700">{stat.value}</h3>
                  <p className="text-[13px] font-medium text-gray-500 mt-1 tracking-wide">{stat.title}</p>
                </div>
                <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Container */}
      <Card className="border-none shadow-sm bg-white rounded-md overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-gray-700">
              <UserCog className="w-5 h-5 text-gray-500" />
              <h2 className="text-[16px] font-semibold">User Management</h2>
            </div>
            <Button variant="outline" className="border-cyan-500 text-cyan-500 hover:bg-cyan-50 h-9 px-4 rounded-sm-sm">
              <History className="w-4 h-4 mr-2" />
              Activity
            </Button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-gray-300 h-10 rounded-md text-[13px]"
              />
            </div>
            <div className="w-full md:w-[180px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-200 h-10 text-gray-600">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[180px]">
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="border-gray-200 h-10 text-gray-600">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-countries">All Countries</SelectItem>
                  {Object.entries(uniqueCountriesMap).map(([code, name]) => (
                    <SelectItem key={code} value={code}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50 border-b">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider w-[50px] py-4">#</TableHead>
                <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider py-4">USER</TableHead>
                <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider py-4">COUNTRY</TableHead>
                <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider py-4">DEPOSIT BALANCE</TableHead>
                <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider py-4">EARNING BALANCE</TableHead>
                <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider py-4">REGISTERED</TableHead>
                <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider py-4">STATUS</TableHead>
                <TableHead className="font-bold text-gray-600 uppercase text-[11px] tracking-wider py-4">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-gray-500 bg-gray-50/30">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0073b6]" />
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Search className="w-12 h-12 mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-600">No users found</p>
                      <p className="text-sm mt-1 text-gray-400">We couldn't find any users matching your search or filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50 border-b last:border-0">
                  <TableCell className="font-medium text-gray-700 text-[13px] py-4">
                    {user.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 shrink-0 border border-gray-100 shadow-xs">
                        <AvatarImage src={user.profile_image} alt={user.full_name || user.email} className="object-cover" />
                        <AvatarFallback className="bg-[#0073b6] text-white font-bold text-sm">
                          {(user.full_name || user.username || user.email || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-gray-800 text-[13px] leading-tight">{user.full_name || user.username || "Unnamed User"}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <Badge showDot={false} className="bg-gray-400 hover:bg-gray-500 text-white border-0 px-2.5 py-0.5 rounded-[4px] font-medium text-[11px]">
                      {user.country?.country_code || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-bold text-[#0073b6] text-[13px]">{symbol}{Number(user.balance || 0).toFixed(2)}</span>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-bold text-blue-600 text-[13px]">{symbol}{Number(user.withdrawable_balance || 0).toFixed(2)}</span>
                  </TableCell>
                  <TableCell className="text-[12px] text-gray-600 py-4 whitespace-nowrap">
                    {format(new Date(user.created_at), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="py-4">
                    <StatusBadge status={user.is_active ? "ACTIVE" : "BANNED"} />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/customers/${user.id}`}>
                        <Button variant="outline" size="icon" className="h-7 w-7 text-blue-500 border-gray-200 hover:bg-blue-50" title="Edit">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon" className="h-7 w-7 text-cyan-500 border-gray-200 hover:bg-cyan-50" title="Login As">
                        <LogIn className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-7 w-7 text-orange-400 border-gray-200 hover:bg-orange-50" title="Lock">
                        <Lock className="w-3.5 h-3.5" />
                      </Button>
                      <Button onClick={() => handleDeleteClick(user)} variant="outline" size="icon" className="h-7 w-7 text-red-500 border-gray-200 hover:bg-red-50" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
      </Card>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete User Account</h3>
              <p className="text-sm text-center text-gray-500">
                Are you sure you want to delete <strong>{userToDelete.email}</strong>? This will permanently wipe all of their history, transactions, and investments. This action cannot be undone.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t">
              <Button variant="outline" onClick={() => setUserToDelete(null)} disabled={isDeleting} className="h-10 text-gray-600 border-gray-300">
                Cancel
              </Button>
              <Button onClick={executeDeleteUser} disabled={isDeleting} className="h-10 bg-red-600 hover:bg-red-700 text-white min-w-[100px]">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
