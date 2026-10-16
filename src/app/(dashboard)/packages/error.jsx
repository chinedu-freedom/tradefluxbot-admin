"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function PackagesError({ error, reset }) {
  useEffect(() => {
    console.error("Packages page error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Packages</h2>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        {error?.message || "An unexpected error occurred while loading packages. Please try reloading or check your backend connection."}
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={() => reset()} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </div>
    </div>
  );
}
