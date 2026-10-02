"use client"

import { useEffect, useState } from "react"
import { Info, User, Users, Check, Plus, Loader2, Save } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFetchData, usePut } from "@/hooks/useApi"

const ValidatedInput = ({ label, value, onChange, subText, icon: Icon, iconColor }) => (
  <div className="flex flex-col space-y-1">
    <label className="text-[12px] font-bold text-gray-700 flex items-center gap-1.5 mb-1">
      {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
      {label}
    </label>
    <div className="relative">
      <Input 
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 h-10 pr-10 text-gray-700 text-[13px] bg-white rounded-lg"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
        <Check className="w-4 h-4 text-blue-500" />
      </div>
    </div>
    {subText && (
      <p className="text-[11px] text-gray-400 mt-1">{subText}</p>
    )}
  </div>
)

export default function CommissionSettingsPage() {
  const { data: settings, isLoading } = useFetchData("/admin/settings/platform", "platformSettings")
  const updateSettingsMutation = usePut("/admin/settings/platform", "platformSettings")

  const [formData, setFormData] = useState({
    level1_commission: "0",
    level2_commission: "0",
    level3_commission: "0",
    level4_commission: "0",
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        level1_commission: settings.level1_commission || "0",
        level2_commission: settings.level2_commission || "0",
        level3_commission: settings.level3_commission || "0",
        level4_commission: settings.level4_commission || "0",
      })
    }
  }, [settings])

  const handleUpdate = () => {
    updateSettingsMutation.mutate({
      level1_commission: parseFloat(formData.level1_commission),
      level2_commission: parseFloat(formData.level2_commission),
      level3_commission: parseFloat(formData.level3_commission),
      level4_commission: parseFloat(formData.level4_commission),
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Update Commission Card */}
      <Card className="border-none shadow-sm bg-white rounded-lg">
        <CardContent className="p-8">
          <h2 className="text-[1.1rem] font-bold text-gray-800 mb-6">Update Commission</h2>

          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-lg mb-8 flex items-center gap-3">
            <Info className="w-5 h-5 flex-shrink-0 text-blue-500" />
            <p className="text-[13px] font-medium text-blue-800">
              Configure referral commission percentages for 4 levels. Commission is calculated as a percentage of the referred user's investment earnings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ValidatedInput 
              label="Level 1 Commission (%)" 
              value={formData.level1_commission} 
              onChange={(val) => setFormData(f => ({ ...f, level1_commission: val }))}
              subText="Direct referrals" 
              icon={User}
              iconColor="text-blue-600"
            />
            <ValidatedInput 
              label="Level 2 Commission (%)" 
              value={formData.level2_commission} 
              onChange={(val) => setFormData(f => ({ ...f, level2_commission: val }))}
              subText="Referrals of referrals" 
              icon={Users}
              iconColor="text-blue-600"
            />
            <ValidatedInput 
              label="Level 3 Commission (%)" 
              value={formData.level3_commission} 
              onChange={(val) => setFormData(f => ({ ...f, level3_commission: val }))}
              subText="Third level referrals" 
              icon={Users}
              iconColor="text-[#0073b6]"
            />
            <ValidatedInput 
              label="Level 4 Commission (%)" 
              value={formData.level4_commission} 
              onChange={(val) => setFormData(f => ({ ...f, level4_commission: val }))}
              subText="Fourth level referrals" 
              icon={Users}
              iconColor="text-indigo-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Information Card */}
      <Card className="border-none shadow-sm bg-white rounded-lg">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-[1.1rem] font-bold text-gray-800">Submit Your Information</h2>
          <Button 
            onClick={handleUpdate}
            disabled={updateSettingsMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 h-10 font-bold rounded-lg shadow-sm border-0 flex items-center gap-2"
          >
            {updateSettingsMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Update
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
