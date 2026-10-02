"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Lock, Mail, Globe, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#475f7b] mb-1">Platform Settings</h1>
        <p className="text-gray-500 text-sm">Configure system preferences and administrator details.</p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="flex items-center gap-2 text-gray-800 text-base font-bold">
              <Globe className="w-5 h-5 text-blue-500" />
              General Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Platform Name</label>
                <input 
                  type="text" 
                  defaultValue="TradeFluxBot"
                  className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:outline-none focus:border-blue-500/50 transition-colors placeholder-gray-400 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Support Email</label>
                <input 
                  type="email" 
                  defaultValue="support@tradefluxbot.com"
                  className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:outline-none focus:border-blue-500/50 transition-colors placeholder-gray-400 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="flex items-center gap-2 text-gray-800 text-base font-bold">
              <Lock className="w-5 h-5 text-emerald-500" />
              Security & Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Admin Email</label>
                <input 
                  type="email" 
                  defaultValue="chinedufreedom10@gmail.com"
                  className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:outline-none focus:border-blue-500/50 transition-colors placeholder-gray-400 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">New Password</label>
                <input 
                  type="password" 
                  placeholder="Enter to change password"
                  className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 text-gray-800 focus:outline-none focus:border-blue-500/50 transition-colors placeholder-gray-400 text-sm"
                />
              </div>
            </div>
            <div className="pt-2">
              <button className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Enable Two-Factor Authentication (2FA)
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <CardTitle className="flex items-center gap-2 text-gray-800 text-base font-bold">
              <Bell className="w-5 h-5 text-orange-500" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <h4 className="text-gray-800 font-semibold text-[14px] mb-1">New User Registrations</h4>
                <p className="text-xs text-gray-500">Receive an email when a new user signs up.</p>
              </div>
              <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <h4 className="text-gray-800 font-semibold text-[14px] mb-1">Deposit Alerts</h4>
                <p className="text-xs text-gray-500">Receive an email for every new deposit request.</p>
              </div>
              <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
