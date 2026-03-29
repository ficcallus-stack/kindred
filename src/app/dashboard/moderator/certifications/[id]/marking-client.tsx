"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { markExamSubmission } from "../../actions";
import { useToast } from "@/components/Toast";
import Link from "next/link";

export default function MarkingClient({ submission }: { submission: any }) {
  const [score, setScore] = useState<number>(submission.score || 0);
  const [notes, setNotes] = useState(submission.moderatorNotes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmitGrade = async () => {
    if (score < 0 || score > 100) {
      showToast("Score must be between 0 and 100", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await markExamSubmission(submission.id, score, notes);
      showToast("Submission marked successfully!", "success");
      router.push("/dashboard/moderator/certifications");
      router.refresh();
    } catch (err: any) {
      showToast(err.message || "Failed to mark submission", "error");
      setIsSubmitting(false);
    }
  };

  const answers = submission.answers as Record<string, string>;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Link href="/dashboard/moderator/certifications" className="hover:text-primary transition-colors">Exam Marking</Link>
        <MaterialIcon name="chevron_right" className="text-xs" />
        <span className="text-primary font-bold">Review Attempt</span>
      </nav>

      <header className="flex justify-between items-end">
        <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 overflow-hidden relative border border-slate-200 shadow-inner flex items-center justify-center font-headline font-black text-3xl text-primary/20">
                {submission.caregiver.fullName?.[0]}
            </div>
            <div>
                <h2 className="font-headline text-4xl font-black text-primary tracking-tighter italic leading-tight">
                    {submission.caregiver.fullName}
                </h2>
                <p className="text-on-surface-variant opacity-60 font-medium">
                    {submission.exam.title} • Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                </p>
            </div>
        </div>
        <div className="bg-secondary/5 px-6 py-2 rounded-full border border-secondary/10 text-secondary font-headline font-black text-xs uppercase tracking-[0.2em]">
          Qualitative Assessment
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-12">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-primary/5 space-y-12">
                <div className="flex gap-3 items-center text-primary/40">
                    <MaterialIcon name="rule" className="text-xl" />
                    <p className="text-xs font-black uppercase tracking-widest">Marking Protocol: Grade based on safety knowledge and professional conduct.</p>
                </div>
                
                <div className="space-y-20">
                    {submission.exam.questions.map((q: any) => (
                        <div key={q.id} className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4 items-start">
                                    <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-headline font-black italic text-sm shrink-0">
                                        {q.order}
                                    </span>
                                    <h3 className="font-headline font-bold text-xl text-primary leading-tight">
                                        {q.text}
                                    </h3>
                                </div>
                                <span className="px-4 py-1.5 bg-slate-50 rounded-full text-[10px] font-black text-primary/40 uppercase tracking-widest">
                                    {q.marks} Marks
                                </span>
                            </div>
                            <div className="bg-surface-container-low p-10 rounded-[2rem] border border-slate-50 shadow-inner italic text-primary leading-relaxed text-lg relative overflow-hidden group">
                                "{answers[q.id] || "No response provided."}"
                                <MaterialIcon name="format_quote" className="absolute -bottom-4 -right-4 text-8xl text-primary opacity-[0.03] rotate-12" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Grading Sidebar */}
        <div className="lg:col-span-4 sticky top-24 space-y-8">
            <div className="bg-primary text-white p-10 rounded-[3rem] shadow-2xl shadow-primary/10 relative overflow-hidden group">
                <div className="relative z-10 space-y-8">
                    <h3 className="font-headline font-black text-2xl italic tracking-tight">Final Assessment</h3>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-3">Score (0-100)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    min="0" max="100"
                                    value={score}
                                    onChange={(e) => setScore(Number(e.target.value))}
                                    className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-6 text-5xl font-headline font-black outline-none focus:border-secondary transition-all tabular-nums text-center"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-3xl font-headline font-black text-white/20">%</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-3">Reviewer Notes</label>
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-6 min-h-[180px] text-sm outline-none focus:border-secondary transition-all placeholder:text-white/20 font-medium leading-relaxed"
                                placeholder="Add professional feedback..."
                            />
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Decision</span>
                                    <span className="font-headline font-bold text-xl italic">{score >= 75 ? 'Pass - Certify' : 'Fail - Review'}</span>
                                </div>
                                <div className={
                                    `w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                        score >= 75 ? 'bg-secondary text-white' : 'bg-white/10 text-white/40'
                                    }`
                                }>
                                    <MaterialIcon name={score >= 75 ? 'verified' : 'close'} className="text-2xl" fill />
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleSubmitGrade}
                                disabled={isSubmitting}
                                className={`w-full py-6 rounded-2xl font-headline font-black italic text-lg shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${
                                    score >= 75 ? 'bg-secondary text-white hover:shadow-secondary/20' : 'bg-white text-primary hover:shadow-white/20'
                                }`}
                            >
                                {isSubmitting ? 'Finalizing...' : 'Submit Assessment'}
                                <MaterialIcon name="send" />
                            </button>
                        </div>
                    </div>
                </div>
                <MaterialIcon name="gavel" className="absolute -bottom-10 -right-10 text-[15rem] text-white opacity-[0.03] group-hover:scale-110 transition-transform duration-1000" />
            </div>

            <div className="p-10 bg-surface-container-low rounded-[3rem] border border-slate-100 space-y-6 relative overflow-hidden group">
                <div className="flex gap-3 items-center text-primary relative z-10">
                    <MaterialIcon name="info" className="text-2xl" fill />
                    <span className="font-headline font-black text-xs uppercase tracking-widest">Review Protocol</span>
                </div>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed opacity-60 relative z-10">
                    Submitting this assessment will update the caregiver's profile instantly. If passed, the 'Global Care' badge will be activated and a certificate issued.
                </p>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
            </div>
        </div>
      </div>
    </div>
  );
}
