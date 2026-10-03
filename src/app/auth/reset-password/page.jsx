"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import { usePost, useFetchData } from "@/hooks/useApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const { data: settingsResponse } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsResponse?.settings || {};
  const siteName = settings.site_name || "TradeFluxBot";
  const siteLogo = settings.platform_logo || "/logo.png";

  const resetPasswordMutation = usePost("/auth/admin/reset-password", null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.newPassword || !form.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!validatePassword(form.newPassword)) {
      toast.error(
        "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const email = localStorage.getItem("resetEmail");
    if (!email) {
      toast.error("Session expired. Please request a new reset link.");
      router.push("/auth/forgot-password");
      return;
    }

    resetPasswordMutation.mutate(
      { email, newPassword: form.newPassword },
      {
        onSuccess: () => {
          localStorage.removeItem("resetEmail");
          router.push("/"); // redirect to login
        },
      }
    );
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Reset Password
            </h1>
            <p className="text-gray-500 text-sm">
              Enter your new password and confirm it below for {siteName} Admin Panel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
            />

            <Button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="w-full bg-[#0073b6] text-white hover:bg-[#00629b] rounded-md py-4.5 font-medium transition-all disabled:opacity-70"
            >
              {resetPasswordMutation.isPending
                ? "Resetting..."
                : "Reset Password"}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Back to{" "}
              <Link
                href="/"
                className="text-[#0073b6] font-medium hover:underline cursor-pointer"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
