"use client";

import { ArrowLeft, Calendar, Tag, Loader2, Image as ImageIcon, Eye, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useFetchData } from "@/hooks/useApi";
import { Badge } from "@/components/ui/badge";

export default function AdminNewsPreviewPage() {
  const params = useParams();
  // Using the admin endpoint to fetch a single news item
  const { data, isLoading, error } = useFetchData(params?.id ? `/admin/news/${params.id}` : null, ["news", params?.id]);

  const article = data?.news;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6 bg-white p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/news" className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-xl font-bold text-foreground">News Preview</h1>
        </div>
        <div className="flex items-center gap-2">
          {article && (
            <Badge className={`${article.status ? 'bg-blue-600/10 text-blue-600' : 'bg-red-100 text-red-600'} border-0 px-3 py-1 font-bold`}>
              {article.status ? "Published" : "Hidden"}
            </Badge>
          )}
        </div>
      </div>

      <div className="w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
            <p className="text-sm font-medium text-gray-500">Loading preview...</p>
          </div>
        ) : error || !article ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border shadow-sm">
            <p className="text-sm font-medium text-red-500">Article not found</p>
            <Link href="/news" className="mt-4 text-blue-500 text-xs font-bold underline">
              Return to News Management
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 border border-border shadow-sm">
            {/* Meta */}
            <div className="flex flex-wrap gap-3 mb-6 items-center">
              <span className="text-xs font-bold px-3 py-1 rounded-md bg-blue-100 text-blue-600 flex items-center gap-1.5">
                <Tag size={12} /> {article.category || "General"}
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-md bg-gray-100 text-gray-600 flex items-center gap-1.5">
                <Calendar size={12} /> {new Date(article.published_at).toLocaleDateString()}
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-md bg-blue-50 text-[#0073b6] flex items-center gap-1.5">
                <Eye size={12} /> {article.views} views
              </span>
              {article.is_featured && (
                <span className="text-xs font-bold px-3 py-1 rounded-md bg-orange-100 text-orange-600 flex items-center gap-1.5">
                  <Star size={12} /> Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-extrabold text-gray-900 leading-snug mb-6">
              {article.title}
            </h1>

            {/* Featured Image */}
            {article.image ? (
              <div className="w-full h-[300px] md:h-[400px] rounded-2xl mb-8 shadow-sm overflow-hidden flex items-center justify-center bg-gray-50 border">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-[200px] bg-gradient-to-r from-blue-500 to-[#0f172a] rounded-2xl mb-8 shadow-inner relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-black/20"></div>
                <span className="text-white/50 text-sm font-bold tracking-widest uppercase z-10 flex items-center gap-2">
                  <ImageIcon size={20} /> TradeFluxBot News Image Placeholder
                </span>
              </div>
            )}

            {/* Description */}
            <div className="mb-8 p-4 bg-gray-50 border-l-4 border-blue-500 rounded-r-lg">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Short Description</h3>
              <p className="text-gray-600 italic text-sm">{article.description}</p>
            </div>

            {/* Content */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b">Full Content</h3>
              <div className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap font-medium">
                {article.content}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
