"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { useState } from "react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-10 max-w-4xl space-y-10">
      <header>
        <h1 className="text-3xl font-black text-[#002B5B] tracking-tight">Settings</h1>
        <p className="text-slate-400 text-sm font-bold mt-1">Platform configuration</p>
      </header>

      {/* General Settings */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8">
        <h2 className="text-lg font-black text-[#002B5B] tracking-tight flex items-center gap-3">
          <MaterialIcon name="tune" className="text-xl" />
          General
        </h2>
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Platform Name</label>
            <input className="w-full bg-[#F8F9FE] rounded-2xl px-6 py-4 border-none text-sm font-bold text-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 outline-none" defaultValue="KindredCare US" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Support Email</label>
            <input className="w-full bg-[#F8F9FE] rounded-2xl px-6 py-4 border-none text-sm font-bold text-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 outline-none" defaultValue="support@kindredcare.us" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Platform Commission (%)</label>
            <input className="w-full bg-[#F8F9FE] rounded-2xl px-6 py-4 border-none text-sm font-bold text-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 outline-none" defaultValue="15" type="number" />
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-lg font-black text-[#002B5B] tracking-tight flex items-center gap-3">
          <MaterialIcon name="notifications" className="text-xl" />
          Notifications
        </h2>
        {["Email alerts for new signups", "Email alerts for new payments", "Email alerts for flagged content"].map((item) => (
          <div key={item} className="flex items-center justify-between py-3">
            <span className="text-sm font-bold text-slate-600">{item}</span>
            <button className="w-12 h-7 bg-[#002B5B] rounded-full relative transition-all">
              <span className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm" />
            </button>
          </div>
        ))}
      </section>

      <button
        onClick={handleSave}
        className="px-8 py-4 bg-[#002B5B] text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
      >
        {saved ? "✓ Saved" : "Save Changes"}
      </button>
    </div>
  );
}
