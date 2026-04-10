"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import SafetyOverview from "@/components/safety/Overview";
import SafetyResources from "@/components/safety/Resources";
import SafetyVetting from "@/components/safety/Vetting";
import SafetySecurity from "@/components/safety/Security";
import SafetyReporting from "@/components/safety/Reporting";

type SafetyTab = "overview" | "verification" | "security" | "resources" | "reporting";

export default function SafetyPage() {
  const [activeTab, setActiveTab] = useState<SafetyTab>("overview");

  const TABS = [
    { id: "overview", label: "Overview", icon: "shield_with_heart" },
    { id: "verification", label: "Vetting Process", icon: "verified_user" },
    { id: "security", label: "Security Infrastructure", icon: "lock" },
    { id: "resources", label: "Resource Hub", icon: "auto_stories" },
    { id: "reporting", label: "Reporting & Support", icon: "report" },
  ] as const;

  return (
    <div className="bg-surface min-h-screen text-on-surface selection:bg-secondary-fixed">

      <div className="flex max-w-7xl mx-auto pt-20 min-h-screen relative">
        {/* SideNavBar - Desktop */}
        <aside className="h-full w-80 hidden lg:block sticky top-20 flex flex-col space-y-2 py-12 pr-10 border-r border-outline-variant/10">
          <div className="px-6 mb-10">
            <h2 className="font-headline font-black text-primary text-3xl tracking-tighter">Safety Center</h2>
            <p className="text-on-surface-variant text-[10px] mt-2 font-black uppercase tracking-widest opacity-60">Your peace of mind is our priority</p>
          </div>
          <nav className="space-y-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SafetyTab)}
                className={cn(
                  "w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all group relative overflow-hidden",
                  activeTab === tab.id
                    ? "bg-white text-primary font-black shadow-xl shadow-primary/5 border-l-8 border-primary active:scale-95"
                    : "text-on-surface-variant hover:bg-white hover:shadow-md hover:translate-x-1"
                )}
              >
                <div className={cn("p-2 rounded-xl transition-all", activeTab === tab.id ? "bg-primary/5" : "bg-transparent group-hover:bg-primary/10")}>
                  <MaterialIcon 
                    name={tab.icon} 
                    className={cn("text-xl transition-transform", activeTab === tab.id && "scale-110")} 
                    fill={activeTab === tab.id} 
                  />
                </div>
                <span className="font-headline text-sm tracking-tight">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto px-6 pt-12">
            <button className="w-full py-5 px-6 bg-error-container/20 text-error rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-error hover:text-white shadow-xl shadow-error/10 active:scale-95 flex items-center justify-center gap-3">
              <MaterialIcon name="emergency" />
              Emergency SOS
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 px-4 md:px-12 py-12 text-center lg:text-left overflow-x-hidden">
          {activeTab === "overview" && <SafetyOverview />}
          {activeTab === "verification" && <SafetyVetting />}
          {activeTab === "security" && <SafetySecurity />}
          {activeTab === "resources" && <SafetyResources />}
          {activeTab === "reporting" && <SafetyReporting />}
        </main>
      </div>

      {/* Mobile Navigation (Floating Bottom Bar) */}

      {/* Mobile Navigation (Floating Bottom Bar) */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-white/95 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] px-8 py-5 flex justify-between items-center text-on-surface-variant border border-white p-2">
          {TABS.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SafetyTab)}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all outline-none",
                activeTab === tab.id ? "text-primary scale-125 font-black" : "opacity-40"
              )}
            >
              <MaterialIcon name={tab.icon} className="text-xl" fill={activeTab === tab.id} />
              <span className="text-[8px] font-black uppercase tracking-widest">{tab.id === 'verification' ? 'Vetting' : tab.id === 'reporting' ? 'Report' : tab.id}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
