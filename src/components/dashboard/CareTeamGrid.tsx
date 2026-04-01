"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { StabilityBadge } from "./StabilityBadge";
import Link from "next/link";

interface CareTeamMember {
  id: string;
  caregiverId: string;
  caregiverName: string;
  caregiverImage: string;
  nickname: string;
  status: string;
  lastActive: string;
  createdAt: string | Date;
}

interface CareTeamGridProps {
  members: CareTeamMember[];
}

export function CareTeamGrid({ members }: CareTeamGridProps) {
  if (members.length === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-md rounded-[3rem] p-12 border border-outline-variant/10 text-center space-y-4">
        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <MaterialIcon name="group_add" className="text-4xl text-primary/30" />
        </div>
        <h3 className="font-headline text-2xl font-black text-primary tracking-tight">Your Care Team is Empty</h3>
        <p className="text-on-surface-variant text-sm font-medium max-w-xs mx-auto opacity-60 leading-relaxed italic">
          Start building your trusted network by adding your favorite nannies to your Core Team.
        </p>
        <div className="pt-4">
          <Link 
            href="/nannies"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            Discover Elite Talent
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {members.map((member) => (
        <div 
          key={member.id} 
          className="group relative bg-white p-8 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-700 border border-outline-variant/5 overflow-hidden"
        >
          {/* Status Indicator */}
          <div className="absolute top-6 right-8 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Available</span>
          </div>

          <div className="flex flex-col items-center text-center space-y-6 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] rotate-6 group-hover:rotate-0 transition-transform duration-700"></div>
              <img 
                src={member.caregiverImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.caregiverName}`}
                alt={member.caregiverName}
                className="w-32 h-32 rounded-[2.5rem] object-cover relative z-10 shadow-2xl border-4 border-white transition-all duration-700 group-hover:scale-105"
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-headline text-2xl font-black text-primary tracking-tight">{member.caregiverName}</h4>
              <div className="flex flex-col items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary">{member.nickname || "Primary Caregiver"}</p>
                <StabilityBadge createdAt={new Date(member.createdAt)} size="sm" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 w-full">
              <Link 
                href={`/dashboard/messages/${member.caregiverId}`}
                className="flex-1 py-4 bg-surface-container-high rounded-2xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
              >
                <MaterialIcon name="chat" fill />
              </Link>
              <Link 
                href={`/dashboard/parent/post-job?nannyId=${member.caregiverId}`}
                className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-slate-900 active:scale-95 transition-all"
              >
                <MaterialIcon name="calendar_today" className="text-xs" />
                Quick Book
              </Link>
            </div>
          </div>

          {/* Artistic background blur */}
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        </div>
      ))}

      {/* Add New Slot */}
      <Link 
        href="/dashboard/parent/applicants"
        className="bg-dashed border-4 border-dashed border-outline-variant/30 p-8 rounded-[3rem] flex flex-col items-center justify-center gap-4 text-on-surface-variant hover:border-primary hover:text-primary transition-all group bg-white/30 h-full min-h-[350px]"
      >
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all">
          <MaterialIcon name="person_add" className="text-3xl" />
        </div>
        <div className="text-center">
            <span className="block font-black uppercase tracking-widest text-[11px] mb-1">Expand Team</span>
            <span className="block text-[10px] opacity-40 font-medium italic">From past applicants</span>
        </div>
      </Link>
    </div>
  );
}
