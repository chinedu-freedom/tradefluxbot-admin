"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpSchema } from "@/lib/schemas";
import { usePost, useFetchData } from "@/hooks/useApi"; 
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);

  const { handleSubmit, setValue } = useForm({
    resolver: zodResolver(otpSchema),
  });

  const { data: settingsResponse } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsResponse?.settings || {};
  const siteName = settings.site_name || "TradeFluxBot";
  const siteLogo = settings.platform_logo || "/logo.jpeg";

  const verifyOtpMutation = usePost("/auth/admin/verify-otp", null);
  const resendOtpMutation = usePost("/auth/admin/forgot-password", null);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    const joinedOtp = newOtp.join("");
    setValue("otp", joinedOtp);

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const onSubmit = (data) => {
    const email = localStorage.getItem("resetEmail");
    if (!email) {
      toast.error("Session expired. Please request a new OTP.");
      return;
    }

    verifyOtpMutation.mutate({ ...data, email }, {
      onSuccess: () => router.push("/auth/reset-password"),
    });
  };

  const handleResend = () => {
    const email = localStorage.getItem("resetEmail");
    if (!email) {
      toast.error("Session expired. Please go back and enter your email again.");
      return;
    }

    resendOtpMutation.mutate({ email }, {
      onSuccess: () => toast.success("OTP resent successfully"),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans text-gray-900">
      <div className="flex flex-col justify-center items-center w-full max-w-xl px-8 py-12">
        <div className="w-full max-w-sm text-center flex flex-col items-center">
          {siteLogo ? (
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-gray-50 border border-gray-100 mb-4">
              <img src={siteLogo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-[#0073b6] to-[#0f172a] rounded-full flex items-center justify-center shadow-sm mb-4">
              <div className="text-white text-xs font-bold tracking-wider">
                {siteName.substring(0, 4).toUpperCase()}
              </div>
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h2>
          <p className="text-sm text-gray-500 mb-8">
            Enter the 4-digit code sent to your email to access {siteName} Admin Panel.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 focus:ring-2 focus:ring-[#0073b6]"
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0073b6] text-white hover:bg-[#00629b] rounded-md py-4.5 font-medium transition-all"
              disabled={verifyOtpMutation.isPending}
            >
              {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
            </Button>

            <p className="text-sm text-gray-500">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendOtpMutation.isPending}
                className={`font-medium cursor-pointer hover:underline ${
                  resendOtpMutation.isPending
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-[#0073b6]"
                }`}
              >
                {resendOtpMutation.isPending ? "Resending..." : "Resend"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
