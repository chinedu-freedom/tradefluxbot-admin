"use client"

import { useState, useEffect } from "react"
import { HeadphonesIcon, Settings2, Check, Clock, Loader2, Save, Camera } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useForm, Controller } from "react-hook-form"
import { useFetchData, usePut } from "@/hooks/useApi"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import "react-quill-new/dist/quill.snow.css"

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

const ValidatedInput = ({ label, requiredNote, subText, icon: Icon, register, name, type="text" }) => (
  <div className="flex flex-col space-y-1">
    <label className="text-[13px] font-bold text-gray-700">{label}</label>
    <div className="relative">
      <Input 
        type={type}
        step={type === 'number' ? 'any' : undefined}
        {...register(name)}
        className="border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500/50 focus:border-blue-500/50 h-10 pr-10 text-gray-700 bg-white rounded-lg"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <Check className="w-4 h-4 text-blue-500" />
      </div>
    </div>
  </div>
)

const RichTextEditor = ({ label, control, name }) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      ["link"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"]
    ]
  };

  return (
    <div className="flex flex-col space-y-1 h-full">
      <label className="text-[13px] font-bold text-gray-700">{label}</label>
      <div className="rounded-lg border border-gray-200 overflow-hidden flex-1 flex flex-col bg-white">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <ReactQuill 
              theme="snow"
              modules={modules}
              value={field.value || ''} 
              onChange={field.onChange} 
              className="h-[150px] pb-10"
            />
          )}
        />
      </div>
    </div>
  );
}

export default function BasicSettingsPage() {
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const { data: settingsData, isLoading } = useFetchData("/admin/settings/platform", ["admin-platform-settings"])
  const updateSettingsMutation = usePut("/admin/settings/platform", ["admin-platform-settings"])
  
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      site_name: "",
      site_title: "",
      currency_name: "",
      currency_symbol: "",
      timezone: "UTC",
      registration_bonus: 0,
      welcome_bonus_destination: "deposit",
      telegram_support: "",
      whatsapp_floating_support: "",
      whatsapp_support: "",
      whatsapp_group: "",
      telegram_community: "",
      telegram_group: "",
      deposit_notice: "",
      withdrawal_notice: "",
      auto_withdrawal: false,
      deposit_bonus: 0,
      daily_withdrawal_limit: 0,
      withdrawal_open_time: "",
      withdrawal_close_time: "",
      require_investment_to_withdraw: false,
      min_investment_to_withdraw: 1,
      min_withdrawal: 10,
      max_withdrawal: 10000,
      withdrawal_charge: 2,
      min_deposit: 10,
      max_deposit: 100000,
      deposit_charge: 0,
    }
  });

  useEffect(() => {
    if (settingsData) {
      reset({
        site_name: settingsData.site_name || "",
        site_title: settingsData.site_title || "",
        currency_name: settingsData.currency_name || "",
        currency_symbol: settingsData.currency_symbol || "",
        timezone: settingsData.timezone || "UTC",
        registration_bonus: Number(settingsData.registration_bonus) || 0,
        welcome_bonus_destination: settingsData.welcome_bonus_destination || "deposit",
        telegram_support: settingsData.telegram_support || "",
        whatsapp_floating_support: settingsData.whatsapp_floating_support || "",
        whatsapp_support: settingsData.whatsapp_support || "",
        whatsapp_group: settingsData.whatsapp_group || "",
        telegram_community: settingsData.telegram_community || "",
        telegram_group: settingsData.telegram_group || "",
        deposit_notice: settingsData.deposit_notice || "",
        withdrawal_notice: settingsData.withdrawal_notice || "",
        auto_withdrawal: settingsData.auto_withdrawal ?? false,
        deposit_bonus: Number(settingsData.deposit_bonus) || 0,
        daily_withdrawal_limit: Number(settingsData.daily_withdrawal_limit) || 0,
        withdrawal_open_time: settingsData.withdrawal_open_time || "",
        withdrawal_close_time: settingsData.withdrawal_close_time || "",
        require_investment_to_withdraw: settingsData.require_investment_to_withdraw ?? false,
        min_investment_to_withdraw: settingsData.min_investment_to_withdraw || 1,
        min_withdrawal: Number(settingsData.min_withdrawal) || 10,
        max_withdrawal: Number(settingsData.max_withdrawal) || 10000,
        withdrawal_charge: Number(settingsData.withdrawal_charge) || 2,
        max_deposit: Number(settingsData.max_deposit) || 10000,
        min_deposit: Number(settingsData.min_deposit) || 10,
        deposit_charge: Number(settingsData.deposit_charge) || 0
      })
    }
  }, [settingsData, reset])

  const onSubmit = async (formData) => {
    try {
      let base64Logo = settingsData?.platform_logo || "";
      
      if (logoFile) {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(logoFile);
        });
        base64Logo = await base64Promise;
      }

      const payload = {
        ...formData,
        platform_logo: base64Logo,
        registration_bonus: Number(formData.registration_bonus),
        deposit_bonus: Number(formData.deposit_bonus),
        daily_withdrawal_limit: Number(formData.daily_withdrawal_limit),
        min_investment_to_withdraw: Number(formData.min_investment_to_withdraw),
        min_withdrawal: Number(formData.min_withdrawal),
        max_withdrawal: Number(formData.max_withdrawal),
        withdrawal_charge: Number(formData.withdrawal_charge),
        min_deposit: Number(formData.min_deposit),
        max_deposit: Number(formData.max_deposit),
        deposit_charge: Number(formData.deposit_charge)
      }
      await updateSettingsMutation.mutateAsync(payload)
      if (typeof window !== "undefined" && formData.currency_symbol) {
        localStorage.setItem("admin-platform-settings-symbol", formData.currency_symbol);
        window.dispatchEvent(new Event("storage"));
      }
    } catch (error) {
    }
  }

  const isSubmitting = updateSettingsMutation.isPending

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-muted-foreground text-sm">Loading basic settings...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-10">
      
      {/* Section 1: Update Settings */}
      <Card className="border-none shadow-sm bg-white rounded-lg">
        <CardContent className="p-8">
          <h2 className="text-[1.2rem] font-bold text-gray-800 mb-6">Update Settings</h2>
          
          {/* Logo Upload Section */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex-1">
              <label className="text-[13px] font-bold text-gray-700 flex items-center gap-1 mb-1">
                Platform Logo <span className="text-[11px] font-normal text-gray-400">(For header display)</span>
              </label>
              <div className="border border-gray-200 rounded-lg flex items-center h-10 w-full overflow-hidden relative bg-white shadow-sm">
                <input 
                  id="platform-logo-upload"
                  type="file" 
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFileName(file.name);
                      setPreviewUrl(URL.createObjectURL(file));
                      setLogoFile(file);
                    } else {
                      setFileName("");
                      setPreviewUrl("");
                      setLogoFile(null);
                    }
                  }}
                />
                <button type="button" className="bg-gray-50 border-r border-gray-200 px-4 h-full text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors pointer-events-none">
                  Choose file
                </button>
                <span className="px-4 text-sm text-gray-400 truncate flex-1">{fileName || "No file chosen"}</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Suggested size: 48x48px (Square image)</p>
            </div>
            <div className="flex-1">
              <label htmlFor="platform-logo-upload" className="w-24 h-24 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors block overflow-hidden shadow-sm">
                <div className="w-full h-full flex items-center justify-center relative">
                  {(previewUrl || settingsData?.platform_logo) ? (
                    <img src={previewUrl || settingsData?.platform_logo} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <ValidatedInput label="Site Name" name="site_name" register={register} requiredNote={true} />
            <ValidatedInput label="Site Title" name="site_title" register={register} requiredNote={true} />
            
            <ValidatedInput label="Currency Name" name="currency_name" register={register} requiredNote={true} />
            <ValidatedInput label="Currency Symbol" name="currency_symbol" register={register} requiredNote={true} />
            
            <div className="flex flex-col space-y-1">
              <label className="text-[13px] font-bold text-gray-700">Timezone</label>
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500/50 focus:ring-0 h-10 rounded-lg text-gray-700 text-[13px] bg-white">
                      <SelectValue placeholder="Select Timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">EST</SelectItem>
                      <SelectItem value="PST">PST</SelectItem>
                      <SelectItem value="GMT">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <ValidatedInput label="Registration Bonus" name="registration_bonus" type="number" register={register} requiredNote={false} />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Contact & Support Links */}
      <Card className="border-none shadow-sm bg-white rounded-lg pb-10">
        <CardContent className="p-8">
          <div className="mb-6">
            <h2 className="text-[1.2rem] font-bold text-blue-600 flex items-center gap-2">
              <HeadphonesIcon className="w-5 h-5" />
              Contact & Support Links
            </h2>
            <p className="text-[12px] text-gray-400 mt-1">Configure support contact links displayed on the Help page</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <ValidatedInput 
              label="Floating WhatsApp Support (Bottom-Left Widget)" 
              name="whatsapp_floating_support"
              register={register}
              subText="Phone number or wa.me link for floating support widget (e.g. +44 7344 560920)" 
            />
            <ValidatedInput 
              label="Dashboard WhatsApp Support (Grid Icon and Help)" 
              name="whatsapp_support"
              register={register}
              subText="Phone number or wa.me link for dashboard support icon (e.g. +44 7344 931677)" 
            />
            <ValidatedInput 
              label="WhatsApp Group Link (Popup Modal and Help)" 
              name="whatsapp_group"
              register={register}
              subText="WhatsApp community group link (e.g. https://chat.whatsapp.com/...)" 
            />
            <ValidatedInput 
              label="Telegram Community Channel" 
              name="telegram_community"
              register={register}
              subText="Public Telegram channel for announcements (e.g. https://t.me/tradefluxbotgroup)" 
            />
            <ValidatedInput 
              label="Telegram Group Chat" 
              name="telegram_group"
              register={register}
              subText="Telegram group for community discussions and member interactions" 
            />
            <ValidatedInput 
              label="Telegram Support (Customer Service)" 
              name="telegram_support"
              register={register}
              subText="Direct link to your Telegram support account for customer inquiries" 
            />
            
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-2">
              <div className="h-full">
                <RichTextEditor 
                  label="Recharge Notice"
                  name="deposit_notice"
                  control={control}
                />
              </div>
              <div className="h-full">
                <RichTextEditor 
                  label="Withdraw Notice"
                  name="withdrawal_notice"
                  control={control}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Deposit & Withdrawal Settings */}
      <Card className="border-none shadow-sm bg-white rounded-lg">
        <CardContent className="p-8">
          <div className="mb-6">
            <h2 className="text-[1.2rem] font-bold text-blue-600 flex items-center gap-2 mb-4">
              <Settings2 className="w-5 h-5" />
              Deposit & Withdrawal Settings
            </h2>
            
            <div className="flex items-start gap-3">
              <Controller
                name="auto_withdrawal"
                control={control}
                render={({ field }) => (
                  <Switch 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                )}
              />
              <div>
                <label className="text-[13px] font-bold text-gray-700 block mb-0.5">Auto Withdrawal</label>
                <p className="text-[12px] text-gray-500 leading-relaxed">
                  If enabled, withdrawals will be automatically processed using the configured automatic gateway for the user's country. When disabled, all withdrawals will be queued for manual admin approval.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-8">
            <ValidatedInput 
              label="Deposit Bonus (%)" 
              name="deposit_bonus"
              type="number"
              register={register}
              subText="Percentage bonus added to user deposits (0 = disabled)" 
            />
            <ValidatedInput 
              label="Daily Withdrawal Limit (times)" 
              name="daily_withdrawal_limit"
              type="number"
              register={register}
              subText="How many times a user can withdraw per day" 
            />
            <ValidatedInput 
              label="Minimum Deposit" 
              name="min_deposit"
              type="number"
              register={register}
              subText="Minimum amount a user can deposit" 
            />
            <ValidatedInput 
              label="Maximum Deposit" 
              name="max_deposit"
              type="number"
              register={register}
              subText="Maximum amount a user can deposit per request" 
            />
            <ValidatedInput 
              label="Deposit Charge (%)" 
              name="deposit_charge"
              type="number"
              register={register}
              subText="Percentage fee applied to deposits" 
            />
            <ValidatedInput 
              label="Minimum Payout" 
              name="min_withdrawal"
              type="number"
              register={register}
              subText="Minimum amount a user can withdraw" 
            />
            <ValidatedInput 
              label="Maximum Payout" 
              name="max_withdrawal"
              type="number"
              register={register}
              subText="Maximum amount a user can withdraw per request" 
            />
            <ValidatedInput 
              label="Payout Charge (%)" 
              name="withdrawal_charge"
              type="number"
              register={register}
              subText="Percentage fee applied to withdrawals" 
            />
            <ValidatedInput 
              label="Withdrawal Opening Time" 
              name="withdrawal_open_time"
              register={register}
              icon={Clock}
              subText="Time when withdrawals open (24-hour format)" 
            />
            <ValidatedInput 
              label="Withdrawal Closing Time" 
              name="withdrawal_close_time"
              register={register}
              icon={Clock}
              subText="Time when withdrawals close (24-hour format)" 
            />
            
            <div className="flex flex-col space-y-1">
              <label className="text-[13px] font-bold text-gray-700">Require Investment to Withdraw</label>
              <Controller
                name="require_investment_to_withdraw"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ? "yes" : "no"} onValueChange={(val) => field.onChange(val === "yes")}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500/50 focus:ring-0 h-10 rounded-lg text-gray-700 text-[13px] bg-white">
                      <SelectValue placeholder="Select Requirement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes - Users must have active investment</SelectItem>
                      <SelectItem value="no">No - Anyone can withdraw</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-[11px] text-blue-600 mt-1">If enabled, users must have at least 1 active mining plan to withdraw</p>
            </div>

            <ValidatedInput 
              label="Minimum Investments Required" 
              name="min_investment_to_withdraw"
              type="number"
              register={register}
              subText="Minimum number of active investments required to withdraw" 
            />
          </div>

          <div className="mt-10">
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-10 font-bold rounded-lg shadow-sm border-0 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
