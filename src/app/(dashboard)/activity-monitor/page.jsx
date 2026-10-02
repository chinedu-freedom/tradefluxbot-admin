"use client"

import { useState, useMemo } from "react"
import { History, Search, RotateCcw, Filter, LogIn, UserPlus, Dices, CalendarCheck, Maximize, Database, RefreshCw, Loader2, Key, Wallet, Gift, Settings, ShieldAlert, CreditCard, UserX, UserCheck, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFetchData } from "@/hooks/useApi"
import Pagination from "@/components/Pagination"

// Predefined actions map for colors and icons
const ACTION_MAP = {
  "user login": { color: "bg-[#00cfe8] hover:bg-[#00cfe8]/90", icon: LogIn },
  "user registered": { color: "bg-blue-600 hover:bg-blue-700/90", icon: UserPlus },
  "password reset": { color: "bg-[#ff9f43] hover:bg-[#ff9f43]/90", icon: Key },
  "deposit initiated": { color: "bg-[#ea5455] hover:bg-[#ea5455]/90", icon: CreditCard },
  "deposit completed": { color: "bg-blue-600 hover:bg-blue-700/90", icon: CreditCard },
  "withdrawal requested": { color: "bg-[#ff9f43] hover:bg-[#ff9f43]/90", icon: Wallet },
  "bonus claimed": { color: "bg-[#7367f0] hover:bg-[#7367f0]/90", icon: Gift },
  "spin wheel": { color: "bg-[#00cfe8] hover:bg-[#00cfe8]/90", icon: Dices },
  "daily check in": { color: "bg-blue-600 hover:bg-blue-700/90", icon: CalendarCheck },
  "package purchase": { color: "bg-[#7367f0] hover:bg-[#7367f0]/90", icon: Database },
  "profile updated": { color: "bg-[#4cc5d9] hover:bg-[#4cc5d9]/90", icon: Settings },
  "admin credit": { color: "bg-blue-600 hover:bg-blue-700/90", icon: Shield },
  "admin debit": { color: "bg-[#ea5455] hover:bg-[#ea5455]/90", icon: ShieldAlert },
  "user banned": { color: "bg-[#ea5455] hover:bg-[#ea5455]/90", icon: UserX },
  "user unbanned": { color: "bg-blue-600 hover:bg-blue-700/90", icon: UserCheck },
  "default": { color: "bg-gray-500 hover:bg-gray-600", icon: History }
}

const getActionDetails = (actionStr) => {
  if (!actionStr) return ACTION_MAP.default;
  const lowerAction = actionStr.toLowerCase();
  
  for (const [key, value] of Object.entries(ACTION_MAP)) {
    if (lowerAction.includes(key.replace('-', ' '))) {
      return value;
    }
  }
  
  return ACTION_MAP.default;
}

const parseUserAgent = (userAgent) => {
  if (!userAgent || userAgent === "Unknown") return "";
  
  const ua = userAgent.toLowerCase();
  let browser = "";
  let os = "";
  
  // OS Detection
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("macintosh") || ua.includes("mac os")) os = "macOS";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("linux")) os = "Linux";
  
  // Browser Detection
  if (ua.includes("chrome") || ua.includes("crios")) browser = "Chrome";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("edge")) browser = "Edge";
  
  if (browser && os) return `${browser} on ${os}`;
  return browser || os || "";
}

const formatDetails = (details, action, userAgent) => {
  if (!details) {
    const actionKey = action ? action.toLowerCase() : "";
    if (actionKey.includes("login") || actionKey.includes("register") || actionKey.includes("password")) {
      const device = parseUserAgent(userAgent);
      return device ? `via ${device}` : "Success";
    }
    return "-";
  }
  try {
    const parsed = typeof details === "string" ? JSON.parse(details) : details;
    const actionKey = action ? action.toLowerCase() : "";

    if (actionKey.includes("package purchase") || actionKey.includes("investment")) {
      return `${parsed.planName || "Plan"} ($${parsed.amount || 0})`;
    }
    if (actionKey.includes("daily check in") || actionKey.includes("checkin")) {
      return `Day ${parsed.day || "-"} reward ($${parsed.amount || 0})`;
    }
    if (actionKey.includes("bonus claimed")) {
      return `Code: ${parsed.code || "-"} ($${parsed.amount || 0})`;
    }
    if (actionKey.includes("spin wheel") || actionKey.includes("spin")) {
      return `Won ${parsed.prizeName || "Reward"} ($${parsed.rewardAmount || 0})`;
    }
    if (actionKey.includes("deposit initiated")) {
      return `Requested $${parsed.amount || 0} (${parsed.cryptocurrency || "Crypto"})`;
    }
    if (actionKey.includes("deposit completed")) {
      return `Credited $${parsed.amount || 0}`;
    }
    if (actionKey.includes("withdrawal requested")) {
      return `Requested $${parsed.amount || 0} (${parsed.network || "Crypto"})`;
    }
    if (actionKey.includes("admin credit")) {
      return `${parsed.balance_type === "gift" ? "Gift" : "Main"} Credit: $${parsed.amount || 0} (${parsed.reason || "No reason"})`;
    }
    if (actionKey.includes("admin debit")) {
      return `${parsed.balance_type === "gift" ? "Gift" : "Main"} Debit: $${parsed.amount || 0} (${parsed.reason || "No reason"})`;
    }
    if (actionKey.includes("profile updated")) {
      if (parsed.description) return parsed.description;
      if (parsed.updatedFields) {
        const fields = Object.keys(parsed.updatedFields).filter(k => parsed.updatedFields[k] !== undefined);
        return `Updated: ${fields.join(", ")}`;
      }
    }
    if (parsed.description) return parsed.description;
    
    if (typeof parsed === "object" && parsed !== null) {
      const keys = Object.keys(parsed);
      if (keys.length === 1) {
        return `${keys[0]}: ${parsed[keys[0]]}`;
      }
      return JSON.stringify(parsed);
    }
    return String(parsed);
  } catch (e) {
    return typeof details === "string" ? details : JSON.stringify(details);
  }
};

export default function ActivityMonitorPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [ipTerm, setIpTerm] = useState("")
  const [debouncedIp, setDebouncedIp] = useState("")
  const [actionType, setActionType] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)

  // Use debounce for inputs
  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setDebouncedIp(ipTerm)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm, ipTerm])

  // Build query string
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: "20"
  })

  if (debouncedSearch) queryParams.append("search", debouncedSearch)
  if (debouncedIp) queryParams.append("ip", debouncedIp)
  if (actionType !== "all") queryParams.append("action", actionType)
  if (dateFrom) queryParams.append("dateFrom", dateFrom)
  if (dateTo) queryParams.append("dateTo", dateTo)

  const { data, isLoading, refetch } = useFetchData(`/admin/activities?${queryParams.toString()}`, [
    "admin-activities", 
    page, 
    debouncedSearch, 
    debouncedIp, 
    actionType, 
    dateFrom, 
    dateTo
  ])

  const activities = data?.activities || []
  const stats = data?.stats || {
    activitiesToday: 0,
    activeUsers: 0,
    loginsToday: 0,
    depositsToday: 0,
    withdrawalsToday: 0,
    registrationsToday: 0
  }
  const meta = data?.meta || { total: 0, page: 1, pages: 1 }

  const customStats = [
    { title: "ACTIVITIES TODAY", value: stats.activitiesToday, bg: "bg-[#7e56c5]" },
    { title: "ACTIVE USERS", value: stats.activeUsers, bg: "bg-[#29d378]" },
    { title: "LOGINS TODAY", value: stats.loginsToday, bg: "bg-[#4cc5d9]" },
    { title: "DEPOSITS TODAY", value: stats.depositsToday, bg: "bg-[#f2639b]" },
    { title: "WITHDRAWALS", value: stats.withdrawalsToday, bg: "bg-[#f45c43]" },
    { title: "REGISTRATIONS", value: stats.registrationsToday, bg: "bg-[#354877]" },
  ]

  const handleResetFilters = () => {
    setSearchTerm("")
    setDebouncedSearch("")
    setIpTerm("")
    setDebouncedIp("")
    setActionType("all")
    setDateFrom("")
    setDateTo("")
    setPage(1)
  }

  const handleActionChange = (val) => {
    setActionType(val)
    setPage(1)
  }

  const handleDateFromChange = (e) => {
    setDateFrom(e.target.value)
    setPage(1)
  }

  const handleDateToChange = (e) => {
    setDateTo(e.target.value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {customStats.map((stat, index) => (
          <div key={index} className={`${stat.bg} rounded-xl p-4 text-white shadow-sm flex flex-col items-center justify-center min-h-[90px]`}>
            <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value.toLocaleString()}</div>
            <div className="text-[10px] md:text-[11px] font-semibold tracking-wider uppercase text-white/90 text-center leading-tight">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Main Container */}
      <Card className="border-none shadow-sm bg-white rounded-md overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-gray-700">
              <History className="w-5 h-5 text-gray-500" />
              <h2 className="text-[18px] font-semibold text-gray-800">Activity Monitor</h2>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => refetch()} variant="outline" className="h-9 px-3 rounded-md text-gray-600">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button className="bg-[#94a3b8] hover:bg-[#8292a8] text-white h-9 px-4 rounded-sm-sm pointer-events-none">
                <Database className="w-4 h-4 mr-2" />
                TOTAL: {meta.total.toLocaleString()} RECORDS
              </Button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="bg-[#f8f9fa] p-4 rounded-md flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block">Action Type</label>
              <Select value={actionType} onValueChange={handleActionChange}>
                <SelectTrigger className="bg-white border-gray-200 h-9 text-gray-600">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="login">User Login</SelectItem>
                  <SelectItem value="register">User Registered</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                  <SelectItem value="withdrawal">Withdrawals</SelectItem>
                  <SelectItem value="spin">Spin Wheel</SelectItem>
                  <SelectItem value="checkin">Daily Check-in</SelectItem>
                  <SelectItem value="password">Password Resets</SelectItem>
                  <SelectItem value="package">Package Purchases</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block">User (Email / ID)</label>
              <Input
                placeholder="Search user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-gray-200 h-9 placeholder:text-gray-400"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block">IP Address</label>
              <Input
                placeholder="e.g. 192.168.1.1"
                value={ipTerm}
                onChange={(e) => setIpTerm(e.target.value)}
                className="bg-white border-gray-200 h-9 placeholder:text-gray-400"
              />
            </div>
            <div className="w-[140px]">
              <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block">Date From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={handleDateFromChange}
                className="bg-white border-gray-200 h-9 text-gray-500"
              />
            </div>
            <div className="w-[140px]">
              <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block">Date To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={handleDateToChange}
                className="bg-white border-gray-200 h-9 text-gray-500"
              />
            </div>
            <Button onClick={handleResetFilters} variant="ghost" className="h-9 px-3 text-gray-500 hover:text-gray-800">
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
              <p className="text-sm font-medium">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <History className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-sm font-medium">No activity records found matching filters</p>
            </div>
          ) : (
            <>
              <Table className="min-w-[1000px] whitespace-nowrap">
                <TableHeader className="bg-gray-50/50 border-y">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4 w-[60px] pl-6">ID</TableHead>
                    <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4 min-w-[140px]">TIME</TableHead>
                    <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4 min-w-[250px]">USER</TableHead>
                    <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4 min-w-[180px]">ACTION</TableHead>
                    <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4 min-w-[140px]">DETAILS</TableHead>
                    <TableHead className="font-bold text-gray-500 uppercase text-[11px] tracking-wider py-4 min-w-[130px]">IP ADDRESS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="">
                  {activities.map((record, index) => {
                    const actionInfo = getActionDetails(record.action)
                    const dateObj = new Date(record.created_at)
                    
                    return (
                      <TableRow key={record.id} className="hover:bg-gray-50 border-b last:border-0">
                        <TableCell className="font-medium text-gray-500 text-[13px] py-4 pl-6">
                          #{record.id.substring(0, 5)}...
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="font-bold text-gray-800 text-[12px]">
                            {dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                          </div>
                          <div className="text-[11px] text-gray-500 my-0.5">
                            {dateObj.toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-7 h-7 shrink-0 border border-gray-100 shadow-xs">
                              <AvatarImage src={record.user?.profile_image} alt={record.user?.email || "User"} className="object-cover" />
                              <AvatarFallback className="bg-[#0073b6] text-white text-[11px] font-bold">
                                {(record.user?.email || "U").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-bold text-[#0073b6] text-[13px] hover:underline cursor-pointer">
                                {record.user?.email || "Unknown User"}
                              </div>
                              <div className="text-[12px] text-gray-500 mt-0.5">ID: {record.user?.id ? record.user.id.substring(0, 8) + '...' : "-"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge showDot={false} className={`${actionInfo.color} text-white border-0 px-3 py-1 rounded-full font-bold text-[10px] tracking-wide uppercase flex items-center w-fit gap-1.5`}>
                            <actionInfo.icon className="w-3.5 h-3.5" />
                            {record.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-[11px] text-gray-600 max-w-[250px] truncate" title={record.details ? (typeof record.details === 'string' ? record.details : JSON.stringify(record.details)) : (record.user_agent || "No specific details")}>
                            {formatDetails(record.details, record.action, record.user_agent)}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge showDot={false} className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 px-2 py-1 rounded-[4px] font-bold text-[11px]">
                            {record.ip_address === "::1" ? "127.0.0.1 (Local)" : (record.ip_address || "Unknown IP")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              
              <div className="p-4 border-t">
                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.pages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>
        
      </Card>
    </div>
  )
}

