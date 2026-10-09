"use client"

import { CookieManager } from "@/utils/cookie-utils"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useFetchData } from "@/hooks/useApi"
import { useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ArrowLeft, User, Mail, Globe, Calendar, CreditCard, Gift, Activity, Settings, Save, CheckCircle, XCircle, ShieldAlert, KeyRound, Clock, MapPin, Hash, Link as LinkIcon, AlertTriangle, ArrowRightLeft, Loader2, PlusCircle, MinusCircle, Plus, Minus, WalletCards, ListOrdered, Trash, UserCheck, Camera, Users, ArrowRight, ExternalLink, Share2, Copy, GitFork, Award } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const safeFormatDate = (dateStr, formatStr) => {
  if (!dateStr) return "N/A"
  try {
    return format(new Date(dateStr), formatStr)
  } catch (e) {
    return "Invalid Date"
  }
}

export default function CustomerDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { id } = params

  let symbol = "$";
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("admin-platform-settings-symbol");
      if (cached) symbol = cached;
    } catch (e) { }
  }

  const { data: fetchRes, isLoading, refetch } = useFetchData(`/admin/users/${id}`, ["adminUser", id])
  const user = fetchRes?.data || fetchRes;
  const [editData, setEditData] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const deletingRef = useRef(false)
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  const { data: countriesRes } = useFetchData("/admin/countries", ["countries"])
  const countries = Array.isArray(countriesRes) ? countriesRes : countriesRes?.data || [];

  const [activeHistoryTab, setActiveHistoryTab] = useState("transactions")

  // Credit/Debit states
  const [creditData, setCreditData] = useState({ balance_type: "main", amount: "", reason: "" })
  const [debitData, setDebitData] = useState({ balance_type: "main", amount: "", reason: "" })
  const [isCreditProcessing, setIsCreditProcessing] = useState(false)
  const [isDebitProcessing, setIsDebitProcessing] = useState(false)
  const [securityModal, setSecurityModal] = useState({ isOpen: false, actionType: "", password: "" })

  useEffect(() => {
    if (user && !user.error && !isLoading) {
      setEditData(prev => ({
        full_name: prev?.full_name ?? (user.full_name || ""),
        username: prev?.username ?? (user.username || ""),
        email: prev?.email ?? (user.email || ""),
        country_id: prev?.country_id ?? (user.country_id || ""),
        profile_image: prev?.profile_image ?? (user.profile_image || ""),
        is_active: prev?.is_active ?? (user.is_active ?? true),
        can_deposit: prev?.can_deposit ?? (user.can_deposit ?? true),
        can_withdraw: prev?.can_withdraw ?? (user.can_withdraw ?? true),
        can_earn_daily: prev?.can_earn_daily ?? (user.can_earn_daily ?? true),
        new_password: prev?.new_password ?? ""
      }))
    }
  }, [user, isLoading])

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setEditData(prev => ({ ...prev, profile_image: base64Data }));
        toast.info("Profile image updated in preview. Click 'Save All Changes' to save.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setShowSaveConfirm(true)
  }

  const executeSave = async () => {
    setIsSaving(true)
    try {
      const token = CookieManager.get("sec-admin-token") || (typeof document !== "undefined" ? document.cookie.split("; ").find(row => row.trim().startsWith("sec-admin-token="))?.split("=")[1] : null);
      
      const payload = { ...editData };
      if (!payload.country_id || payload.country_id === "none") {
        delete payload.country_id;
      }
      if (!payload.new_password || !payload.new_password.trim()) {
        delete payload.new_password;
      } else {
        payload.new_password = payload.new_password.trim();
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "https://tradefluxbot-backend-5gbk.onrender.com/api"}/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (res.ok && (data.success !== false)) {
        toast.success(data.message || "Customer profile updated successfully")
        setEditData(prev => ({ ...prev, new_password: "" }))
        refetch()
        queryClient.invalidateQueries()
      } else {
        toast.error(data.message || data.error || "Failed to update customer profile")
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while saving changes")
    } finally {
      setIsSaving(false)
      setShowSaveConfirm(false)
    }
  }

  const handleProcessFinance = async (actionType) => {
    const dataObj = actionType === 'credit' ? creditData : debitData;

    if (!dataObj.amount || Number(dataObj.amount) <= 0) {
      toast.error("Please enter a valid amount")
      return;
    }

    setSecurityModal({
      isOpen: true,
      actionType,
      password: ''
    });
  }

  const handleConfirmProcessFinance = async () => {
    const { actionType, password } = securityModal;
    const dataObj = actionType === 'credit' ? creditData : debitData;
    const setProcessing = actionType === 'credit' ? setIsCreditProcessing : setIsDebitProcessing;

    if (!password) {
      toast.error("Admin password is required")
      return;
    }

    setProcessing(true)
    setSecurityModal(prev => ({ ...prev, isOpen: false }))
    try {
      const token = CookieManager.get("sec-admin-token") || document.cookie.split("; ").find(row => row.trim().startsWith("sec-admin-token="))?.split("=")[1];
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "https://tradefluxbot-backend-5gbk.onrender.com/api"}/admin/users/${id}/${actionType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(dataObj.amount),
          balance_type: dataObj.balance_type,
          reason: dataObj.reason,
          adminPassword: password
        })
      })

      const resData = await res.json()
      if (res.ok) {
        toast.success(resData.message || `Customer balance ${actionType}ed successfully`)
        if (actionType === 'credit') {
          setCreditData({ balance_type: "main", amount: "", reason: "" })
        } else {
          setDebitData({ balance_type: "main", amount: "", reason: "" })
        }
        refetch()
        queryClient.invalidateQueries()
      } else {
        toast.error(resData.message || resData.error || `Failed to ${actionType} customer balance`)
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while processing transaction")
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteUser = () => {
    setShowDeleteConfirm(true)
  }

  const executeDeleteUser = async () => {
    if (deletingRef.current) return
    deletingRef.current = true
    setIsDeleting(true)
    try {
      const token = CookieManager.get("sec-admin-token") || document.cookie.split("; ").find(row => row.trim().startsWith("sec-admin-token="))?.split("=")[1];
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "https://tradefluxbot-backend-5gbk.onrender.com/api"}/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (res.ok) {
        toast.success("User deleted successfully")
        queryClient.invalidateQueries()
        router.push("/customers")
      } else {
        const data = await res.json()
        toast.error(data.message || data.error || "Failed to delete user")
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while deleting user")
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
      deletingRef.current = false
    }
  }

  const handleImpersonate = async () => {
    setIsImpersonating(true)
    try {
      const adminToken = CookieManager.get("sec-admin-token") || document.cookie.split("; ").find(row => row.trim().startsWith("sec-admin-token="))?.split("=")[1];
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "https://tradefluxbot-backend-5gbk.onrender.com/api"}/admin/users/${id}/impersonate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminToken}`
        }
      })
      const data = await res.json()
      if (res.ok && data.token) {
        // Set cookie on main domain if in production
        const isLocal = window.location.hostname.includes('localhost');
        const targetUrl = isLocal ? 'http://localhost:3000/dashboard' : 'https://tradefluxbot.com/dashboard';

        document.cookie = `sec-prd-token=${data.token}; path=/; max-age=7200; SameSite=Lax${!isLocal ? '; domain=.tradefluxbot.com; Secure' : ''}`;

        window.open(targetUrl, '_blank')
      } else {
        toast.error(data.message || data.error || "Failed to impersonate user")
      }
    } catch (error) {
      toast.error(error.message || "An error occurred during impersonation")
    } finally {
      setIsImpersonating(false)
    }
  }

  const getIsCredit = (tx) => {
    const typeLower = (tx.type || "").toLowerCase();
    const descLower = (tx.description || "").toLowerCase();
    if (
      typeLower.includes('debit') ||
      typeLower.includes('cost') ||
      typeLower.includes('withdraw') ||
      typeLower.includes('invest') ||
      typeLower.includes('plan')
    ) {
      return false;
    }
    if (
      typeLower.includes('deposit') ||
      typeLower.includes('reward') ||
      typeLower.includes('bonus') ||
      typeLower.includes('gift') ||
      typeLower.includes('checkin') ||
      typeLower.includes('check-in') ||
      typeLower.includes('credit') ||
      typeLower.includes('commission') ||
      typeLower.includes('referral') ||
      typeLower.includes('migration') ||
      typeLower.includes('profit') ||
      typeLower.includes('payout') ||
      typeLower.includes('refund') ||
      descLower.includes('refund') ||
      descLower.includes('payout') ||
      descLower.includes('profit')
    ) {
      return true;
    }
    if (tx.balance_before !== undefined && tx.balance_after !== undefined && tx.balance_before !== null && tx.balance_after !== null) {
      const diff = parseFloat(tx.balance_after) - parseFloat(tx.balance_before);
      if (diff !== 0) {
        return diff > 0;
      }
    }
    return false;
  };

  if (isLoading) {
    return <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4"><Loader2 className="w-8 h-8 animate-spin text-[#0073b6]" /><p className="text-muted-foreground text-sm">Loading user data...</p></div>
  }

  if (!user || user.error) {
    return <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <XCircle className="w-12 h-12 text-red-500" />
      <p className="text-foreground font-medium">{user?.error || "User not found or an error occurred."}</p>
      <Button variant="outline" onClick={() => router.push("/customers")}>Go Back to Customers</Button>
    </div>
  }

  if (!editData) {
    return <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4"><Loader2 className="w-8 h-8 animate-spin text-[#0073b6]" /><p className="text-muted-foreground text-sm">Preparing editor...</p></div>
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-full bg-background shadow-sm border-border">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
            <p className="text-sm text-muted-foreground">Manage profile, balances, permissions, and history</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button variant="outline" className="text-white border-red-500 bg-red-500/100 hover:bg-red-600 hover:text-white rounded-sm-sm px-4 py-5" onClick={handleDeleteUser} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash className="w-4 h-4 mr-0.5" />}
            Delete User
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-[#0073b6] hover:bg-[#00629b] text-white shadow-sm py-5 px-6 rounded-sm-sm">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save All Changes
          </Button>
          <Button onClick={handleImpersonate} disabled={isImpersonating} className="bg-slate-800 hover:bg-slate-700 text-white shadow-sm py-5 px-6 rounded-sm-sm border border-slate-700">
            {isImpersonating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserCheck className="w-4 h-4 mr-2" />}
            Login As User
          </Button>
        </div>
      </div>

      {/* ROW 1: USER INFORMATION & EDIT PROFILE */}
      <Card className="border-border shadow-sm overflow-hidden bg-card">
        <CardHeader className="pb-4 border-b border-border bg-muted/20">
          <h2 className="text-lg font-semibold text-black flex items-center gap-2">
            <User className="w-5 h-5 text-gray-500" />
            User Information & Profile Edit
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* Left Col: Identity & Stats */}
            <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-border flex flex-col items-center lg:items-start text-center lg:text-left bg-muted/5">
              <div className="relative group mb-4">
                <Avatar className="w-24 h-24 rounded-full border-4 border-card shadow-sm shrink-0 overflow-hidden">
                  <AvatarImage 
                    src={editData?.profile_image || user.profile_image} 
                    alt={user.full_name || user.username || "User profile"} 
                    className="object-cover" 
                  />
                  <AvatarFallback className="bg-[#0073b6] text-white text-3xl font-bold">
                    {(user.full_name || user.username || user.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="profile-image-upload" 
                  className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[11px] font-medium"
                  title="Upload / Change User Photo"
                >
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span>Change</span>
                </label>
                <input 
                  id="profile-image-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
              </div>
              <h2 className="text-xl font-bold text-foreground">{user.full_name || user.username || "Unnamed User"}</h2>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1 mb-3 justify-center lg:justify-start">
                <Mail className="w-4 h-4" /> {user.email || "N/A"}
              </div>
              <div className="mb-6">
                <StatusBadge status={user.is_active ? "ACTIVE" : "BANNED"} />
              </div>

              <div className="w-full space-y-3 pt-6 border-t border-border/50 text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-muted-foreground flex items-center gap-2"><Hash className="w-3.5 h-3.5" /> User ID</span>
                  <span className="font-mono text-foreground bg-muted px-2 py-0.5 rounded text-xs">{(user.id || "").substring(0, 12)}...</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Registered</span>
                  <span className="font-medium text-foreground">{safeFormatDate(user.created_at, "MMM dd, yyyy")}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-muted-foreground flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Country</span>
                  <span className="font-medium text-foreground">{user.country?.country_name || "N/A"}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Last Login</span>
                  <span className="font-medium text-foreground">{safeFormatDate(user.last_login, "MMM dd, HH:mm")}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-muted-foreground flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> IP Address</span>
                  <span className="font-medium text-foreground">{user.last_ip === "::1" ? "127.0.0.1 (Local)" : (user.last_ip || "Unknown")}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-muted-foreground flex items-center gap-2"><Share2 className="w-3.5 h-3.5" /> Referral Code</span>
                  <span className="font-mono text-foreground bg-muted px-2 py-0.5 rounded text-xs flex items-center gap-1 font-bold">
                    {user.referral_code || "N/A"}
                    {user.referral_code && (
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== "undefined") {
                            navigator.clipboard.writeText(user.referral_code);
                            toast.success("Referral code copied to clipboard");
                          }
                        }}
                        className="hover:text-[#0073b6] text-muted-foreground ml-1"
                        title="Copy referral code"
                      >
                        <Copy className="w-3 h-3 cursor-pointer" />
                      </button>
                    )}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-muted-foreground flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Upliner</span>
                  {user.upliner ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/customers/${user.upliner.id}`)}
                      className="text-[#0073b6] hover:underline font-bold text-xs flex items-center gap-1 text-right"
                    >
                      {user.upliner.full_name || user.upliner.username}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">None (Direct)</span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-muted-foreground flex items-center gap-2"><GitFork className="w-3.5 h-3.5" /> Total Downlines</span>
                  <span className="font-bold text-xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {user.downliners_summary?.total_team_count || user.downliners?.length || 0} members
                  </span>
                </div>
              </div>
            </div>

            {/* Right Col: Balances & Edit Form */}
            <div className="lg:col-span-8 p-6 space-y-8">
              {/* Balances */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Main Balance</p>
                    <h3 className="text-2xl font-bold text-foreground">{symbol}{Number(user.balance || 0).toFixed(2)}</h3>
                  </div>
                  <div className="p-2.5 bg-blue-500/10 rounded-xl hidden sm:block"><CreditCard className="w-5 h-5 text-blue-500" /></div>
                </div>
                <div className="bg-[#0073b6]/5 border border-[#0073b6]/10 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#0073b6] uppercase tracking-wider mb-1">Withdrawable</p>
                    <h3 className="text-2xl font-bold text-foreground">{symbol}{Number(user.withdrawable_balance || 0).toFixed(2)}</h3>
                  </div>
                  <div className="p-2.5 bg-[#0073b6]/10 rounded-xl hidden sm:block"><WalletCards className="w-5 h-5 text-[#0073b6]" /></div>
                </div>
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Edit Profile Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-foreground">Full Name</Label>
                    <Input value={editData.full_name} onChange={(e) => setEditData({ ...editData, full_name: e.target.value })} className="bg-background border-border text-foreground h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Username</Label>
                    <Input value={editData.username} onChange={(e) => setEditData({ ...editData, username: e.target.value })} className="bg-background border-border text-foreground h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Email Address</Label>
                    <Input value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="bg-background border-border text-foreground h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center gap-2"><Globe className="w-4 h-4" /> Country</Label>
                    <Select value={editData.country_id || "none"} onValueChange={(val) => setEditData({ ...editData, country_id: val === "none" ? null : val })}>
                      <SelectTrigger className="h-10 bg-background border-border text-foreground"><SelectValue placeholder="Select Country" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select Country</SelectItem>
                        {countries.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.country_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Account Status</Label>
                    <Select value={editData.is_active ? "active" : "banned"} onValueChange={(val) => setEditData({ ...editData, is_active: val === "active" })}>
                      <SelectTrigger className="h-10 bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2 pt-2">
                    <Label className="text-foreground flex items-center gap-2"><KeyRound className="w-4 h-4" /> Reset Password</Label>
                    <Input type="text" placeholder="Enter new password (optional)" value={editData.new_password} onChange={(e) => setEditData({ ...editData, new_password: e.target.value })} className="bg-background border-border text-foreground h-10" />
                    <p className="text-xs text-muted-foreground mt-1">Leave blank to keep the current password unchanged.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* ROW 2: BALANCE ADJUSTMENT */}
      <Card className="border-border shadow-sm overflow-hidden bg-card">
        <CardHeader className="pb-4 border-b border-border bg-background">
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <WalletCards className="w-5 h-5 text-gray-500" />
            Balance Adjustment
          </h2>
          <div className="w-full h-0.5 bg-[#0073b6] mt-4 rounded-full"></div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Credit Balance Box */}
            <div className="border-2 border-dashed border-border rounded-xl p-6 bg-emerald-500/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20"></div>
              <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold text-lg mb-6">
                <PlusCircle className="w-5 h-5" />
                Credit Balance
              </div>

              <div className="space-y-4">
                <Select value={creditData.balance_type} onValueChange={(val) => setCreditData({ ...creditData, balance_type: val })}>
                  <SelectTrigger className="bg-background border-border text-foreground h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Balance</SelectItem>
                    <SelectItem value="withdrawable">Withdrawable Balance</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={creditData.amount}
                  onChange={(e) => setCreditData({ ...creditData, amount: e.target.value })}
                  className="bg-background border-border text-foreground h-11"
                />

                <Input
                  type="text"
                  placeholder="Reason (optional)"
                  value={creditData.reason}
                  onChange={(e) => setCreditData({ ...creditData, reason: e.target.value })}
                  className="bg-background border-border text-foreground h-11"
                />

                <Button
                  onClick={() => handleProcessFinance('credit')}
                  disabled={isCreditProcessing}
                  className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-base mt-2"
                >
                  {isCreditProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Funds
                </Button>
              </div>
            </div>

            {/* Debit Balance Box */}
            <div className="border-2 border-dashed border-border rounded-xl p-6 bg-red-500/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20"></div>
              <div className="flex items-center justify-center gap-2 text-red-500 font-bold text-lg mb-6">
                <MinusCircle className="w-5 h-5" />
                Debit Balance
              </div>

              <div className="space-y-4">
                <Select value={debitData.balance_type} onValueChange={(val) => setDebitData({ ...debitData, balance_type: val })}>
                  <SelectTrigger className="bg-background border-border text-foreground h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Balance</SelectItem>
                    <SelectItem value="withdrawable">Withdrawable Balance</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={debitData.amount}
                  onChange={(e) => setDebitData({ ...debitData, amount: e.target.value })}
                  className="bg-background border-border text-foreground h-11"
                />

                <Input
                  type="text"
                  placeholder="Reason (optional)"
                  value={debitData.reason}
                  onChange={(e) => setDebitData({ ...debitData, reason: e.target.value })}
                  className="bg-background border-border text-foreground h-11"
                />

                <Button
                  onClick={() => handleProcessFinance('debit')}
                  disabled={isDebitProcessing}
                  className="w-full h-11 bg-red-500 hover:bg-red-600 text-white font-medium text-base mt-2"
                >
                  {isDebitProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Minus className="w-4 h-4 mr-2" />}
                  Deduct Funds
                </Button>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* ROW 3: PERMISSIONS */}
      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="pb-4 border-b border-border bg-background">
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-gray-500" />
            Account Permissions
          </h2>
          <div className="w-full h-0.5 bg-[#0073b6] mt-4 rounded-full"></div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <Label className="text-muted-foreground font-medium text-sm">Allow Deposits</Label>
              <Select value={editData.can_deposit ? "yes" : "no"} onValueChange={(val) => setEditData({ ...editData, can_deposit: val === "yes" })}>
                <SelectTrigger className="h-11 bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground font-medium text-sm">Allow Withdrawals</Label>
              <Select value={editData.can_withdraw ? "yes" : "no"} onValueChange={(val) => setEditData({ ...editData, can_withdraw: val === "yes" })}>
                <SelectTrigger className="h-11 bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground font-medium text-sm">Daily Earnings</Label>
              <Select value={editData.can_earn_daily ? "yes" : "no"} onValueChange={(val) => setEditData({ ...editData, can_earn_daily: val === "yes" })}>
                <SelectTrigger className="h-11 bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-5 bg-red-500/5 rounded-xl border border-red-500/20">
            <div className="space-y-1">
              <Label className="font-bold text-foreground text-base">Account Access (Ban User)</Label>
              <p className="text-sm text-muted-foreground">
                {editData.is_active ? "User can currently log in and use the platform." : "User is blocked from accessing the platform."}
              </p>
            </div>
            <Switch checked={editData.is_active} onCheckedChange={(checked) => setEditData({ ...editData, is_active: checked })} />
          </div>
        </CardContent>
      </Card>


      {/* UPLINER (SPONSOR DETAILS) CARD */}
      <Card className="border-border shadow-sm overflow-hidden bg-card">
        <CardHeader className="pb-4 border-b border-border bg-background">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-bold text-black flex items-center gap-2">
                Upliner (Sponsor Details)
                {user.upliner && (
                  <Badge showDot={false} className="bg-blue-500/10 text-[#0073b6] border border-blue-500/20 text-xs font-semibold">
                    Referral Sponsor
                  </Badge>
                )}
              </h2>
            </div>
            {user.upliner && (
              <Button
                onClick={() => router.push(`/customers/${user.upliner.id}`)}
                size="sm"
                className="bg-[#0073b6] hover:bg-[#00629b] text-white text-xs h-8 px-3 font-semibold shadow-sm"
              >
                View Upliner Profile <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
          </div>
          <div className="w-full h-0.5 bg-[#0073b6] mt-4 rounded-full"></div>
        </CardHeader>
        <CardContent className="p-6">
          {user.upliner ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Upliner Identity */}
              <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-xl border border-border">
                <Avatar className="h-16 w-16 border-2 border-border shadow-sm shrink-0">
                  <AvatarImage src={user.upliner.profile_image} />
                  <AvatarFallback className="bg-blue-500/10 text-[#0073b6] text-xl font-bold">
                    {(user.upliner.full_name || user.upliner.username || "U").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-foreground truncate">
                      {user.upliner.full_name}
                    </h3>
                    <StatusBadge status={user.upliner.is_active ? "active" : "banned"} />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <User className="w-3 h-3 shrink-0" /> @{user.upliner.username || "no-username"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 shrink-0" /> {user.upliner.email}
                  </p>
                </div>
              </div>

              {/* Upliner Metadata */}
              <div className="space-y-2.5 p-4 bg-muted/20 rounded-xl border border-border text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Country:</span>
                  <span className="font-semibold text-foreground">{user.upliner.country || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5" /> Referral Code:</span>
                  <span className="font-mono bg-background border border-border px-2 py-0.5 rounded text-foreground font-bold">{user.upliner.referral_code}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Joined:</span>
                  <span className="font-medium text-foreground">{safeFormatDate(user.upliner.created_at, "MMM dd, yyyy")}</span>
                </div>
              </div>

              {/* Upliner Financials & Commission from this User */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 flex flex-col justify-center">
                  <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Upliner Balance</p>
                  <p className="text-lg font-bold text-foreground">{symbol}{Number(user.upliner.balance || 0).toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Withdrawable: {symbol}{Number(user.upliner.withdrawable_balance || 0).toFixed(2)}</p>
                </div>
                <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 flex flex-col justify-center">
                  <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Earned From User</p>
                  <p className="text-lg font-bold text-emerald-600">+{symbol}{Number(user.upliner.total_commission_from_user || 0).toFixed(2)}</p>
                  <p className="text-[10px] text-emerald-700/80 mt-0.5">Deposit commissions</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-5 rounded-xl bg-muted/30 border border-border">
              <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Direct Registration (No Upliner)</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  This customer registered directly without using any referral link or sponsor code, placing them at the root level of the referral hierarchy.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ROW 4: RECENT TRANSACTIONS / HISTORY */}
      <Card className="border-border shadow-sm overflow-hidden bg-card">
        <CardHeader className="pb-0 border-b border-border bg-background">
          <div className="flex items-center gap-2 mb-4">
            <ListOrdered className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-black">
              User History
            </h2>
          </div>
          <div className="flex overflow-x-auto gap-2">
            <button onClick={() => setActiveHistoryTab('transactions')} className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${activeHistoryTab === 'transactions' ? 'text-[#0073b6] border-[#0073b6]' : 'text-muted-foreground border-transparent hover:text-foreground'}`}>
              Recent Transactions
            </button>
            <button onClick={() => setActiveHistoryTab('investments')} className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${activeHistoryTab === 'investments' ? 'text-[#0073b6] border-[#0073b6]' : 'text-muted-foreground border-transparent hover:text-foreground'}`}>
              Active Investments
            </button>
            <button onClick={() => setActiveHistoryTab('downliners')} className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 flex items-center gap-1.5 ${activeHistoryTab === 'downliners' ? 'text-[#0073b6] border-[#0073b6]' : 'text-muted-foreground border-transparent hover:text-foreground'}`}>
              Downliners / Network
              <span className="bg-blue-500/10 text-[#0073b6] text-xs px-2 py-0.5 rounded-full font-bold">
                {user.downliners?.length || 0}
              </span>
            </button>
            <button onClick={() => setActiveHistoryTab('commissions')} className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 flex items-center gap-1.5 ${activeHistoryTab === 'commissions' ? 'text-[#0073b6] border-[#0073b6]' : 'text-muted-foreground border-transparent hover:text-foreground'}`}>
              Referral Commissions
              <span className="bg-emerald-500/10 text-emerald-600 text-xs px-2 py-0.5 rounded-full font-bold">
                {user.referral_commissions?.length || 0}
              </span>
            </button>
          </div>
        </CardHeader>

        {activeHistoryTab === 'transactions' && (
          <div className="overflow-x-auto p-0">
            <Table className="min-w-[1000px] whitespace-nowrap">
              <TableHeader className="bg-muted/30 border-b border-border">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">ID</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">TYPE</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">AMOUNT</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">DESCRIPTION</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">DATE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(user.transactions) && user.transactions.length > 0 ? (
                  user.transactions.map((tx) => (
                    <TableRow key={tx.id} className="border-b border-border hover:bg-muted/20">
                      <TableCell className="font-medium text-sm text-foreground">{(tx.id || "").substring(0, 8)}...</TableCell>
                      <TableCell>
                        <Badge showDot={false} className="bg-muted text-foreground border border-border text-xs font-medium shadow-sm">{(tx.type || "").replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell className={`font-bold text-sm ${getIsCredit(tx) ? 'text-emerald-500' : 'text-red-500'}`}>
                        {getIsCredit(tx) ? '+' : '-'}{symbol}{Math.abs(tx.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate" title={tx.description || "N/A"}>
                        {tx.description || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {safeFormatDate(tx.created_at, "MMM dd, yyyy HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground text-sm border-none">
                      No recent transactions
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {activeHistoryTab === 'investments' && (
          <div className="overflow-x-auto p-0">
            <Table className="min-w-[1000px] whitespace-nowrap">
              <TableHeader className="bg-muted/30 border-b border-border">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">PLAN ID</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">AMOUNT</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">STATUS</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">CREATED</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(user.investments) && user.investments.length > 0 ? (
                  user.investments.map((inv) => (
                    <TableRow key={inv.id} className="border-b border-border hover:bg-muted/20">
                      <TableCell className="font-medium text-sm text-foreground">{(inv.plan_id || "").substring(0, 8)}...</TableCell>
                      <TableCell className="font-bold text-sm text-[#0073b6]">
                        {symbol}{Number(inv.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge showDot={false} className="bg-[#0073b6]/10 text-[#0073b6] border border-[#0073b6]/20 text-xs font-medium shadow-sm">{inv.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {safeFormatDate(inv.created_at, "MMM dd, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center text-muted-foreground text-sm border-none">
                      No active investments
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* DOWNLINERS / NETWORK TAB */}
        {activeHistoryTab === 'downliners' && (
          <div className="space-y-6 p-6">
            {/* Network Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/20 border border-border rounded-xl">
                <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Total Team</p>
                <h4 className="text-2xl font-bold text-foreground mt-1">{user.downliners_summary?.total_team_count || 0}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">All downline levels</p>
              </div>
              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                <p className="text-[11px] text-[#0073b6] font-bold uppercase tracking-wider">Level 1 (Direct)</p>
                <h4 className="text-2xl font-bold text-foreground mt-1">{user.downliners_summary?.level1_count || 0}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Directly referred</p>
              </div>
              <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                <p className="text-[11px] text-purple-600 font-bold uppercase tracking-wider">Level 2 (Indirect)</p>
                <h4 className="text-2xl font-bold text-foreground mt-1">{user.downliners_summary?.level2_count || 0}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Referred by Level 1</p>
              </div>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">Referral Profit</p>
                <h4 className="text-2xl font-bold text-emerald-600 mt-1">+{symbol}{Number(user.downliners_summary?.total_commission_earned || 0).toFixed(2)}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Total commissions earned</p>
              </div>
            </div>

            {/* Downliners Table */}
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table className="min-w-[1100px] whitespace-nowrap">
                <TableHeader className="bg-muted/40 border-b border-border">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">User</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">Level</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">Email</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">Country</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">Balance</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">Total Deposited</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">Invested</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">Profit Generated</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">Joined</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">Status</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(user.downliners) && user.downliners.length > 0 ? (
                    user.downliners.map((downliner) => (
                      <TableRow key={downliner.id} className="border-b border-border hover:bg-muted/20">
                        <TableCell className="font-medium text-sm text-foreground">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 border border-border">
                              <AvatarImage src={downliner.profile_image} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {(downliner.full_name || downliner.username || "D").substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground leading-none">{downliner.full_name}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">@{downliner.username || "no-username"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {downliner.level === 1 ? (
                            <Badge showDot={false} className="bg-blue-500/10 text-[#0073b6] border border-blue-500/20 text-xs font-semibold">
                              Level 1 (Direct)
                            </Badge>
                          ) : (
                            <Badge showDot={false} className="bg-purple-500/10 text-purple-600 border border-purple-500/20 text-xs font-semibold">
                              Level 2
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {downliner.email}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {downliner.country}
                        </TableCell>
                        <TableCell className="font-semibold text-sm text-foreground">
                          {symbol}{Number(downliner.balance || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="font-semibold text-sm text-[#0073b6]">
                          {symbol}{Number(downliner.total_deposited || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="font-semibold text-sm text-foreground">
                          {symbol}{Number(downliner.total_invested || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="font-bold text-sm text-emerald-600">
                          +{symbol}{Number(downliner.commission_generated || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {safeFormatDate(downliner.created_at, "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={downliner.is_active ? "active" : "banned"} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => router.push(`/customers/${downliner.id}`)}
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 text-xs border-[#0073b6] text-[#0073b6] hover:bg-[#0073b6]/10 font-semibold"
                          >
                            View <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="h-40 text-center text-muted-foreground text-sm border-none">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users className="w-8 h-8 text-muted-foreground/40" />
                          <p className="font-medium text-foreground">No Downliners Found</p>
                          <p className="text-xs text-muted-foreground">This customer has not invited any downliners to the platform yet.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* REFERRAL COMMISSIONS TAB */}
        {activeHistoryTab === 'commissions' && (
          <div className="overflow-x-auto p-0">
            <Table className="min-w-[900px] whitespace-nowrap">
              <TableHeader className="bg-muted/30 border-b border-border">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">ID</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">Earned From</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">Level</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">Commission Payout</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider py-4">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(user.referral_commissions) && user.referral_commissions.length > 0 ? (
                  user.referral_commissions.map((comm) => (
                    <TableRow key={comm.id} className="border-b border-border hover:bg-muted/20">
                      <TableCell className="font-medium text-sm text-foreground">{(comm.id || "").substring(0, 8)}...</TableCell>
                      <TableCell className="text-sm font-semibold text-foreground">
                        {comm.from_user ? (
                          <div>
                            <p className="font-semibold text-foreground leading-tight">{comm.from_user.name}</p>
                            <p className="text-xs text-muted-foreground">{comm.from_user.email}</p>
                          </div>
                        ) : (
                          "Referred User"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge showDot={false} className="bg-blue-500/10 text-[#0073b6] border border-blue-500/20 text-xs font-semibold">
                          Level {comm.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-sm text-emerald-600">
                        +{symbol}{Number(comm.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {safeFormatDate(comm.created_at, "MMM dd, yyyy HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground text-sm border-none">
                      No referral commissions recorded
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px] border-border bg-card">
          <DialogHeader className="border-b border-border bg-muted/20 pb-4">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="pt-6 pb-6">
            <p className="text-muted-foreground">Are you absolutely sure you want to delete this user? This action cannot be undone and will remove all associated data including transactions and investments.</p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="border-border">Cancel</Button>
              <Button onClick={executeDeleteUser} disabled={isDeleting} className="bg-red-500 hover:bg-red-600 text-white">
                {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash className="w-4 h-4 mr-2" />}
                Yes, Delete User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Modal */}
      <Dialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <DialogContent className="sm:max-w-[425px] border-border bg-card">
          <DialogHeader className="border-b border-border bg-muted/20 pb-4">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Save className="w-5 h-5 text-[#0073b6]" />
              Confirm Changes
            </DialogTitle>
          </DialogHeader>
          <div className="pt-6 pb-6">
            <p className="text-muted-foreground">Are you sure you want to save these changes to the user's profile and permissions?</p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowSaveConfirm(false)} className="border-border bg-background">Cancel</Button>
              <Button onClick={executeSave} disabled={isSaving} className="bg-[#0073b6] hover:bg-[#00629b] text-white">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Verification Modal */}
      <Dialog 
        open={securityModal.isOpen} 
        onOpenChange={(open) => setSecurityModal(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="max-w-md bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Confirm Admin Verification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <p className="text-sm text-muted-foreground">
              You are about to {securityModal.actionType} <strong>{symbol}{Number(securityModal.actionType === 'credit' ? creditData.amount : debitData.amount).toFixed(2)}</strong> to this user's <strong>{securityModal.actionType === 'credit' ? creditData.balance_type : debitData.balance_type} balance</strong>.
            </p>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Enter Admin Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter your password to confirm"
                value={securityModal.password}
                onChange={(e) => setSecurityModal(prev => ({ ...prev, password: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmProcessFinance();
                }}
                className="bg-background border-border text-foreground"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setSecurityModal(prev => ({ ...prev, isOpen: false }))}
              className="border-border text-foreground bg-background hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmProcessFinance}
              className={`text-white ${securityModal.actionType === 'credit' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
