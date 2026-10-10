"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Copy, Plus, Edit2, Trash2 } from "lucide-react";

const mockWallets = [
  { id: 1, name: "Ethereum BEP20", network: "BEP20", address: "0xB0843CE0BACC3c69e9dcF69B149d4Cb9c6B56bBB", active: true },
  { id: 2, name: "USDT BEP20", network: "BEP20", address: "0xB0843CE0BACC3c69e9dcF69B149d4Cb9c6B56bBB", active: true },
  { id: 3, name: "USDT Tether", network: "TRC20", address: "TXLaQpe1o1y6xYwWd8bB4E7dD9Vq68z42Y", active: true },
];

export default function WalletsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#475f7b] mb-1">Company Wallets</h1>
          <p className="text-gray-500 text-sm">Manage crypto addresses where users send their deposits.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          Add Wallet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockWallets.map((wallet) => (
          <Card key={wallet.id} className="relative overflow-hidden">
            <CardContent className="p-6 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-lg font-bold text-gray-800">{wallet.name}</h3>
                    {wallet.active && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    )}
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                    {wallet.network}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">Wallet Address</label>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 font-mono text-sm text-gray-700 break-all gap-3">
                  <span className="truncate">{wallet.address}</span>
                  <button className="flex-shrink-0 text-gray-400 hover:text-gray-800 transition-colors" title="Copy Address">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
