"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { getMyCertifications } from "../../actions";
import { db } from "@/db"; // Caution: client component, using a helper instead
import Link from "next/link";

export default function ExamSuccessPage() {
  const [status, setStatus] = useState<'marking' | 'passed' | 'failed' | 'loading'>('loading');
  const [score, setScore] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkStatus() {
      // Fetch latest submission status
      // In a real app, we'd have a specific action for this
      const certs = await getMyCertifications();
      const globalCert = certs.find(c => c.type === 'standards_program');
      
      // For now, we'll assume the user just submitted and we show 'marking'
      // Unless the DB says otherwise.
      // Since we don't have a 'latest submission' helper yet, we'll default to marking
      // but if the cert is 'completed', we show passed.
      if (globalCert?.status === 'completed') {
        setStatus('passed');
        setScore(92); // Mock for now, would come from DB
      } else {
        setStatus('marking');
      }
    }
    checkStatus();
  }, []);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center font-headline font-bold text-primary animate-pulse">Verifying Certification Status...</div>;
  }

  if (status === 'marking') {
    return (
      <main className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden px-6 text-center">
        <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-secondary-fixed/10 rounded-full blur-[120px] -z-10"></div>
        <div className="w-full max-w-2xl space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center px-6 py-2 rounded-full bg-secondary/5 text-secondary font-headline font-black text-xs tracking-[0.3em] uppercase">
            Submission Received
          </div>
          <h1 className="font-headline text-5xl md:text-6xl font-black text-primary tracking-tighter italic leading-none">
            Exam Under <br /> Professional Review.
          </h1>
          <p className="text-on-surface-variant text-xl leading-relaxed opacity-80">
            Your open-ended responses have been securely transmitted to our Global Certification board. A certified moderator will review your answers within 24-48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Link 
              href="/dashboard/nanny/certifications"
              className="px-12 py-5 bg-primary text-white rounded-2xl font-headline font-black italic text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
            >
              Back to Dashboard
              <MaterialIcon name="arrow_forward" fill />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Passed State (User Design)
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden pt-16">
      <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-secondary-fixed/20 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[35rem] h-[35rem] bg-primary-fixed/30 rounded-full blur-[100px] -z-10"></div>
      
      <div className="w-full max-w-6xl px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
        {/* Content Side */}
        <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center px-5 py-2 rounded-full bg-emerald-50 text-emerald-600 font-headline font-black text-xs font-bold tracking-[0.3em] uppercase border border-emerald-100 animate-pulse">
            Certification Achieved
          </div>
          <div className="space-y-6">
            <h1 className="font-headline text-6xl lg:text-8xl font-black text-primary tracking-tighter leading-[0.9] italic">
              Congratulations,<br />Care Professional.
            </h1>
            <p className="text-on-surface-variant text-xl lg:text-2xl max-w-xl leading-relaxed opacity-80">
              You have officially mastered the highest standards of professional childcare. Your commitment to safety and early development sets you apart as a leader in the field.
            </p>
          </div>

          <div className="flex items-end gap-16 py-8 border-y border-slate-100">
            <div className="relative">
              <span className="block font-headline text-8xl lg:text-9xl font-black text-primary leading-none tracking-tighter">{score}%</span>
              <span className="block font-headline font-black tracking-[0.2em] text-on-surface-variant mt-4 text-xs opacity-40 uppercase">Final Score</span>
            </div>
            <div className="h-24 w-[2px] bg-slate-100 mb-4"></div>
            <div>
              <span className="block font-headline text-3xl lg:text-4xl font-black text-secondary leading-none italic tracking-tight">Global Tier</span>
              <span className="block font-headline font-black tracking-[0.2em] text-on-surface-variant mt-4 text-xs opacity-40 uppercase">Ranking</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-6">
            <button className="px-10 py-5 bg-primary text-white rounded-2xl font-headline font-black italic text-lg shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-4">
              <MaterialIcon name="verified" fill />
              Add to Profile
            </button>
            <button className="px-10 py-5 bg-white border-2 border-slate-100 text-primary rounded-2xl font-headline font-black italic text-lg hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-4">
              <MaterialIcon name="share" />
              Share Success
            </button>
          </div>
        </div>

        {/* Badge Side */}
        <div className="lg:col-span-5 relative group animate-in fade-in zoom-in-95 duration-1000 delay-300">
          <div className="relative z-10 p-12 surface-container-lowest shadow-[0_40px_100px_rgba(3,31,65,0.1)] bg-white flex flex-col items-center text-center rounded-[3rem] border border-slate-50">
            <div className="w-full aspect-square relative mb-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-secondary-fixed/30 animate-[ping_3s_infinite] opacity-50"></div>
              <div className="absolute inset-8 rounded-full border-2 border-primary-fixed/20 animate-pulse"></div>
              <div className="relative z-20 w-56 h-56 lg:w-72 lg:h-72 rounded-full bg-primary shadow-2xl flex flex-col items-center justify-center text-white p-8 border-8 border-white/10 group-hover:scale-110 transition-transform duration-700">
                <MaterialIcon name="award_star" className="text-7xl lg:text-9xl mb-4 text-secondary" fill />
                <div className="w-16 h-1 bg-secondary mb-6 rounded-full opacity-50"></div>
                <span className="font-headline font-black text-sm lg:text-base tracking-[0.3em] uppercase leading-tight italic">Global Care</span>
                <span className="font-headline font-light text-xs tracking-[0.2em] uppercase opacity-60">Professional</span>
              </div>
              <div className="absolute top-4 right-4 w-20 h-20 bg-secondary rounded-full flex items-center justify-center shadow-2xl border-4 border-white -rotate-12 group-hover:rotate-0 transition-all duration-500">
                <MaterialIcon name="check_circle" className="text-white text-3xl" fill />
              </div>
            </div>
            <h3 className="font-headline text-3xl font-black text-primary mb-2 italic">Global Care Professional</h3>
            <p className="font-body font-black text-on-surface-variant text-[10px] tracking-[0.3em] uppercase opacity-40">ID: GCC-2024-992-PX</p>
            <div className="mt-10 pt-10 border-t border-slate-100 w-full">
              <p className="font-body text-sm text-on-surface-variant italic opacity-60">"Authorized Excellence in Professional Caregiving"</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
