"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/schemas";
import { usePost, useFetchData } from "@/hooks/useApi";
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { data: settingsResponse } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsResponse?.settings || {};
  const siteName = settings.site_name || "TradeFluxBot";
  const siteLogo = settings.platform_logo || "/logo.png";

  const requestOtpMutation = usePost("/auth/admin/forgot-password", null);

  const onSubmit = (data) => {
    localStorage.setItem("resetEmail", data.email);

    requestOtpMutation.mutate(data, {
      onSuccess: (res) => {
        router.push("/auth/verify-otp");
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans text-gray-900">
      <div className="flex flex-col justify-center items-center w-full max-w-xl px-8 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex flex-col items-center text-center">
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password?</h1>
            <p className="text-gray-500 text-sm">
              Enter your registered email and we’ll send you a password reset link for {siteName} Admin Panel.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Input
                label="Email Address"
                type="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0073b6] text-white hover:bg-[#00629b] rounded-md py-4.5 font-medium transition-all"
              disabled={requestOtpMutation.isPending}
            >
              {requestOtpMutation.isPending ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <rect width="10" height="10" x="1" y="1" fill="currentColor" rx="1">
                    <animate id="SVG7WybndBt" fill="freeze" attributeName="x" begin="0;SVGo3aOUHlJ.end" dur="0.2s" values="1;13" />
                    <animate id="SVGVoKldbWM" fill="freeze" attributeName="y" begin="SVGFpk9ncYc.end" dur="0.2s" values="1;13" />
                    <animate id="SVGKsXgPbui" fill="freeze" attributeName="x" begin="SVGaI8owdNK.end" dur="0.2s" values="13;1" />
                    <animate id="SVG7JzAfdGT" fill="freeze" attributeName="y" begin="SVG28A4To9L.end" dur="0.2s" values="13;1" />
                  </rect>
                  <rect width="10" height="10" x="1" y="13" fill="currentColor" rx="1">
                    <animate id="SVGUiS2jeZq" fill="freeze" attributeName="y" begin="SVG7WybndBt.end" dur="0.2s" values="13;1" />
                    <animate id="SVGU0vu2GEM" fill="freeze" attributeName="x" begin="SVGVoKldbWM.end" dur="0.2s" values="1;13" />
                    <animate id="SVGOIboFeLf" fill="freeze" attributeName="y" begin="SVGKsXgPbui.end" dur="0.2s" values="1;13" />
                    <animate id="SVG14lAaeuv" fill="freeze" attributeName="x" begin="SVG7JzAfdGT.end" dur="0.2s" values="13;1" />
                  </rect>
                  <rect width="10" height="10" x="13" y="13" fill="currentColor" rx="1">
                    <animate id="SVGFpk9ncYc" fill="freeze" attributeName="x" begin="SVGUiS2jeZq.end" dur="0.2s" values="13;1" />
                    <animate id="SVGaI8owdNK" fill="freeze" attributeName="y" begin="SVGU0vu2GEM.end" dur="0.2s" values="13;1" />
                    <animate id="SVG28A4To9L" fill="freeze" attributeName="x" begin="SVGOIboFeLf.end" dur="0.2s" values="1;13" />
                    <animate id="SVGo3aOUHlJ" fill="freeze" attributeName="y" begin="SVG14lAaeuv.end" dur="0.2s" values="13;1" />
                  </rect>
                </svg>
              ) : (
                "Send Verification Code"
              )}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Remembered your password?{" "}
              <Link href="/" className="text-[#0073b6] font-medium hover:underline cursor-pointer">
                Back to Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
