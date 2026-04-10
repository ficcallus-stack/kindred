"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { MaterialIcon } from '@/components/MaterialIcon';
import { cn } from '@/lib/utils';

// --- MOCK DATA ---
// Removed - Now provided by DB via server actions

// --- SUB-COMPONENTS ---
function KpiCard({ title, value, trend, desc, goodTrend }: any) {
  const isGood = trend === goodTrend;
  const trendIcon = trend === 'up' ? 'call_made' : 'call_received';
  
  return (
    <div className="flex flex-col border-l-2 pl-4 border-slate-200 transition-colors">
      <span className="text-xs font-black uppercase tracking-widest text-slate-400 italic">{title}</span>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-2xl font-black text-primary italic font-headline">{value}</span>
        <span className={cn(
          "flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-md",
          isGood ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-error'
        )}>
          <MaterialIcon name={trendIcon} className="text-[12px] mr-1" />
          {trend === 'up' ? 'UP' : 'DOWN'}
        </span>
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">{desc}</span>
    </div>
  );
}

function ProgressBar({ label, value, max, color, suffix }: any) {
  const percentage = (value / max) * 100;
  
  return (
    <div>
      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2 italic">
        <span className="text-slate-500">{label}</span>
        <span className="text-primary">{value}{suffix}</span>
      </div>
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function FinancialAnalyticsSubtab({ initialData }: { initialData: any }) {
  const { actionCenterAlerts, financialData, liquidityData, userGrowthData } = initialData;

  const chartAxisColor = '#64748b';
  const chartGridColor = '#e2e8f0';
  const chartTooltipStyle = {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    color: '#1D3557',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    fontWeight: 900
  };

  return (
    <div className="space-y-12">
      {/* Action Center */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <MaterialIcon name="monitoring" className="text-xl text-primary" />
          <h2 className="text-xl font-black text-primary tracking-tight uppercase italic">Action Center</h2>
          <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-xl ml-2">Needs Attention</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actionCenterAlerts.map((alert: any) => (
            <div key={alert.id} className={cn("p-6 rounded-3xl border flex gap-4 items-start", alert.bg)}>
              <MaterialIcon name={alert.icon} className={cn("text-2xl mt-1", alert.color)} />
              <p className={cn("text-xs font-bold leading-relaxed", alert.color)}>{alert.message}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Marketplace Liquidity */}
        <motion.section variants={itemVariants} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm col-span-1 lg:col-span-2">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-3 text-primary uppercase italic tracking-tight">
                Matching Health <span className="opacity-50">(Liquidity)</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">How easily parents find nannies and vice-versa.</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Overall Fill Rate</p>
              <p className="text-4xl font-black text-primary font-headline mt-1 italic">80.5%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 p-6 bg-slate-50/50 rounded-3xl border border-slate-50">
            <KpiCard title="Avg Time to 1st App" value="4.2h" trend="down" desc="Target: < 24h" goodTrend="down" />
            <KpiCard title="Apps per Job" value="3.1" trend="up" desc="Healthy competition" goodTrend="up" />
            <KpiCard title="Search-to-Contact" value="42%" trend="up" desc="Parents messaging post-search" goodTrend="up" />
            <KpiCard title="Zero-Result Searches" value="12" trend="up" desc="Parents found nobody" goodTrend="down" />
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={liquidityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: chartAxisColor, fontSize: 10, fontWeight: 800 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: chartAxisColor, fontSize: 10, fontWeight: 800 }} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={chartTooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}/>
                <Bar dataKey="posted" name="Jobs Posted" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="applications" name="Applications Sent" fill="#6366f1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="hired" name="Successfully Hired" fill="#1D3557" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Financial Health */}
        <motion.section variants={itemVariants} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <h2 className="text-2xl font-black text-primary uppercase tracking-tight italic mb-2">Financial Health</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Money flowing vs Platform Retained Cut</p>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-slate-50 rounded-3xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Total Flow (GMV)</p>
              <p className="text-3xl font-black mt-2 text-primary font-headline italic">$82,000</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-2 flex items-center">
                <MaterialIcon name="call_made" className="text-[12px] mr-1"/> +9.3% MoM
              </p>
            </div>
            <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Platform Revenue</p>
              <p className="text-3xl font-black text-primary font-headline mt-2 italic">$13,400</p>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-2 flex items-center">
                <MaterialIcon name="call_made" className="text-[12px] mr-1"/> +14.2% MoM
              </p>
            </div>
          </div>

          <div className="h-[250px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOurCut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D3557" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1D3557" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: chartAxisColor, fontSize: 10, fontWeight: 800 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: chartAxisColor, fontSize: 10, fontWeight: 800 }} tickFormatter={(val) => `$${val/1000}k`} />
                <RechartsTooltip contentStyle={chartTooltipStyle} formatter={(value: any) => `$${value.toLocaleString()}`} />
                <Area type="monotone" dataKey="ourCut" name="Booking Revenue" stroke="#1D3557" strokeWidth={4} fillOpacity={1} fill="url(#colorOurCut)" />
                <Area type="monotone" dataKey="subscriptions" name="Parent Subscriptions" stroke="#8E4E14" strokeWidth={4} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Growth & Retention */}
        <motion.section variants={itemVariants} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <h2 className="text-2xl font-black text-primary uppercase tracking-tight italic mb-2">Growth & Retention</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">User acquisition and platform stickiness</p>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="p-6 border border-slate-100 rounded-3xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Parents Activating</p>
              <p className="text-3xl font-black mt-2 text-primary font-headline italic">68%</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">Post job within 7 days</p>
            </div>
            <div className="p-6 border border-slate-100 rounded-3xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Repeat Booking Rate</p>
              <p className="text-3xl font-black mt-2 text-primary font-headline italic">42%</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">Parents booking 2+ times</p>
            </div>
          </div>

          <div className="h-[250px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: chartAxisColor, fontSize: 10, fontWeight: 800 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: chartAxisColor, fontSize: 10, fontWeight: 800 }} />
                <RechartsTooltip contentStyle={chartTooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}/>
                <Line type="monotone" dataKey="parents" name="Active Parents" stroke="#f59e0b" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="nannies" name="Active Nannies" stroke="#10b981" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Quality & Operations */}
        <motion.section variants={itemVariants} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm col-span-1 lg:col-span-2">
           <div className="flex flex-col md:flex-row gap-12">
             <div className="flex-1">
               <h2 className="text-xl font-black flex items-center gap-3 mb-2 text-primary uppercase italic">
                 <MaterialIcon name="verified" className="text-secondary" /> Platform Quality
               </h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">Trust & safety integrity</p>
               
               <div className="space-y-6">
                 <ProgressBar label="Average Review Score" value={4.8} max={5} color="bg-secondary" suffix="/ 5" />
                 <ProgressBar label="Exam Pass Rate" value={72} max={100} color="bg-emerald-500" suffix="%" />
                 <ProgressBar label="Dispute Rate" value={1.2} max={10} color="bg-amber-500" suffix="%" />
                 <ProgressBar label="Platform Leakage Risk" value={4.5} max={100} color="bg-error" suffix="% (Off-platform attempts)" />
               </div>
             </div>

             <div className="w-px bg-slate-100 hidden md:block"></div>

             <div className="flex-1">
               <h2 className="text-xl font-black flex items-center gap-3 mb-2 text-primary uppercase italic">
                 <MaterialIcon name="manage_accounts" className="text-primary" /> Operations Ops
               </h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">System friction & moderation flow</p>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Pending Approvals</p>
                     <p className="text-4xl font-black text-primary mt-2 font-headline italic">45</p>
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">Nannies waiting</p>
                  </div>
                  <div className="p-6 bg-rose-50/50 rounded-3xl border border-error/10">
                     <p className="text-[10px] font-black text-error uppercase tracking-widest italic">Avg Turnaround</p>
                     <p className="text-4xl font-black text-error mt-2 font-headline italic">72h</p>
                     <p className="text-[9px] text-error/60 font-bold uppercase tracking-widest mt-2">Slower than target (24h)</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 col-span-2">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Support Queue</p>
                     <div className="flex items-end justify-between mt-2">
                       <p className="text-3xl font-black text-primary font-headline italic">12 Open</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Avg res: 4.5h</p>
                     </div>
                  </div>
               </div>
             </div>
           </div>
        </motion.section>

      </motion.div>
    </div>
  );
}
