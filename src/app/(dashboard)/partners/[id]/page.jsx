"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Edit, ChevronLeft, Save, Check, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Mock database fetch based on ID
const mockPartners = {
  "1": { name: "Binance", status: "active", logoText: "ETH", bgColor: "#f3ba2f20", textColor: "#f3ba2f", image: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=029" },
  "2": { name: "Bybit", status: "active", logoText: "BYBIT", bgColor: "#fff3e0", textColor: "#e65100" },
  "3": { name: "Coinbase", status: "active", logoText: "C", bgColor: "#e3f2fd", textColor: "#1e88e5" },
  "4": { name: "KuCoin", status: "active", logoText: "K", bgColor: "#e0f2f1", textColor: "#00897b" },
};

const partnerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  displayLetter: z.string().optional(),
  bgColor: z.string().min(4, "Background color is required"),
  textColor: z.string().min(4, "Text color is required"),
  status: z.enum(["active", "inactive"]),
  removeLogo: z.boolean().default(false),
});

export default function EditPartnerPage({ params }) {
  const router = useRouter();
  const partnerId = params?.id || "1";
  
  // Unwrap params using React.use if needed in newer next, but since we are using client component, params is direct or promise. 
  // For safety we'll just use initial state
  const [partner, setPartner] = useState(mockPartners[partnerId] || mockPartners["1"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: partner.name,
      displayLetter: partner.logoText,
      bgColor: partner.bgColor,
      textColor: partner.textColor,
      status: partner.status,
      removeLogo: false,
    },
  });

  const watchAll = watch();
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    router.push("/partners");
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Header Bar */}
      <div className="bg-white px-6 py-4 rounded-md shadow-sm border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Edit className="w-5 h-5 text-blue-500" />
          <h1 className="text-lg font-semibold text-gray-700">Edit Partner: {partner.name}</h1>
        </div>
        <Link href="/partners">
          <Button variant="default" className="bg-[#0073b6] hover:bg-[#00629b] text-white flex items-center gap-2 h-9 px-4 rounded-sm-sm">
            <ChevronLeft className="w-4 h-4" />
            Back To Partners
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white p-6 rounded-md shadow-sm border mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Preview Pane (Left) */}
            <div className="lg:col-span-4">
              <div className="bg-[#94a3b8] rounded-md h-[300px] flex flex-col relative overflow-hidden">
                <div className="text-center text-white/80 pt-3 text-sm font-medium">Preview</div>
                <div className="flex-1 flex flex-col items-center justify-center -mt-6">
                  {partner.image && !watchAll.removeLogo ? (
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center p-3 mb-4 shadow-sm"
                      style={{ backgroundColor: watchAll.bgColor || partner.bgColor }}
                    >
                      <img src={partner.image} alt={watchAll.name} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl mb-4 shadow-sm"
                      style={{ 
                        backgroundColor: watchAll.bgColor || partner.bgColor,
                        color: watchAll.textColor || partner.textColor 
                      }}
                    >
                      {watchAll.displayLetter || watchAll.name?.charAt(0)}
                    </div>
                  )}
                  <h3 className="text-white font-medium text-lg">{watchAll.name || "Partner Name"}</h3>
                </div>
              </div>
            </div>

            {/* Form Pane (Right) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-600 text-[13px] mb-1.5 flex items-center gap-1">
                    <span className="text-blue-500"><ImageIcon className="w-3.5 h-3.5" /></span>
                    Partner Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("name")}
                    className="border-gray-200 focus-visible:ring-blue-400"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label className="text-gray-600 text-[13px] mb-1.5 flex items-center gap-1">
                    <span className="text-blue-500 font-serif text-sm italic">A</span>
                    Display Letter/Symbol
                  </Label>
                  <Input
                    {...register("displayLetter")}
                    className="border-gray-200 focus-visible:ring-blue-400"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Shown when no logo is uploaded (e.g., B, 8, T)</p>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-600 text-[13px] mb-1.5 flex items-center gap-1">
                    <span className="text-blue-500"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span>
                    Background Color <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      {...register("bgColor")}
                      className="border-gray-200 focus-visible:ring-blue-400 pr-10"
                    />
                    <div 
                      className="absolute right-1 top-1 w-8 h-8 rounded border"
                      style={{ backgroundColor: watchAll.bgColor }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">Use hex color with opacity (e.g., #f3ba2f20)</p>
                  {errors.bgColor && <p className="text-red-500 text-xs mt-1">{errors.bgColor.message}</p>}
                </div>
                <div>
                  <Label className="text-gray-600 text-[13px] mb-1.5 flex items-center gap-1">
                    <span className="text-blue-500 font-serif text-sm italic">A</span>
                    Text/Icon Color <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      {...register("textColor")}
                      className="border-gray-200 focus-visible:ring-blue-400 pr-10"
                    />
                    <div 
                      className="absolute right-1 top-1 w-8 h-8 rounded border"
                      style={{ backgroundColor: watchAll.textColor }}
                    />
                  </div>
                  {errors.textColor && <p className="text-red-500 text-xs mt-1">{errors.textColor.message}</p>}
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-600 text-[13px] mb-1.5 flex items-center gap-1">
                    <span className="text-blue-500"><ImageIcon className="w-3.5 h-3.5" /></span>
                    Logo Image
                  </Label>
                  <div className="flex items-center border rounded-md overflow-hidden bg-white">
                    <div className="bg-gray-100 border-r px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-200">
                      Choose file
                    </div>
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No file chosen
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">Max 2MB. Leave empty to display letter.</p>
                  
                  <div className="mt-4 flex items-center space-x-2">
                    <Checkbox 
                      id="removeLogo" 
                      checked={watchAll.removeLogo}
                      onCheckedChange={(checked) => setValue("removeLogo", checked)}
                      className="border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <label
                      htmlFor="removeLogo"
                      className="text-sm font-medium leading-none text-gray-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Remove current logo
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-600 text-[13px] mb-1.5 flex items-center gap-1">
                    <span className="text-blue-500"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></span>
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select value={watchAll.status} onValueChange={(val) => setValue("status", val)}>
                    <SelectTrigger className="border-gray-200 focus:ring-blue-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end">
          {/* <div className="flex items-center gap-2 text-gray-600 font-medium">
            <Save className="w-5 h-5 text-blue-500" />
            Save Changes
          </div> */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 h-10 px-6 rounded-sm-sm font-medium"
          >
            {isSubmitting ? "Updating..." : (
              <>
                <Check className="w-4 h-4" />
                Update Partner
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
