"use client";

import { useState } from "react";
import { Building2, Edit, Trash2, Plus, RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFetchData, useDelete } from "@/hooks/useApi";
import PartnerDialog from "@/components/modals/PartnerDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function PartnersManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    partnerId: null,
  });

  // Fetch Partners Data
  const { data, isLoading, refetch } = useFetchData(
    "/admin/partners?limit=100", // Using a high limit to get all partners
    ["partners"]
  );

  const deleteMutation = useDelete((id) => `/admin/partners/${id}`, ["partners"]);

  const partnersData = data?.partners || [];

  const handleEdit = (partner) => {
    setSelectedPartner(partner);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedPartner(null);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id) => {
    setConfirmDialog({ isOpen: true, partnerId: id });
  };

  const executeDelete = async () => {
    if (confirmDialog.partnerId) {
      try {
        await deleteMutation.mutateAsync(confirmDialog.partnerId);
      } catch (error) {
        console.error("Delete failed", error);
      } finally {
        setConfirmDialog({ isOpen: false, partnerId: null });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <h1 className="text-xl font-semibold text-gray-700">Partners Management</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Manage your platform partners displayed on the user dashboard.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => refetch()} variant="outline" className="bg-white">
            <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-sm-sm px-6 shadow-lg"
          >
            <Plus className="w-4 h-4 " />
            Add Partner
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-3" />
          <p className="text-gray-500">Loading partners...</p>
        </div>
      ) : partnersData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed">
          <Building2 className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No partners added yet</p>
          <Button onClick={handleCreate} variant="outline" className="mt-4">
            Add Your First Partner
          </Button>
        </div>
      ) : (
        /* Grid of Partners */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {partnersData.map((partner) => (
            <Card key={partner.id} className="border border-border shadow-sm bg-white rounded-md overflow-hidden hover:shadow-md transition-shadow group relative">
              {/* Delete Button (Hover to reveal) */}
              <button 
                onClick={() => handleDeleteClick(partner.id)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                title="Delete Partner"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                
                {/* Partner Logo */}
                <div className="mb-4 w-20 h-20 rounded-xl flex items-center justify-center p-3 bg-gray-50 border border-gray-100 shadow-sm">
                  {partner.logo ? (
                    <img src={partner.logo} alt={partner.partner_name} className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>

                {/* Partner Name */}
                <h3 className="font-semibold text-gray-700 text-[15px] mb-2">{partner.partner_name}</h3>

                {/* Status Badge */}
                <Badge className={`${partner.status ? 'bg-blue-600/10 text-blue-600' : 'bg-red-100 text-red-600'} hover:opacity-80 border-0 text-[10px] tracking-widest uppercase px-3 py-0.5 rounded font-bold mb-4`}>
                  {partner.status ? "ACTIVE" : "HIDDEN"}
                </Badge>

                {/* Edit Button */}
                <Button 
                  onClick={() => handleEdit(partner)}
                  variant="default" 
                  size="sm" 
                  className="bg-[#0073b6] hover:bg-[#00629b] text-white border-0 rounded text-xs px-4 h-8 w-full"
                >
                  <Edit className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <PartnerDialog 
        open={isDialogOpen} 
        setOpen={setIsDialogOpen} 
        initialData={selectedPartner} 
      />

      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Partner Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this partner? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
