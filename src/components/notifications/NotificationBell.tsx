"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useAbly } from "ably/react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, BellDot, BellRing, Inbox } from "lucide-react";

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: string;
    linkUrl?: string;
    isRead: boolean;
    createdAt: string | Date;
}

export function NotificationBell() {
    const { user, role } = useAuth();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 1. Fetch initial notifications
    useEffect(() => {
        if (!user) return;
        const fetchNotifications = async () => {
            try {
                const res = await fetch("/api/notifications");
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            }
        };
        fetchNotifications();
    }, [user]);

    const handleNewNotification = (data: any) => {
        setNotifications(prev => [data, ...prev].slice(0, 50));
    };

    // Handle outside clicks to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAllRead = async () => {
        try {
            const res = await fetch("/api/notifications", { method: "PATCH" });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    if (!user) return null;

    return (
        <div 
            className="relative" 
            ref={dropdownRef}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <Link 
                href="/dashboard/notifications"
                className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center transition-all relative border group",
                    unreadCount > 0 
                      ? "bg-primary/5 border-primary/20 text-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20" 
                      : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:border-slate-300"
                )}
            >
                {unreadCount > 0 ? (
                    <BellRing className="w-[1.2rem] h-[1.2rem] animate-pulse group-hover:scale-110 transition-transform" />
                ) : (
                    <Bell className="w-[1.2rem] h-[1.2rem] group-hover:scale-110 transition-transform" />
                )}
                
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-gradient-to-br from-primary to-primary-container text-white text-[9px] font-black rounded-full flex items-center justify-center px-1.5 border-2 border-white shadow-xl animate-in zoom-in duration-500">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </Link>

            {/* Dropdown Hub */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-4 w-[350px] bg-white rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(3,31,65,0.12)] border border-slate-200/50 z-[100] animate-in slide-in-from-top-4 duration-500 overflow-hidden flex flex-col max-h-[500px]">
                    <div className="px-7 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                              <BellDot className="w-4 h-4 text-primary" />
                           </div>
                           <h4 className="font-headline font-black text-primary text-xs uppercase tracking-[0.2em] italic">Pulse Feed</h4>
                        </div>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-[10px] font-black text-primary hover:text-primary-container transition-colors uppercase tracking-widest underline decoration-2 underline-offset-4 decoration-primary/20">
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="py-16 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto opacity-50">
                                    <Inbox className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Your pulse is quiet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.slice(0, 5).map((notif) => (
                                    <Link 
                                        key={notif.id}
                                        href={notif.linkUrl || "/dashboard/notifications"}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "flex flex-col gap-1.5 p-6 hover:bg-slate-50 transition-all relative group",
                                            !notif.isRead && "bg-primary/[0.02]"
                                        )}
                                    >
                                        {!notif.isRead && (
                                            <div className="absolute left-3 top-7 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(3,31,65,0.4)]" />
                                        )}
                                        <div className="flex justify-between items-start gap-4">
                                            <p className="text-[12px] font-black text-[#031f41] leading-snug tracking-tight pr-4">{notif.title}</p>
                                            <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap pt-0.5 opacity-60">
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed opacity-80 italic line-clamp-2">{notif.message}</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link 
                        href="/dashboard/notifications" 
                        onClick={() => setIsOpen(false)}
                        className="p-5 text-center border-t border-slate-100 bg-slate-50/50 hover:bg-white transition-all group"
                    >
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic group-hover:tracking-[0.5em] transition-all">Pulse Dashboard &rarr;</span>
                    </Link>
                </div>
            )}

            {/* Real-time Sync Support - Guarded to prevent hook crash */}
            {user?.uid && (
                <RealtimeNotificationSync 
                    uid={user.uid} 
                    role={role} 
                    onNotify={handleNewNotification} 
                />
            )}
        </div>
    );
}

function RealtimeNotificationSync({ uid, role, onNotify }: { uid: string; role: any; onNotify: (data: any) => void }) {
    const ably = useAbly();
    
    useEffect(() => {
        if (!ably || !uid) return;

        // User specific channel
        const userChannel = ably.channels.get(`notifications:${uid}`);
        userChannel.subscribe("new", (message) => onNotify(message.data));

        // Global channel
        const globalChannel = ably.channels.get(`notifications:global`);
        globalChannel.subscribe("broadcast", (message) => {
            if (message.data.targetRole === "all" || message.data.targetRole === role) {
                onNotify(message.data);
            }
        });

        return () => {
            userChannel.unsubscribe("new");
            globalChannel.unsubscribe("broadcast");
        };
    }, [ably, uid, role, onNotify]);

    return null;
}
