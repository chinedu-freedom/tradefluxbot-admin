"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Camera } from "lucide-react";
import { usePost, usePut } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

// ✅ Schema matching the image
const planSchema = z.object({
  title: z.string().min(3, "Plan name is required"),
  description: z.string().min(3, "Description is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 day"),
  dailyReturn: z.coerce.number().min(0.01, "Daily return is required"),
  minInvestment: z.coerce.number().min(1, "Min investment is required"),
  maxInvestment: z.coerce.number().min(1, "Max investment is required"),
  isFixedDeposit: z.enum(["yes", "no"]),
  status: z.enum(["active", "inactive"]),
});

export default function PlanDialog({ open, setOpen, initialData }) {
  const queryClient = useQueryClient();
  const isEdit = !!initialData?.id;
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 30,
      dailyReturn: 1.2,
      minInvestment: 10,
      maxInvestment: 10000,
      isFixedDeposit: "no",
      status: "active",
    },
  });

  // Calculate yield
  const duration = watch("duration") || 0;
  const dailyReturn = watch("dailyReturn") || 0;
  const totalYield = (duration * dailyReturn).toFixed(1);

  // ✅ Populate form when editing
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.name || "",
        description: initialData.description || "",
        duration: initialData.duration || 30,
        dailyReturn: initialData.daily_income ? Number(initialData.daily_income) : 1.2,
        minInvestment: initialData.min_investment ? Number(initialData.min_investment) : 10,
        maxInvestment: initialData.max_investment ? Number(initialData.max_investment) : 10000,
        isFixedDeposit: initialData.is_fixed_deposit ? "yes" : "no",
        status: initialData.status ? "active" : "inactive",
      });
      setImagePreview(initialData.image || null);
      setImageName(initialData.image ? "existing_image" : "");
    } else {
      setImagePreview(null);
      setImageName("");
    }
  }, [initialData, reset]);

  const status = watch("status");

  const createMutation = usePost("/admin/plans", ["plans"]);
  // If it's edit, we use usePut
  const editMutation = usePut(initialData?.id ? `/admin/plans/${initialData.id}` : "", ["plans"]);

  const isSubmitting = createMutation.isPending || editMutation.isPending;

  const onSubmit = async (data) => {

    if (data.maxInvestment < data.minInvestment) {
      setError("maxInvestment", {
        type: "manual",
        message: "Max investment must be ≥ min investment",
      });
      return;
    }

    const payload = {
      name: data.title,
      description: data.description,
      duration: Number(data.duration),
      daily_income: Number(data.dailyReturn),
      min_investment: Number(data.minInvestment),
      max_investment: Number(data.maxInvestment),
      capital_return: false,
      is_fixed_deposit: data.isFixedDeposit === "yes",
      status: data.status === "active",
      image: imagePreview || null
    };

    try {
      if (isEdit) {
        await editMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      setOpen(false);
      reset();
    } catch (err) {
      // Errors handled by useApi
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-[#f8fafc]">
        {/* Header */}
        <div className="bg-white px-8 py-5 flex items-center justify-between border-b">
          <DialogTitle className="text-xl font-medium text-gray-700">
            {isEdit ? "Edit Investment Plan" : "Create New Investment Plan"}
          </DialogTitle>
          <DialogDescription className="hidden">
            {isEdit ? "Form to edit an existing plan" : "Form to create a new plan"}
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-8">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg border shadow-sm">
            <div>
              <Label className="text-gray-600 text-sm mb-1.5 block">Plan Name</Label>
              <Input
                {...register("title")}
                placeholder="e.g. USDT, BTC, ETH"
                className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
              />
              <p className="text-[11px] text-blue-500 mt-1.5">● This will be displayed as the plan title</p>
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label className="text-gray-600 text-sm mb-1.5 block">Description</Label>
              <Input
                {...register("description")}
                placeholder="Short description"
                className="border-gray-200 rounded-sm h-10"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>
          </div>

          {/* Investment Settings */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-blue-500">Investment Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Duration (Days)</Label>
                <Input
                  type="number"
                  {...register("duration")}
                  placeholder="e.g. 30, 60, 90"
                  className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
                />
                <p className="text-[11px] text-blue-500 mt-1.5">● Investment period in days</p>
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>}
              </div>
              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Daily Return (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("dailyReturn")}
                  placeholder="e.g. 0.5, 1.2"
                  className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
                />
                <p className="text-[11px] text-blue-500 mt-1.5">● Daily percentage return on investment</p>
                {errors.dailyReturn && <p className="text-red-500 text-sm mt-1">{errors.dailyReturn.message}</p>}
              </div>
              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Total Yield (%)</Label>
                <Input
                  disabled
                  value={`${totalYield}%`}
                  className="bg-gray-50 border-gray-200 text-gray-500 rounded-sm h-10"
                />
                <p className="text-[11px] text-gray-400 mt-1.5">Auto-calculated: Daily % × Days</p>
              </div>
            </div>
          </div>

          {/* Amount Limits */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-blue-500">Amount Limits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Minimum Investment</Label>
                <Input
                  type="number"
                  {...register("minInvestment")}
                  placeholder="10"
                  className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
                />
                <p className="text-[11px] text-blue-500 mt-1.5">● Minimum amount user can invest</p>
                {errors.minInvestment && <p className="text-red-500 text-sm mt-1">{errors.minInvestment.message}</p>}
              </div>
              <div>
                <Label className="text-gray-600 text-sm mb-1.5 block">Maximum Investment</Label>
                <Input
                  type="number"
                  {...register("maxInvestment")}
                  placeholder="10000"
                  className="border-blue-500 focus-visible:ring-blue-500 rounded-sm h-10"
                />
                <p className="text-[11px] text-blue-500 mt-1.5">● Maximum amount user can invest</p>
                {errors.maxInvestment && <p className="text-red-500 text-sm mt-1">{errors.maxInvestment.message}</p>}
              </div>
            </div>
          </div>

          {/* Plan Image */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-blue-500">Plan Image</h3>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-gray-600 text-sm">
                    Upload Thumbnail <span className="text-gray-400 text-xs">(Optional, recommended: 200x200px, circular)</span>
                  </Label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageName("");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove image
                    </button>
                  )}
                </div>
                <div className="flex items-center border rounded-md overflow-hidden bg-gray-50">
                  <Input 
                    type="text" 
                    placeholder="Choose file" 
                    value={imageName}
                    readOnly 
                    className="border-0 bg-transparent flex-1 rounded-sm h-10" 
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageName(file.name);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="rounded-sm-none border-l h-10 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse
                  </Button>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Capital & Status */}
          <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-blue-500">Capital, Deposit Type & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <Label className="text-gray-600 text-sm mb-1.5 block">Is Fixed Deposit?</Label>
                  <p className="text-[11px] text-gray-500">● Yes: Earnings locked until plan expires</p>
                </div>
                <Switch
                  checked={watch("isFixedDeposit") === "yes"}
                  onCheckedChange={(val) => setValue("isFixedDeposit", val ? "yes" : "no")}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
              <div className="flex items-center justify-between gap-6">
                <div>
                  <Label className="text-gray-600 text-sm mb-1.5 block">Plan Status</Label>
                  <p className="text-[11px] text-gray-500">● Active plans will be visible to users</p>
                </div>
                <Switch
                  checked={status === "active"}
                  onCheckedChange={(val) => setValue("status", val ? "active" : "inactive")}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 pb-6">
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
                isEdit ? "Update Plan" : "Create Plan"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}