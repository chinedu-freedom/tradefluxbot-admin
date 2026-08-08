"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, ShieldAlert, KeyRound, Loader2, Save, Eye, EyeOff } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFetchData, usePut } from "@/hooks/useApi"
import { toast } from "sonner"

export default function SecuritySettingsPage() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { data: securityData, isLoading, refetch } = useFetchData("/admin/settings/security", ["admin-security-settings"])
  const updatePasswordMutation = usePut("/admin/settings/security", ["admin-security-settings"])

  useEffect(() => {
    if (securityData?.password) {
      setPassword(securityData.password)
    }
  }, [securityData])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!password) {
      toast.error("Password cannot be empty")
      return
    }
    try {
      await updatePasswordMutation.mutateAsync({ password })
      toast.success("Verification password updated successfully!")
      refetch()
    } catch (err) {
      toast.error(err?.message || "Failed to update verification password")
    }
  }

  const isSubmitting = updatePasswordMutation.isPending

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-muted-foreground text-sm">Loading security configuration...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#475f7b] mb-1">Verification Password</h1>
        <p className="text-gray-500 text-sm">Reset the security verification password used to authorize manual user balance adjustments (credit/debit).</p>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-lg">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-amber-800 font-bold text-sm">Important Security Notice</h4>
              <p className="text-xs text-amber-700/90 mt-1 leading-relaxed">
                This verification password is used to authenticate manual additions or deductions on any user's main or withdrawable balances. Make sure it is kept confidential and only shared with authorized managers.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-700 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-gray-400" />
                Current/New Verification Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 h-10 pr-10 text-gray-700 bg-white rounded-lg font-mono"
                  placeholder="Enter secure verification password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Default password: <span className="font-mono">Kr!ptex@77$$</span></p>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 font-bold rounded-lg shadow-sm border-0 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
