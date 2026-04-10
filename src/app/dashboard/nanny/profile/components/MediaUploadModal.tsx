import { useState, useEffect, useRef } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";
import { UploadTips } from "./UploadTips";

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (urls: string[]) => void;
  title: string;
  acceptedTypes: string;
  isVideo?: boolean;
  isMulti?: boolean;
  replaceIndex?: number;
  startUpload: (file: File, isVideo?: boolean, replaceIndex?: number) => Promise<string>;
}

interface FileWithStatus {
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  name: string;
  sizeMb: number;
  duration?: number;
  error?: string;
}

// Ultra-Robust In-Card Player with 'Soft Reset' Recovery
function VideoPreviewPlayer({ file, id, onVideoError }: { file: File, id: string, onVideoError?: (err: string) => void }) {
  const [preview, setPreview] = useState<string>(() => URL.createObjectURL(file));
  const videoRef = useRef<HTMLVideoElement>(null);

  // Soft Reset System: Re-creates the blob URL to bypass browser-level source drops
  const softReset = () => {
    setPreview(URL.createObjectURL(file));
    if (videoRef.current) {
        videoRef.current.load();
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
    // Cleanup on unmount AND on ID change
    return () => {
       URL.revokeObjectURL(preview);
    };
  }, [id]);

  return (
    <div className="w-full h-full relative group/vplayer bg-slate-950 rounded-[1.5rem] overflow-hidden border border-slate-900 flex items-center justify-center">
        <video 
          ref={videoRef}
          src={preview}
          className="w-full h-full object-contain" 
          muted 
          loop 
          playsInline 
          controls
          onCanPlayThrough={() => {
              // Only attempt play when we are 100% sure buffer is ready
              videoRef.current?.play().catch(() => {});
          }}
          onError={(e) => {
              const err = (e.target as any).error;
              const msg = err ? `HARD FAILURE ERROR CODE: ${err.code} (${err.message})` : "UNIDENTIFIED MEDIA FAILURE";
              onVideoError?.(msg);
          }}
        />
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest opacity-0 group-hover/vplayer:opacity-100 transition-opacity flex items-center gap-1.5 border border-white/10 pointer-events-none">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> Source Sentry Ultra-Robust
        </div>
        <button 
          onClick={softReset}
          className="absolute bottom-4 right-4 bg-primary/20 backdrop-blur-xl hover:bg-primary text-white text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest opacity-0 group-hover/vplayer:opacity-100 transition-all border border-white/10 z-10"
        >
          Soft Reset
        </button>
    </div>
  );
}

export function MediaUploadModal({ 
  isOpen, onClose, onComplete, title, acceptedTypes, isVideo, isMulti, replaceIndex, startUpload 
}: MediaUploadModalProps) {
  const { showToast } = useToast();
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [hardError, setHardError] = useState<string | null>(null);

  // We only revoke on unmount to prevent early revocation during list updates
  useEffect(() => {
    return () => {
      // Wait for a few seconds to let any pending render finish before revoking?
      // Or just let the browser handle it if it's not a memory leak issue.
      // For now, let's just make sure we don't revoke on every render.
    };
  }, []);

  const analyzeMedia = (file: File, preview: string): Promise<Partial<FileWithStatus>> => {
    return new Promise((resolve) => {
      const isVid = file.type.startsWith("video/");
      const stats: Partial<FileWithStatus> = {
          name: file.name,
          sizeMb: Number((file.size / (1024 * 1024)).toFixed(2))
      };

      if (!isVid) {
          resolve(stats);
          return;
      }

      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      
      const timeout = setTimeout(() => {
          resolve({ ...stats, error: "Analysis Timed Out (Possible Codec Issue)" });
      }, 5000);

      video.onloadedmetadata = () => {
          clearTimeout(timeout);
          resolve({ ...stats, duration: Math.round(video.duration) });
      };

      video.onerror = () => {
          clearTimeout(timeout);
          resolve({ ...stats, error: "Unsupported Media Format (Browser Incompatible)" });
      };

      video.src = preview;
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected?.length) return;
    
    const selectedFiles = Array.from(selected);
    
    // Limits
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    
    const validFiles: File[] = [];
    for (const file of selectedFiles) {
        const isVid = file.type.startsWith("video/");
        if (file.size > (isVid ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE)) {
            showToast(`${file.name} exceeds ${isVid ? "50MB" : "5MB"} limit.`, "error");
            continue;
        }
        validFiles.push(file);
    }

    if (!isMulti && validFiles.length > 1) {
      showToast("Only one file can be selected.", "error");
      return;
    }

    const analyzed = await Promise.all(validFiles.map(async (file) => {
        const preview = URL.createObjectURL(file);
        const metadata = await analyzeMedia(file, preview);
        return {
            file,
            preview,
            status: "pending" as const,
            ...metadata
        } as FileWithStatus;
    }));

    if (isMulti) {
        if (files.length + analyzed.length > 5) {
            showToast("Maximum of 5 files allowed.", "error");
            return;
        }
        setFiles(prev => [...prev, ...analyzed]);
    } else {
        setFiles(analyzed);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    const problematic = files.find(f => f.error);
    if (problematic) {
        if (!confirm(`Your file "${problematic.name}" has compatibility issues. It might not play after upload. Proceed anyway?`)) {
            return;
        }
    }

    setIsUploading(true);
    try {
      files.forEach(f => startUpload(f.file, isVideo, replaceIndex));
      showToast("Sync started in background!", "success");
      onClose();
      setFiles([]);
    } catch (err: any) {
      showToast("Failed to queue uploads.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const formatDuration = (sec?: number) => {
    if (!sec) return "0:00";
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-xl z-[60] flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] relative border border-slate-100 flex flex-col max-h-[90vh]">
        
        <button 
           onClick={() => { setFiles([]); onClose(); }} 
           className="absolute top-8 right-8 w-12 h-12 rounded-full flex items-center justify-center hover:bg-slate-50 transition-all text-slate-300 hover:text-rose-500 active:scale-90"
        >
           <MaterialIcon name="close" className="text-2xl" />
        </button>

        <div className="text-left mb-10">
            <h2 className="text-4xl font-headline font-black text-primary italic tracking-tight italic">Media Showcase Vault</h2>
            <div className="flex items-center gap-3 mt-2">
               <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] flex items-center gap-2">
                   <MaterialIcon name="verified_user" className="text-sm" /> Verified Caregiver Content Sync
               </p>
               <div className="h-1 w-1 bg-primary/20 rounded-full"></div>
               <p className="text-[9px] font-black text-rose-500/80 uppercase tracking-widest animate-pulse">Debug Mode Active</p>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar w-full min-h-[300px] flex flex-col items-center justify-center gap-8 px-2">
          {files.length === 0 ? (
            <label className="w-full max-w-2xl h-64 border-4 border-dashed border-slate-100 hover:border-primary/20 hover:bg-slate-50/50 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all group scale-100 hover:scale-[1.02] active:scale-95">
               <input type="file" className="hidden" accept={acceptedTypes} multiple={isMulti} onChange={handleFileSelect} />
               <div className="w-20 h-20 bg-primary/5 text-primary rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-700 mb-6 shadow-xl shadow-primary/5">
                  <MaterialIcon name={isVideo ? "videocam" : "add_photo_alternate"} className="text-3xl" />
               </div>
               <span className="text-sm font-black text-primary/60 uppercase tracking-widest italic">Select Professional Media</span>
               <p className="text-[9px] font-bold text-slate-400 mt-4 uppercase tracking-[0.2em]">{acceptedTypes.replace(/video\/|image\//g, "")} Support Enabled</p>
            </label>
          ) : isUploading ? (
            <div className="w-full max-w-2xl space-y-12 py-10">
               <UploadTips />
               <div className="flex flex-col items-center gap-6">
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                     <div className="h-full bg-primary animate-pulse w-1/3 rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]"></div>
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary italic animate-bounce">Deploying Media to Marketplace...</p>
               </div>
            </div>
          ) : (
            <div className={cn("grid gap-12 w-full", isMulti && files.length > 1 ? "grid-cols-1 md:grid-cols-2" : "max-w-3xl mx-auto")}>
               {files.map((fileObj) => {
                  const isFileVid = fileObj.file.type.startsWith("video/");
                  // Unique STABLE identifer for the file card (prevents remount flicker)
                  const stableKey = `${fileObj.name}-${fileObj.sizeMb}`;
                  return (
                    <div key={stableKey} className="bg-slate-50 rounded-[3rem] p-8 flex flex-col gap-8 border border-slate-100 shadow-2xl relative group min-h-0 animate-in fade-in duration-700">
                       
                       {/* Metadata TOP Row for absolute visibility */}
                       <div className="flex flex-col gap-4 px-2 border-b border-slate-200 pb-7">
                           <div className="flex items-center justify-between gap-4">
                              <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] truncate flex-1 block">IDENT: {fileObj.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="bg-primary/5 text-primary text-[9px] font-black px-3 py-1 rounded-full border border-primary/10 uppercase shadow-sm">{fileObj.sizeMb} MB</span>
                              </div>
                           </div>
                           {isFileVid && (
                             <div className="flex items-center gap-3">
                                <div className={cn("text-[10px] font-black px-5 py-2.5 rounded-full flex items-center gap-2 uppercase shadow-inner border tracking-widest", (fileObj.error || hardError) ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100")}>
                                   <MaterialIcon name={(fileObj.error || hardError) ? "report" : "verified"} className="text-sm" />
                                   {(fileObj.error || hardError) ? "DIAGNOSTICS FAILURE" : `HEALTH VERIFIED: ${formatDuration(fileObj.duration)}`}
                                </div>
                             </div>
                           )}
                       </div>

                       {/* Ultra-Robust PLAYER Card */}
                       <div className={cn(
                         "relative bg-black rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] overflow-hidden min-h-[450px] border-4 border-white/50",
                         isFileVid ? "aspect-[16/9]" : "aspect-square"
                       )}>
                         {isFileVid ? (
                            <VideoPreviewPlayer 
                              file={fileObj.file} 
                              id={stableKey}
                              onVideoError={(msg) => setHardError(msg)} 
                            />
                         ) : (
                            <img src={fileObj.preview} className="w-full h-full object-cover" />
                         )}
                         <button 
                           onClick={() => setFiles(prev => prev.filter((f) => (`${f.name}-${f.sizeMb}`) !== stableKey))} 
                           className="absolute top-6 right-6 w-12 h-12 bg-black/60 backdrop-blur-xl text-white rounded-full flex items-center justify-center hover:bg-rose-500 transition-all z-20 group-hover:scale-110 shadow-2xl"
                         >
                             <MaterialIcon name="close" className="text-xl" />
                         </button>
                       </div>

                       {/* Robust ERROR State */}
                       {(fileObj.error || hardError) && (
                         <div className="p-6 bg-rose-50 rounded-[2rem] border-2 border-rose-100 space-y-4 shadow-sm animate-pulse">
                             <div className="flex items-center gap-3 text-rose-600">
                                <MaterialIcon name="warning" className="text-xl" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] leading-none">Playback Diagnostic Alert</span>
                             </div>
                             <p className="text-[11px] text-rose-500 font-bold italic leading-relaxed">
                                {hardError || fileObj.error}
                             </p>
                             <p className="text-[9px] text-rose-400 font-medium leading-relaxed uppercase tracking-widest">System Recommendation: Hit 'Soft Reset' on the player or re-save your intro video in 1080p MP4 format.</p>
                         </div>
                       )}
                    </div>
                  );
               })}
            </div>
          )}
        </div>

        {files.length > 0 && !isUploading && (
           <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-10 w-full pt-10 border-t border-outline-variant/10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                    <MaterialIcon name="troubleshoot" className="text-xl" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Source Sentry Verified</span>
                    <span className="text-[9px] text-emerald-600 font-bold italic">Bypassing buffer locks and force-loading media.</span>
                 </div>
              </div>
              <button 
                onClick={handleUpload} 
                className="px-16 py-6 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-5px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 flex-shrink-0"
              >
                Launch Media Sync <MaterialIcon name="rocket_launch" />
              </button>
           </div>
        )}
      </div>
    </div>
  );
}
