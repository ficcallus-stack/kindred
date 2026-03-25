"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import Link from "next/link";

const TICKETS = [
  {
    id: "KC-8492",
    name: "Elena Rodriguez",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYP51Z5zl9K0O1TBB_2o3yKjVCe9PWyGl3PIV1UV0rD5JeLoCbA1VQaC6zCSsUk4MCzgVWX5IpPPbWW0LOKel5kz3A50GsvkUycpLdrTU8F41d9uiFT2Tr_TsnJsbCUSreCJz7cZIP28hHErmMUOix-TVhOK_u0yoU_pWf1mi38N05MDg1dCwg4uX7uE-j5aRU1T5xkkqM1OLG4ENRMZb0jHRJdsn87oXh-ewTh2R39oyJoGEys33-daE3Yud8rO1NSvJpfrA3OBc",
    status: "Urgent",
    role: "Parent Member",
    time: "12m ago",
    category: "Safety Concern",
    escalated: true,
    content: "I noticed some unusual behavior from a potential caregiver during our initial chat. They asked for my home address before even confirming a phone interview...",
  },
  {
    id: "KC-8501",
    name: "Marcus Thorne",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDseKrc04tOGk5RsNPLmrIRj22QVVSw53kmCC7ZoGoYpQMKDfMtudbxR6NvSFRQtROgaPo6tt4gTaxJvkjN193OeAaoalfMbGRJqvOG5UZ_R_JbAfsYwC73hskXINYcTsPlOTBzz6EFJHUhTJqidkYgVw5-S8Q4irjgjWWt2qMF-P4vqVWE18znaHvBZGwH-iF9fY5DL5HrFoq0fxCeCIRsW8oG0agK-tanJRQbqT8nWhi_xL-NdX9prAfsQLUYZ9OYLv6upzKz-Nw",
    status: "In-Progress",
    role: "Professional Nanny",
    time: "45m ago",
    category: "Payment Issue",
    escalated: false,
    content: "The payment for my last three-day booking with the Harrison family hasn't reflected in my dashboard yet. Could you check the transaction status?",
  },
  {
    id: "KC-8432",
    name: "Sarah Chen",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmQqh9eRZ4iiEAQ5jJrCfE7A4a_XM8SKbWoGr5-KtSJq2tRyv51lg_P5uK48Pdjb5sYibjh3bEvdDQpBRBt-VxA1DwLeKUKQG98M3ztYnXWQxFP2tGVJYTIddVefDCxU4gO1gmyYsEurxDse435-PC-jl2q2q9XJI5TXHj-o8nzmRo6OKzpFi-OeQfk65QlK14TByuUX9z77VxJ5-IRQVYFd2Y3R6LRcUjx-JDONtRexs1oIQzUqnihxpRBOlK7N13DQjL9Q2jvbM",
    status: "Open",
    role: "Parent Member",
    time: "2h ago",
    category: "Login Error",
    escalated: false,
    content: "I keep getting a 403 error when trying to access the booking calendar from my mobile app. It works fine on desktop, but I need it for today's pickup.",
  },
];

export default function SupportPage() {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Quick Filter Sidebar */}
      <aside className="w-full md:w-64 space-y-8">
        <section>
          <h3 className="font-headline text-xs font-extrabold uppercase tracking-[0.2em] text-on-surface-variant mb-6">Filter Queue</h3>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-primary text-white font-semibold shadow-md shadow-primary/20">
              <span className="flex items-center gap-3"><MaterialIcon name="all_inbox" className="text-[20px]" /> All Tickets</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">24</span>
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-surface-container transition-colors text-on-surface-variant font-medium">
              <span className="flex items-center gap-3"><MaterialIcon name="priority_high" className="text-[20px] text-error" /> Urgent</span>
              <span className="text-xs font-bold">4</span>
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-surface-container transition-colors text-on-surface-variant font-medium">
              <span className="flex items-center gap-3"><MaterialIcon name="memory" className="text-[20px] text-slate-400" /> Technical</span>
              <span className="text-xs font-bold">12</span>
            </button>
          </div>
        </section>

        <section className="p-6 rounded-2xl bg-primary/5 border border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <MaterialIcon name="auto_awesome" className="text-primary text-lg" fill />
            <span className="text-sm font-headline font-bold text-primary">AI Triage</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-4 font-medium">
            3 safety concerns detected in the last hour. These have been auto-prioritized to the top.
          </p>
          <button className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1 hover:underline">
            Review Now <MaterialIcon name="arrow_forward" className="text-sm" />
          </button>
        </section>
      </aside>

      {/* Ticket List Container */}
      <div className="flex-1">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-headline text-3xl font-extrabold text-primary tracking-tight">Active Queue</h2>
            <p className="text-on-surface-variant mt-1 max-w-lg">Managing requests from 14 families and 10 caregivers.</p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface-variant text-sm font-bold flex items-center gap-2 border border-outline-variant/10 hover:bg-surface-container-highest transition-colors">
            <MaterialIcon name="sort" className="text-sm" /> Newest First
          </button>
        </div>

        {/* Tickets */}
        <div className="space-y-4">
          {TICKETS.map((ticket) => (
            <Link 
              key={ticket.id} 
              href={`/dashboard/moderator/support/${ticket.id}`}
              className="group relative bg-surface-container-lowest p-6 rounded-2xl hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 flex gap-6 items-start border border-outline-variant/5"
            >
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl",
                ticket.status === "Urgent" && "bg-error",
                ticket.status === "In-Progress" && "bg-amber-500",
                ticket.status === "Open" && "bg-slate-400"
              )} />
              
              <img 
                src={ticket.avatar} 
                alt={ticket.name} 
                className="w-14 h-14 rounded-2xl object-cover shrink-0 shadow-sm"
              />

              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-headline font-bold text-lg text-primary">{ticket.name}</h4>
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest",
                      ticket.status === "Urgent" && "bg-error-container text-error",
                      ticket.status === "In-Progress" && "bg-amber-100 text-amber-800",
                      ticket.status === "Open" && "bg-slate-100 text-slate-800"
                    )}>
                      {ticket.status}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">• {ticket.role}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-400">{ticket.time}</span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-surface-container-low text-slate-600 text-xs font-bold">{ticket.category}</span>
                  {ticket.escalated && (
                    <span className="flex items-center gap-1 text-xs text-error font-bold italic">
                      <MaterialIcon name="emergency_home" className="text-sm" /> Escalated to Security
                    </span>
                  )}
                </div>

                <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2 font-medium">
                  "{ticket.content}"
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:scale-105 transition-transform shadow-sm">Claim</button>
                <button className="px-4 py-2 bg-surface-container text-on-surface-variant rounded-xl text-xs font-bold hover:bg-surface-container-highest transition-colors border border-outline-variant/10">Details</button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
