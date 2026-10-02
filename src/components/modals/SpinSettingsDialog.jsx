"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { usePut } from "@/hooks/useApi";

const settingsSchema = z.object({
  feature_enabled: z.boolean(),
  cost_per_spin: z.coerce.number().min(0),
  free_spins_per_deposit: z.coerce.number().min(0),
  daily_referral_target: z.coerce.number().min(0),
  spins_for_daily_challenge: z.coerce.number().min(0),
});

export default function SpinSettingsDialog({ open, setOpen, initialData, totalPrizes = 0, activePrizes = 0 }) {
  let symbol = "$";
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("admin-platform-settings-symbol");
      if (cached) symbol = cached;
    } catch (e) {}
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      feature_enabled: true,
      cost_per_spin: 0,
      free_spins_per_deposit: 0,
      daily_referral_target: 0,
      spins_for_daily_challenge: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        feature_enabled: initialData.feature_enabled ?? true,
        cost_per_spin: initialData.cost_per_spin || 0,
        free_spins_per_deposit: initialData.free_spins_per_deposit || 0,
        daily_referral_target: initialData.daily_referral_target || 0,
        spins_for_daily_challenge: initialData.spins_for_daily_challenge || 0,
      });
    }
  }, [initialData, reset, open]);

  const feature_enabled = watch("feature_enabled");

  const editMutation = usePut("/admin/rewards/spin-settings", ["admin-spin-settings"]);

  const isSubmitting = editMutation.isPending;

  const onSubmit = async (data) => {
    try {
      await editMutation.mutateAsync({
        ...data,
        cost_per_spin: Number(data.cost_per_spin),
        free_spins_per_deposit: Number(data.free_spins_per_deposit),
        daily_referral_target: Number(data.daily_referral_target),
        spins_for_daily_challenge: Number(data.spins_for_daily_challenge),
      });
      setOpen(false);
    } catch (error) {
      // Error is handled by useApi
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-[#f8fafc]">
        {/* Header */}
        <div className="bg-white px-8 py-5 flex items-center justify-between border-b">
          <DialogTitle className="text-xl font-medium text-gray-700">
            Spin Wheel Settings
          </DialogTitle>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold text-[#0073b6]">{totalPrizes}</span>
              <span className="text-[10px] font-bold text-[#0073b6] uppercase tracking-wider mt-1">Total Prizes</span>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold text-blue-600">{activePrizes}</span>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-1">Active Prizes</span>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold text-blue-600">{initialData?.total_spins_used || 0}</span>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-1">Total Spins</span>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold text-orange-600">{symbol}{Number(initialData?.total_rewards_earned || 0).toFixed(2)}</span>
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mt-1">Total Paid</span>
            </div>
            <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold text-teal-600">{initialData?.free_spins_used || 0}</span>
              <span className="text-[10px] font-bold text-teal-500 uppercase tracking-wider mt-1">Free Spins Used</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Spin Cost Card */}
            <div className="bg-[#94a3b8] p-6 rounded-md shadow-sm text-white">
              <h3 className="text-xl font-medium mb-6 flex items-center">
                <span className="text-gray-200 mr-2">{symbol}</span> Spin Cost
              </h3>

              <div>
                <Label className="text-gray-200 text-sm mb-1.5 block">Cost per Spin *</Label>
                <div className="flex bg-white rounded-sm overflow-hidden h-10">
                  <span className="bg-gray-100 text-gray-500 px-4 py-2 border-r flex items-center">{symbol}</span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("cost_per_spin")}
                    className="border-0 focus-visible:ring-0 text-gray-800 h-full rounded-sm h-10"
                  />
                </div>
                <p className="text-[12px] text-gray-200 mt-2">Amount deducted from user's withdrawable balance per spin</p>
              </div>
            </div>

            {/* Feature Status Card */}
            <div className="bg-[#94a3b8] p-6 rounded-md shadow-sm text-white">
              <h3 className="text-xl font-medium mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-200"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                Feature Status
              </h3>

              <div className="flex items-start space-x-4">
                <Switch
                  checked={feature_enabled}
                  onCheckedChange={(val) => setValue("feature_enabled", val)}
                  className="data-[state=checked]:bg-blue-500 bg-gray-300 border-white mt-1"
                />
                <div>
                  <Label className="text-white text-base font-bold block mb-1">Spin Wheel</Label>
                  <p className="text-[12px] text-gray-200">When disabled, users will not be able to access the spin wheel feature.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Free Spins Configuration */}
          <div className="bg-white rounded-md border shadow-sm overflow-hidden">
            <div className="bg-[#0073b6] px-6 py-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white mr-2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
              <h3 className="text-lg font-medium text-white">Free Spins Configuration</h3>
            </div>

            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-[#0073b6] font-medium text-sm flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                    Free Spins per Deposit
                  </Label>
                  <Input
                    type="number"
                    {...register("free_spins_per_deposit")}
                    className="border-gray-200 focus-visible:ring-blue-400 rounded-sm h-10"
                  />
                  <p className="text-[12px] text-gray-400 mt-2 leading-tight">Number of free spins awarded after each successful deposit (0 = disabled)</p>
                </div>

                <div>
                  <Label className="text-[#0073b6] font-medium text-sm flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                    Daily Referral Target
                  </Label>
                  <Input
                    type="number"
                    {...register("daily_referral_target")}
                    className="border-gray-200 focus-visible:ring-blue-400 rounded-sm h-10"
                  />
                  <p className="text-[12px] text-gray-400 mt-2 leading-tight">Number of referrals needed per day to earn free spins (0 = disabled)</p>
                </div>

                <div>
                  <Label className="text-[#0073b6] font-medium text-sm flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                    Spins for Daily Challenge
                  </Label>
                  <Input
                    type="number"
                    {...register("spins_for_daily_challenge")}
                    className="border-gray-200 focus-visible:ring-blue-400 rounded-sm h-10"
                  />
                  <p className="text-[12px] text-gray-400 mt-2 leading-tight">Number of free spins awarded when daily referral target is reached</p>
                </div>
              </div>

              <div className="bg-[#00d4d4] p-5 rounded-md text-white shadow-sm">
                <div className="flex items-center font-bold text-[15px] mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  How Free Spins Work:
                </div>
                <ul className="list-disc pl-6 space-y-1.5 text-[14px]">
                  <li>Free spins are used <strong>before</strong> deducting from user balance</li>
                  <li>When balance is used, it is deducted from the user's withdrawable balance</li>
                  <li>All prizes are credited to the user's <strong>main balance</strong></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-start pt-2 pb-6 space-x-4">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 h-auto text-base rounded-sm-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="bg-[#475f7b] text-white hover:bg-[#34465b] border-0 px-8 py-2 h-auto text-base rounded-sm-sm hover:text-white"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
