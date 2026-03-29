"use client";

import { useRef } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";
import { QRCodeSVG } from "qrcode.react";
import * as htmlToImage from "html-to-image";
import { useState } from "react";
import { redeemReferralBalance } from "@/lib/actions/referral-redemption";
import { useRouter } from "next/navigation";

interface ReferralStats {
  invited: number;
  onboarded: number;
  successful: number;
  balance: number;
  referralCode: string;
  fullName: string;
  photo: string;
  role: string;
}

interface Referral {
  id: string;
  user: {
    fullName: string;
    role: string;
    initials: string;
  };
  status: string;
  date: string;
  potentialEarn: string;
}

interface ReferralDashboardProps {
  stats: ReferralStats;
  recentReferrals: Referral[];
}

export default function ReferralDashboard({ stats, recentReferrals }: ReferralDashboardProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [redeeming, setRedeeming] = useState(false);
  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/signup?ref=${stats.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    showToast("Referral link copied to clipboard!", "success");
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    
    showToast("Preparing your custom referral card...", "success");
    try {
      // Small delay to ensure styles are ready
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#1D3557',
      });
      const link = document.createElement('a');
      link.download = `kindredcare-invite-${stats.fullName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export Error:", err);
      showToast("Failed to generate download. Please try again.", "error");
    }
  };

  const handleRedeem = async () => {
    if (stats.balance <= 0) {
      showToast("You don't have any credits to redeem yet.", "info");
      return;
    }
    setRedeeming(true);
    try {
      const result = await redeemReferralBalance();
      if (result.success) {
        showToast(`Success! $${(result.redeemed! / 100).toFixed(2)} has been moved to your wallet.`, "success");
        // We might want to refresh the stats here, but revalidatePath should handle it if the parent is a server component or re-fetches.
      } else {
        showToast(result.error || "Redemption failed.", "error");
      }
    } catch (error) {
       showToast("An unexpected error occurred during redemption.", "error");
    } finally {
      setRedeeming(false);
    }
  };

  const handleViewPayouts = () => {
    if (stats.role === "caregiver") {
      router.push("/dashboard/nanny/wallet");
    } else {
      router.push("/dashboard/parent/wallet");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-primary text-white p-8 md:p-14 shadow-2xl shadow-primary/20">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-extrabold font-headline leading-tight mb-6 italic tracking-tighter">
            Build the community, <span className="text-secondary-fixed">get rewarded.</span>
          </h1>
          <p className="text-white/70 text-lg mb-10 max-w-lg font-medium leading-relaxed">
            Help families find their perfect match and nannies build their dream career. For every successful referral, we'll top up your Kindred Wallet.
          </p>
          <div className="flex flex-col lg:flex-row gap-4 items-center bg-white/5 backdrop-blur-2xl p-3 pl-8 rounded-3xl border border-white/10 shadow-inner">
            <span className="text-white font-mono tracking-widest flex-grow text-sm opacity-80 overflow-hidden text-ellipsis whitespace-nowrap">
              {stats.referralCode}
            </span>
            <button 
              onClick={copyLink}
              className="w-full lg:w-auto flex items-center justify-center gap-3 bg-white text-primary font-headline font-black py-4 px-10 rounded-2xl hover:bg-secondary-fixed transition-all active:scale-95 shadow-xl"
            >
              <MaterialIcon name="content_copy" className="text-lg" />
              Copy Referral Link
            </button>
          </div>
        </div>
        
        {/* Decorative background icon */}
        <MaterialIcon 
          name="diversity_1" 
          className="absolute -bottom-20 -right-20 text-[35rem] text-white opacity-[0.03] rotate-12 pointer-events-none" 
          fill 
        />
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Credit Wallet */}
        <div className="md:col-span-4 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 bg-primary/5 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <MaterialIcon name="account_balance_wallet" className="text-3xl" fill />
              </div>
              <span className="bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-[10px] font-black font-label tracking-widest uppercase border border-secondary/10">Wallet</span>
            </div>
            <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-3">Available Balance</h3>
            <p className="text-6xl font-extrabold font-headline text-primary tracking-tighter">${(stats.balance / 100).toFixed(2)}</p>
          </div>
          <div className="mt-12 space-y-4 relative z-10">
            <button 
              onClick={handleRedeem}
              disabled={redeeming || stats.balance <= 0}
              className="w-full py-5 bg-primary text-white rounded-2xl font-headline font-black italic text-sm shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
            >
              {redeeming ? "Processing..." : "Redeem Credits"}
            </button>
            <button 
              onClick={handleViewPayouts}
              className="w-full py-3 text-slate-400 font-bold text-xs hover:text-primary transition-colors uppercase tracking-widest"
            >
              View Payout Options
            </button>
          </div>
          <MaterialIcon name="payments" className="absolute -bottom-10 -right-10 text-[12rem] text-primary opacity-[0.02] group-hover:rotate-12 transition-transform duration-1000" />
        </div>

        {/* Referral Pipeline */}
        <div className="md:col-span-8 bg-slate-50 p-10 rounded-[2.5rem] relative overflow-hidden flex flex-col">
          <h3 className="text-xl font-bold font-headline mb-10 flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined text-primary bg-white p-2 rounded-lg shadow-sm" data-icon="insights">insights</span>
            Active Referral Pipeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative flex-grow">
            {/* Pipeline Item 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative z-10 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between mb-6">
                <span className="text-primary font-black text-4xl italic">{stats.invited}</span>
                <MaterialIcon name="person_add" className="text-slate-300 text-2xl" />
              </div>
              <h4 className="font-extrabold text-primary uppercase text-[10px] tracking-widest">Invited</h4>
              <p className="text-sm text-slate-500 mt-2 font-medium">Friends who joined via link</p>
            </div>
            {/* Pipeline Item 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative z-10 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between mb-6">
                <span className="text-primary font-black text-4xl italic">{stats.onboarded}</span>
                <MaterialIcon name="how_to_reg" className="text-slate-300 text-2xl" />
              </div>
              <h4 className="font-extrabold text-primary uppercase text-[10px] tracking-widest">Onboarded</h4>
              <p className="text-sm text-slate-500 mt-2 font-medium">Caregivers verified & active</p>
            </div>
            {/* Pipeline Item 3 */}
            <div className="bg-primary text-white p-8 rounded-3xl border border-primary-container shadow-2xl relative z-10 hover:shadow-primary/20 hover:-translate-y-1 transition-all overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-black text-4xl italic">{stats.successful}</span>
                  <MaterialIcon name="stars" className="text-secondary-fixed text-2xl" fill />
                </div>
                <h4 className="font-extrabold uppercase text-[10px] tracking-widest text-white/60">Successful</h4>
                <p className="text-sm text-white/80 mt-2 font-medium leading-relaxed">Credits unlocked by bookings</p>
              </div>
              <MaterialIcon name="verified" className="absolute -bottom-8 -right-8 text-8xl text-white opacity-[0.05] group-hover:scale-150 transition-transform duration-1000" />
            </div>
          </div>
        </div>

        {/* Invite Card Template */}
        <div className="md:col-span-12 lg:col-span-5 bg-surface-container-low p-10 rounded-[2.5rem] flex flex-col space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black font-headline text-primary italic">Share Card</h3>
            <span className="text-[10px] font-black text-primary bg-white px-4 py-1.5 rounded-full border border-slate-100 uppercase tracking-widest">Post to Social</span>
          </div>
          
          <div ref={cardRef} className="relative bg-[#1D3557] rounded-[2rem] p-10 text-white aspect-[4/5] flex flex-col justify-between overflow-hidden shadow-2xl group">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-white/10">
                      <img src={stats.photo} className="w-full h-full object-cover" alt={stats.fullName} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary mb-1">Personal Invitation</p>
                      <p className="font-headline font-black text-xl italic tracking-tight">{stats.fullName}</p>
                   </div>
                </div>
                <h4 className="text-4xl font-extrabold font-headline leading-tight italic tracking-tighter">You're invited to KindredCare</h4>
                <p className="mt-8 text-white/60 text-lg leading-relaxed font-medium">Join the elite network of caregivers and families. Use my link for a special onboarding reward.</p>
             </div>
             
             <div className="relative z-10 flex items-center justify-between pt-10 border-t border-white/10">
                <div className="bg-white p-3 rounded-2xl flex items-center justify-center shadow-xl">
                    <QRCodeSVG 
                      value={referralLink}
                      size={80}
                      level="H"
                      includeMargin={false}
                    />
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-1">Join the family</p>
                    <p className="text-2xl font-black font-headline italic tracking-tighter">kindredcare.com</p>
                </div>
             </div>
          </div>

          <button 
            onClick={downloadCard}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-100 py-5 rounded-2xl font-headline font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <MaterialIcon name="download" className="text-lg" />
            Download Custom Asset
          </button>
        </div>

        {/* Recent Referrals Table */}
        <div className="md:col-span-12 lg:col-span-7 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
          <h3 className="text-2xl font-black font-headline text-primary mb-10 flex items-center gap-3 italic">
            <MaterialIcon name="history" className="text-slate-300" />
            Recent Referrals
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-primary/30 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                  <th className="pb-6">Profile</th>
                  <th className="pb-6">Status</th>
                  <th className="pb-6">Date Joined</th>
                  <th className="pb-6 text-right">Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentReferrals.length > 0 ? recentReferrals.map((ref) => (
                  <tr key={ref.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary font-black text-xs border border-slate-200 shadow-inner italic">
                          {ref.user.initials}
                        </div>
                        <div>
                          <p className="font-bold text-primary text-sm leading-tight">{ref.user.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{ref.user.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6">
                      <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        ref.status === 'completed' ? 'bg-green-50 text-green-700' : 
                        ref.status === 'onboarded' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          ref.status === 'completed' ? 'bg-green-600' : 
                          ref.status === 'onboarded' ? 'bg-blue-600' : 'bg-slate-400'
                        }`}></span>
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-6 text-sm font-medium text-slate-500">{ref.date}</td>
                    <td className="py-6 text-right font-headline font-black text-primary italic">
                      {ref.potentialEarn}
                    </td>
                  </tr>
                )) : (
                   <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-400 font-medium italic">
                      No referrals yet. Share your code to start earning!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Program Details Card */}
      <footer className="bg-slate-900 text-white/40 p-10 rounded-[2.5rem] mt-20 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="flex items-start gap-6 p-8 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-md">
            <MaterialIcon name="verified_user" className="text-white text-3xl" fill />
            <div>
              <p className="text-sm font-black text-white uppercase tracking-widest mb-1 italic">Identity Policy</p>
              <p className="text-xs font-medium leading-relaxed">
                Credits are applied 24 hours after your referral completes their first 4-hour booking. All users are subject to safety checks to ensure community integrity.
              </p>
            </div>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] space-y-3">
             <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-secondary rounded-full"></span> Payouts calculated in Kindred Wallet Credits</p>
             <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-secondary rounded-full"></span> Links valid for 90 days after first click</p>
             <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-secondary rounded-full"></span> Referral rewards capped at $500 per fiscal year</p>
          </div>
        </div>
        <MaterialIcon name="shield" className="absolute -bottom-10 -right-10 text-[15rem] text-white opacity-[0.02]" fill />
      </footer>
    </div>
  );
}
