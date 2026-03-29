"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { getExamData, startExamAttempt, submitExamAttempt } from "../../actions";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

export default function GlobalCareExamPage() {
  const [exam, setExam] = useState<any>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // Default 60 mins
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();
  const router = useRouter();

  // 1. Fetch Exam Data and Start Attempt
  useEffect(() => {
    async function initExam() {
      try {
        const data = await getExamData("standards_program");
        if (!data) throw new Error("Exam not found");
        setExam(data);
        setTimeLeft(data.timeLimit * 60);

        const submission = await startExamAttempt(data.id);
        setSubmissionId(submission.id);
        setLoading(false);
      } catch (err: any) {
        showToast(err.message || "Failed to start exam", "error");
        router.push("/dashboard/nanny/certifications/global-care");
      }
    }
    initExam();
  }, [router, showToast]);

  // 2. Timer Logic
  useEffect(() => {
    if (loading || isSubmitting) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [loading, isSubmitting]);

  // 3. Prevent Exit
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleFinishExam = useCallback(async () => {
    if (!submissionId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitExamAttempt(submissionId, answers);
      showToast("Exam submitted successfully! It is now under review.", "success");
      router.push("/dashboard/nanny/certifications/global-care/success");
    } catch (err: any) {
      showToast(err.message || "Failed to submit exam", "error");
      setIsSubmitting(false);
    }
  }, [submissionId, answers, isSubmitting, router, showToast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-headline font-bold text-primary animate-pulse">Initializing Secure Exam Environment...</p>
      </div>
    );
  }

  const questionsOnPage = exam.questions.filter((q: any) => q.page === currentPage);
  const totalPages = Math.max(...exam.questions.map((q: any) => q.page));
  const progress = (Object.keys(answers).length / exam.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Exam Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="font-headline font-black text-primary tracking-tighter italic">
          Global Standards Certification
        </div>
        <div className={cn(
          "flex items-center gap-3 px-6 py-2 rounded-full border transition-all duration-500",
          timeLeft < 300 ? "bg-red-50 border-red-200 text-red-600 animate-pulse" : "bg-primary-container/10 border-primary-container/20 text-primary"
        )}>
          <MaterialIcon name="timer" className="text-xl" fill={timeLeft < 300} />
          <span className="font-headline font-black text-lg tracking-tight tabular-nums">{formatTime(timeLeft)}</span>
        </div>
      </header>

      <div className="pt-20">
        {/* Progress Section */}
        <div className="mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="text-[10px] font-black text-secondary tracking-[0.3em] uppercase">Module {currentPage} of {totalPages}</span>
              <h1 className="text-4xl font-headline font-black text-primary italic mt-1 tracking-tighter">
                {currentPage === 1 && "Core Safety & Health"}
                {currentPage === 2 && "Nutrition & Hygiene"}
                {currentPage === 3 && "Early Development"}
                {currentPage === 4 && "Professional Conduct"}
              </h1>
            </div>
            <div className="text-right">
              <span className="text-on-surface-variant font-black text-[10px] uppercase tracking-widest opacity-40">Progress</span>
              <div className="text-3xl font-headline font-black text-primary tracking-tighter italic">
                {Math.round(progress)}<span className="text-slate-200">%</span>
              </div>
            </div>
          </div>
          <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden p-0.5 border border-slate-100 shadow-inner">
            <div 
              className="h-full bg-secondary rounded-full transition-all duration-1000 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Content */}
        <div className="space-y-16 mb-20">
          {questionsOnPage.map((q: any, idx: number) => (
            <div key={q.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
              <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all border border-slate-50 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-headline font-black italic">
                      {q.order}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-80">Scenario Assessment</span>
                  </div>
                  <div className="px-4 py-1.5 bg-surface-container-low rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                    {q.marks} Marks
                  </div>
                </div>
                
                <h2 className="text-2xl font-headline font-bold text-primary leading-tight mb-8">
                  {q.text}
                </h2>

                <textarea
                  className="w-full bg-surface-container-low border-2 border-transparent focus:border-secondary/20 rounded-3xl p-8 min-h-[200px] font-body text-slate-700 outline-none transition-all placeholder:italic placeholder:opacity-30 text-lg resize-none shadow-inner"
                  placeholder="Type your professional response here..."
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                />
                
                <MaterialIcon name="assignment" className="absolute -bottom-8 -right-8 text-[12rem] text-primary opacity-[0.02] group-hover:scale-110 transition-transform duration-1000" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Navigation */}
        <footer className="flex items-center justify-between pt-12 border-t border-slate-100">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-3 text-slate-400 hover:text-primary disabled:opacity-0 transition-all font-headline font-black italic text-lg group"
          >
            <MaterialIcon name="arrow_back" className="group-hover:-translate-x-1 transition-transform" />
            Previous Module
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <div key={i} className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-500",
                  currentPage === i + 1 ? "w-10 bg-secondary shadow-lg" : "bg-primary/10"
                )} />
              ))}
            </div>

            {currentPage < totalPages ? (
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="bg-primary text-white px-12 py-5 rounded-[2rem] font-headline font-black italic text-lg hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 group"
              >
                Next Module
                <MaterialIcon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleFinishExam}
                disabled={isSubmitting}
                className="bg-secondary text-white px-12 py-5 rounded-[2rem] font-headline font-black italic text-lg hover:shadow-2xl hover:shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 group disabled:opacity-50"
              >
                {isSubmitting ? "Finalizing Submission..." : "Submit Global Exam"}
                <MaterialIcon name="verified" className="group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
