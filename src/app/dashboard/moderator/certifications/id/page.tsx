"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { markExamSubmission } from "../../actions";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { db } from "@/db"; // Client-safe if using an action helper

export default function ModeratorExamMarkingPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchSubmission() {
      // In a real app we'd call a dedicated action
      // For now we'll fetch via the list or a new action
      // We'll simulate fetching for the initial UI
      setLoading(false);
    }
    fetchSubmission();
  }, [id]);

  const handleSubmitGrade = async () => {
    if (score < 0 || score > 100) {
      showToast("Score must be between 0 and 100", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await markExamSubmission(id as string, score, notes);
      showToast("Submission marked successfully!", "success");
      router.push("/dashboard/moderator/certifications");
    } catch (err: any) {
      showToast(err.message || "Failed to mark submission", "error");
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading Submission...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Link href="/dashboard/moderator/certifications" className="hover:text-primary transition-colors">Exam Marking</Link>
        <MaterialIcon name="chevron_right" className="text-xs" />
        <span className="text-primary font-bold">Review Attempt</span>
      </nav>

      <header className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-4xl font-black text-primary tracking-tighter italic">Review Certification Exam</h2>
          <p className="text-on-surface-variant opacity-60 font-medium">Submission ID: {id}</p>
        </div>
        <div className="bg-secondary/5 px-6 py-2 rounded-full border border-secondary/10 text-secondary font-headline font-black text-xs uppercase tracking-[0.2em]">
          Qualitative Assessment
        </div>
      </header>

      {/* Main Review Grid */}
      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-12">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-primary/5 space-y-10">
                <p className="text-sm font-bold text-slate-400 italic">Please carefully review the responses below against the Global Caregiver Standards guidelines. Grade based on accuracy, professional tone, and depth of knowledge.</p>
                
                <div className="space-y-16">
                    {/* Questions & Answers would be mapped here */}
                    <div className="space-y-6">
                        <div className="flex gap-4 items-center">
                            <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-headline font-black italic text-xs">1</span>
                            <h3 className="font-headline font-bold text-lg text-primary">Question text placeholder?</h3>
                        </div>
                        <div className="bg-surface-container-low p-8 rounded-3xl border border-slate-100 shadow-inner italic text-on-surface-variant leading-relaxed">
                            "User answer placeholder will appear here from the database submission record."
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Grading Sidebar */}
        <div className="lg:col-span-4 sticky top-24 space-y-8">
            <div className="bg-primary text-white p-10 rounded-[2.5rem] shadow-2xl shadow-primary/10">
                <h3 className="font-headline font-bold text-xl mb-6">Final Grade</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-3">Score (0-100)</label>
                        <input 
                            type="number" 
                            min="0" max="100"
                            value={score}
                            onChange={(e) => setScore(Number(e.target.value))}
                            className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-4 text-3xl font-headline font-black outline-none focus:border-secondary transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-3">Moderator Notes</label>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-4 min-h-[150px] text-sm outline-none focus:border-secondary transition-all placeholder:text-white/20"
                            placeholder="Add constructive feedback for the caregiver..."
                        />
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Passing Mark</span>
                            <span className="font-headline font-black text-secondary">75%</span>
                        </div>
                        
                        <button 
                            onClick={handleSubmitGrade}
                            disabled={isSubmitting}
                            className={`w-full py-5 rounded-2xl font-headline font-black italic text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                                score >= 75 ? 'bg-secondary text-white' : 'bg-white text-primary'
                            }`}
                        >
                            {isSubmitting ? 'Processing...' : score >= 75 ? 'Pass & Certify' : 'Mark as Failed'}
                            <MaterialIcon name={score >= 75 ? 'verified' : 'close'} fill />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-8 bg-surface-container-low rounded-[2rem] border border-slate-100 space-y-4">
                <div className="flex gap-3 items-center text-primary">
                    <MaterialIcon name="info" className="text-xl" fill />
                    <span className="font-headline font-black text-xs uppercase tracking-widest">Marking Protocol</span>
                </div>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed opacity-60">Once submitted, results are final and will be emailed to the caregiver instantly. Certifications will be activated for passing scores.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
