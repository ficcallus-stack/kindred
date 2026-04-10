"use client";

import { useState, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";

export function PulseSync() {
    const { showToast } = useToast();
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [isPromptVisible, setIsPromptVisible] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!("Notification" in window)) {
            showToast("Notifications not supported in this browser.", "error");
            return;
        }

        const result = await Notification.requestPermission();
        setPermission(result);
        
        if (result === "granted") {
            showToast("Pulse Synced! You're now at high frequency.", "success");
            // Here we would call the actual subscription logic (Phase 5)
        } else if (result === "denied") {
            showToast("Pulse Flatlined. You manually opted for slow alerts.", "info");
        }
        setIsPromptVisible(false);
    };

    if (permission === "granted") return null;

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-primary/[0.02] -z-10" />
            <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-1000 rotate-12">
                <MaterialIcon name="bolt" className="text-[200px] text-primary" />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className={cn(
                    "w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl relative",
                    permission === "denied" ? "bg-red-50 text-red-400" : "bg-primary text-white"
                )}>
                    <MaterialIcon name={permission === "denied" ? "heart_broken" : "electric_bolt"} className="text-4xl animate-pulse" />
                    {permission === "default" && (
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm ring-4 ring-amber-400/20">!</span>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left">
                    {permission === "denied" ? (
                        <>
                            <h3 className="text-xl font-headline font-black text-red-500 italic tracking-tight mb-2">Pulse Alert: Direct Flatline 🕯️</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed italic max-w-lg">
                                You've denied notification access. This means other nannies will see new job postings **minutes before you**. 
                                Your "Speed-to-Hire" score is currently at risk.
                            </p>
                            <button className="mt-4 text-[10px] font-black text-red-400 underline uppercase tracking-widest hover:text-red-600 transition-colors">
                                How to re-enable in settings
                            </button>
                        </>
                    ) : (
                        <>
                            <h3 className="text-xl font-headline font-black text-primary italic tracking-tight mb-2">Activate Elite Pulse Sync ⚡</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed italic max-w-lg">
                                Kindred Nannies with **Pulse Sync** enabled are hired 3x faster. Get sub-second browser alerts for new bookings and payments, even when the tab is closed.
                            </p>
                        </>
                    )}
                </div>

                {permission === "default" && (
                    <button 
                        onClick={requestPermission}
                        className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all"
                    >
                        Sync My Pulse <MaterialIcon name="sensors" className="ml-2" />
                    </button>
                )}
            </div>
        </div>
    );
}
