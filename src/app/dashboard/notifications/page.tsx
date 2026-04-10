"use client";

import { useState, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { PulseSync } from "@/components/notifications/PulseSync";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: string;
    linkUrl?: string;
    isRead: boolean;
    createdAt: string | Date;
}

export default function NotificationCentrePage() {
    const { user, role } = useAuth();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [filter, setFilter] = useState<"all" | "unread" | "broadcast">("all");
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchNotifications();
    }, [user]);

    const markAllRead = async () => {
        try {
            const res = await fetch("/api/notifications", { method: "PATCH" });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (err) {
            console.error("Failed to mark all read:", err);
        }
    };

    const filtered = notifications.filter(n => {
        if (filter === "unread") return !n.isRead;
        if (filter === "broadcast") return n.type === "broadcast";
        return true;
    });

    return (
        <div className="max-w-5xl mx-auto py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                <div>
                    <h1 className="font-headline text-5xl font-black text-primary tracking-tighter italic mb-4">Notification Centre</h1>
                    <p className="text-slate-500 font-medium italic">Your real-time record of platform events, payments, and community broadcasts.</p>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button 
                        onClick={markAllRead}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/10 hover:-translate-y-1 transition-all flex items-center gap-3"
                    >
                        Mark All as Read <MaterialIcon name="done_all" />
                    </button>
                )}
            </div>

            {/* Pulse Sync for Nannies */}
            {role === "caregiver" && <PulseSync />}

            {/* Filters & Content */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                <div className="flex border-b border-slate-100 p-2 bg-slate-50/50">
                    {(["all", "unread", "broadcast"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-2xl",
                                filter === f ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {f} {f === "unread" && notifications.filter(n => !n.isRead).length > 0 && `(${notifications.filter(n => !n.isRead).length})`}
                        </button>
                    ))}
                </div>

                <div className="flex-1">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center p-20">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6">
                                <MaterialIcon name="notifications_none" className="text-5xl text-slate-200" />
                            </div>
                            <h3 className="text-lg font-black text-slate-300 uppercase tracking-widest italic">No pulse detected</h3>
                            <p className="text-xs text-slate-400 mt-2 font-medium">All caught up! Check back later for new updates.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filtered.map((notif) => (
                                <Link 
                                    key={notif.id}
                                    href={notif.linkUrl || "#"}
                                    className={cn(
                                        "flex items-start gap-6 p-8 hover:bg-slate-50 transition-all relative group",
                                        !notif.isRead && "bg-primary/[0.01] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary"
                                    )}
                                >
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                                        notif.type === "broadcast" ? "bg-amber-50 text-amber-500" : 
                                        notif.type === "payment" ? "bg-emerald-50 text-emerald-500" :
                                        notif.type === "booking" ? "bg-primary/5 text-primary" : "bg-slate-100 text-slate-400"
                                    )}>
                                        <MaterialIcon name={
                                            notif.type === "broadcast" ? "campaign" : 
                                            notif.type === "payment" ? "payments" :
                                            notif.type === "booking" ? "event_available" : "notifications"
                                        } className="text-2xl" />
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-center">
                                            <h4 className={cn("text-lg font-black tracking-tight", notif.isRead ? "text-slate-600" : "text-primary italic")}>
                                                {notif.title}
                                            </h4>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-sm leading-relaxed font-medium italic opacity-80">{notif.message}</p>
                                        
                                        {notif.linkUrl && (
                                            <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                                    Action Required <MaterialIcon name="arrow_forward" className="text-xs" />
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] italic">Pulse History persists for 30 days</p>
                    </div>
                )}
            </div>
        </div>
    );
}
