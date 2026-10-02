"use client";

import { useState } from "react";
import { Search, Edit, Trash2, Plus, Star, Newspaper, Eye, RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFetchData, useDelete } from "@/hooks/useApi";
import Pagination from "@/components/Pagination";
import NewsDialog from "@/components/modals/NewsDialog";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function NewsManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    newsId: null,
  });

  // Fetch News Data
  const { data, isLoading, refetch } = useFetchData(
    `/admin/news?page=${page}&limit=10&search=${searchTerm}`,
    ["news", page, searchTerm]
  );

  const deleteMutation = useDelete((id) => `/admin/news/${id}`, ["news"]);

  const newsData = data?.news || [];
  const meta = data?.meta || null;

  // Calculated Stats (From visible data or meta if available, ideally from an aggregate endpoint but using available data here)
  const totalNews = meta?.total || 0;
  const totalViews = newsData.reduce((acc, curr) => acc + curr.views, 0);
  const featuredNews = newsData.filter(n => n.is_featured).length;

  const stats = [
    {
      title: "Total News",
      value: totalNews.toString(),
      icon: Newspaper,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Page Views (Current)",
      value: totalViews.toString(),
      icon: Eye,
      color: "text-[#0073b6]",
      bg: "bg-blue-100",
    },
    {
      title: "Featured (Current)",
      value: featuredNews.toString(),
      icon: Star,
      color: "text-orange-600",
      bg: "bg-orange-100",
    }
  ];

  const handleEdit = (newsItem) => {
    setSelectedNews(newsItem);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedNews(null);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id) => {
    setConfirmDialog({ isOpen: true, newsId: id });
  };

  const executeDelete = async () => {
    if (confirmDialog.newsId) {
      try {
        await deleteMutation.mutateAsync(confirmDialog.newsId);
      } catch (error) {
        console.error("Delete failed", error);
      } finally {
        setConfirmDialog({ isOpen: false, newsId: null });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">News Management</h1>
          <p className="text-muted-foreground text-sm">Manage system news, updates, and announcements</p>
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
            Add News
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow border-border shadow-sm bg-card rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</h3>
                  <p className="text-[13px] font-medium text-muted-foreground mt-1 tracking-wide">{stat.title}</p>
                </div>
                <div className={`w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400`}>
                  <stat.icon className="w-4 h-4" strokeWidth={2} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm bg-card">
        <CardContent className="p-6">
          <div className="flex w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
              <Input
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Table */}
      <Card className="border-none shadow-sm bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs w-[100px] pl-6">IMAGE</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs">TITLE</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs">CATEGORY</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs">VIEWS</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs text-center">FEATURED</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs">STATUS</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs">DATE</TableHead>
                  <TableHead className="font-bold text-gray-500 uppercase text-xs text-right pr-6">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#0073b6]" />
                        <span className="ml-2 text-gray-500">Loading news...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : newsData.length > 0 ? (
                  newsData.map((news) => (
                    <TableRow key={news.id} className="hover:bg-gray-50/50">
                      <TableCell className="pl-6">
                        <div className="w-[60px] h-[40px] rounded overflow-hidden shadow-sm bg-gray-100 flex items-center justify-center">
                          {news.image ? (
                            <img src={news.image} alt="News thumbnail" className="w-full h-full object-cover" />
                          ) : (
                            <Newspaper className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-800 text-[14px] line-clamp-1">{news.title}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-[#e5edff] hover:bg-[#d4e0ff] text-[#0073b6] border-0 px-3 py-1 font-semibold rounded-[4px]">
                          {news.category || "GENERAL"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700 font-medium">{news.views}</TableCell>
                      <TableCell className="text-center">
                        {news.is_featured ? (
                          <div className="inline-flex w-7 h-7 bg-[#f59e0b] rounded items-center justify-center shadow-sm">
                            <Star className="w-4 h-4 text-white fill-white" />
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${news.status ? 'bg-blue-600/10 text-blue-600' : 'bg-red-100 text-red-600'} hover:opacity-80 border-0 text-[11px] tracking-wider uppercase px-3 py-1 rounded-[4px] font-bold`}>
                          {news.status ? "ACTIVE" : "HIDDEN"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700 text-sm whitespace-nowrap">
                        {new Date(news.published_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link href={`/news/${news.id}`}>
                            <Button 
                              variant="default" 
                              size="icon" 
                              className="h-8 w-8 bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-sm-[4px]"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="default" 
                            size="icon" 
                            className="h-8 w-8 bg-[#f59e0b] hover:bg-[#d97706] text-white border-0 rounded-sm-[4px]"
                            title="Edit"
                            onClick={() => handleEdit(news)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="default" 
                            size="icon" 
                            className="h-8 w-8 bg-[#ff5b5c] hover:bg-red-500 text-white border-0 rounded-sm-[4px]"
                            title="Delete"
                            onClick={() => handleDeleteClick(news.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500 bg-gray-50/30">
                      <div className="flex flex-col items-center justify-center space-y-3 py-6">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <Newspaper className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="text-sm font-medium text-gray-700">No news articles found</div>
                        <p className="text-xs text-gray-400 max-w-[280px]">
                          Create a news article or announcement to see it listed here.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </CardContent>
      </Card>

      {/* Modals */}
      <NewsDialog 
        open={isDialogOpen} 
        setOpen={setIsDialogOpen} 
        initialData={selectedNews} 
      />

      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm News Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this news article? This action cannot be undone.
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
