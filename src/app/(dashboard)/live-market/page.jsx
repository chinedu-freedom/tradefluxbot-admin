"use client"

import { useState } from "react"
import { Eye, Edit, Plus, EyeOff, Activity, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFetchData, usePut, useDelete } from "@/hooks/useApi"
import LiveMarketDialog from "@/components/modals/LiveMarketDialog"
import DeleteConfirmationDialog from "@/components/modals/DeleteConfirmationDialog"
import { toast } from "sonner"

export default function LiveMarketPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [cryptoToEdit, setCryptoToEdit] = useState(null)
  const [cryptoToDelete, setCryptoToDelete] = useState(null)

  const { data, isLoading, refetch } = useFetchData("/admin/live-market", ["admin-live-market"])
  
  const visibilityMutation = usePut("/admin/live-market/settings/visibility", ["admin-live-market"])
  
  const deleteMutation = useDelete(
    cryptoToDelete ? `/admin/live-market/${cryptoToDelete.id}` : null,
    ["admin-live-market"]
  )

  const handleVisibilityChange = async (checked) => {
    try {
      await visibilityMutation.mutateAsync({ isVisible: checked })
    } catch (error) {
      // Revert if error (toast handled in usePut)
    }
  }

  const handleDeleteClick = (crypto) => {
    setCryptoToDelete(crypto)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!cryptoToDelete) return
    try {
      await deleteMutation.mutateAsync()
      refetch()
    } catch (error) {
      // toast handled
    } finally {
      setIsDeleteDialogOpen(false)
      setCryptoToDelete(null)
    }
  }

  const assets = data?.assets || []
  const isVisible = data?.isVisible ?? true

  return (
    <div className="space-y-6">
      {/* Top Card: Live Market Visibility */}
      <Card className="border-none shadow-sm bg-white rounded-md">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#0073b6]" />
              <h2 className="text-lg font-semibold text-gray-700">Live Market Visibility</h2>
            </div>
            <p className="text-[13px] text-gray-500">Enable or disable the live market section on homepage</p>
          </div>
          <Switch 
            checked={isVisible} 
            onCheckedChange={handleVisibilityChange} 
            className="data-[state=checked]:bg-[#0073b6]"
            disabled={visibilityMutation.isPending || isLoading}
          />
        </CardContent>
      </Card>

      {/* Bottom Card: Market Cryptocurrencies */}
      <Card className="border-none shadow-sm bg-white rounded-md">
        <CardContent className="p-6">
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-700">Market Cryptocurrencies</h2>
              <p className="text-[13px] text-gray-500">Manage cryptocurrencies displayed in the live market section. Prices are fetched live from Binance API.</p>
            </div>
            <Button 
              onClick={() => {
                setCryptoToEdit(null)
                setIsDialogOpen(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-sm px-6 shadow-lg"
            >
              <Plus className="w-4 h-4 " />
              Add Crypto
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[1000px] whitespace-nowrap">
              <TableHeader className="bg-transparent border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-gray-500 uppercase text-xs w-[60px]">#</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs w-[80px]">LOGO</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs">SYMBOL</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs">NAME</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs">BINANCE SYMBOL</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs">STATUS</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : assets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No cryptocurrencies added yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  assets.map((crypto, index) => (
                    <TableRow key={crypto.id} className="hover:bg-gray-50/50 border-b last:border-0">
                      <TableCell className="font-medium text-gray-700 text-sm">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
                          {crypto.logo_url ? (
                            <img src={crypto.logo_url} alt={crypto.name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-xs font-bold text-gray-400">{crypto.symbol.slice(0,2)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-800 text-[14px]">{crypto.symbol}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-600 text-[14px]">{crypto.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-[#ff5b5c]/10 hover:bg-[#ff5b5c]/20 text-[#ff5b5c] border-0 px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-wider uppercase">
                          {crypto.trading_pair}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {crypto.status ? (
                          <Badge className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 border-0 px-3 py-1 rounded-[4px] text-[10px] font-bold tracking-widest uppercase">
                            ACTIVE
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 hover:bg-gray-200 text-gray-500 border-0 px-3 py-1 rounded-[4px] text-[10px] font-bold tracking-widest uppercase">
                            INACTIVE
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="default" 
                            size="icon" 
                            className="h-8 w-8 bg-[#0073b6] hover:bg-[#00629b] text-white border-0 rounded-sm-[4px]"
                            title="Edit"
                            onClick={() => {
                              setCryptoToEdit(crypto)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="default" 
                            className="h-8 px-3 bg-[#ff9f43] hover:bg-[#e68f3c] text-white border-0 rounded-sm-[4px] text-[13px] font-medium"
                            title="Delete"
                            onClick={() => handleDeleteClick(crypto)}
                          >
                            <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
        </CardContent>
      </Card>

      <LiveMarketDialog 
        open={isDialogOpen} 
        setOpen={setIsDialogOpen} 
        initialData={cryptoToEdit} 
        onSuccess={refetch} 
      />

      <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Cryptocurrency"
        description="Are you sure you want to delete this cryptocurrency? It will be removed from the live market display."
      />
    </div>
  )
}
