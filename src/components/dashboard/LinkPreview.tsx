"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, Loader2 } from "lucide-react";

interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
}

export function LinkPreview({ url }: { url: string }) {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchMetadata() {
      try {
        const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (isMounted) setMetadata(data);
      } catch (err) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMetadata();
    return () => { isMounted = false; };
  }, [url]);

  if (loading) return (
    <div className="flex items-center gap-2 p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 mt-2">
      <Loader2 size={14} className="animate-spin text-slate-400" />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Unpacking Link...</span>
    </div>
  );

  if (error || !metadata || (!metadata.title && !metadata.image)) return null;

  return (
    <div 
      className="mt-3 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group"
      onClick={() => window.open(metadata.url, '_blank')}
    >
      {metadata.image && (
        <div className="relative aspect-video w-full overflow-hidden">
          <img 
            src={metadata.image} 
            alt={metadata.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
        </div>
      )}
      <div className="p-4 bg-white">
        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{metadata.title}</h4>
        {metadata.description && (
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{metadata.description}</p>
        )}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-50">
          <ExternalLink size={12} className="text-blue-500" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">{new URL(url).hostname}</span>
        </div>
      </div>
    </div>
  );
}
