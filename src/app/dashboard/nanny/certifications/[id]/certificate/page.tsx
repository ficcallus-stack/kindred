"use client";

import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { getSubmissionDetails } from "@/app/dashboard/moderator/actions";
import { useAuth } from "@/lib/auth-context";

interface CertificatePageProps {
  params: {
    id: string; // submissionId
  };
}

export default function CertificatePage({ params }: CertificatePageProps) {
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getSubmissionDetails(params.id).then((data) => {
      setSubmission(data);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!submission || submission.status !== "passed") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-6 text-center">
        <MaterialIcon name="error_outline" className="text-6xl text-error mb-4" />
        <h1 className="text-2xl font-headline font-bold text-primary">Certificate Not Available</h1>
        <p className="text-on-surface-variant mt-2 max-w-md">This certificate is only issued for passed exams. Please contact support if you believe this is an error.</p>
      </div>
    );
  }

  const dateStr = submission.markedAt 
    ? new Date(submission.markedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
    : "Recently Issued";

  return (
    <div className="bg-surface-container-low font-body text-on-surface min-h-screen flex flex-col items-center justify-center p-4 lg:p-12 animate-in fade-in duration-1000">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=Dancing+Script:wght@700&display=swap');
        
        .signature-font {
          font-family: 'Dancing Script', cursive;
        }
        .watermark {
          opacity: 0.03;
          pointer-events: none;
          user-select: none;
        }
      `}</style>

      {/* Main Content Canvas */}
      <main className="w-full max-w-5xl relative">
        {/* Certificate Container */}
        <div className="relative bg-surface-container-lowest shadow-[0_32px_64px_-12px_rgba(3,31,65,0.08)] rounded-xl overflow-hidden p-12 lg:p-24 border border-outline-variant/15">
          {/* Subtle Inner Border */}
          <div className="absolute inset-4 border border-primary/5 pointer-events-none"></div>
          
          {/* Watermark Background */}
          <div className="absolute inset-0 flex items-center justify-center watermark">
            <MaterialIcon name="verified_user" className="text-[40rem]" fill />
          </div>

          {/* Header Section */}
          <header className="relative z-10 flex flex-col items-center text-center mb-16">
            <div className="mb-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mb-4 shadow-xl shadow-primary/10">
                <MaterialIcon name="verified_user" className="text-on-primary-container text-4xl" fill />
              </div>
              <p className="font-headline font-extrabold text-primary tracking-widest text-xs uppercase underline decoration-secondary-container decoration-4 underline-offset-8">KindredCare Professional Standards</p>
            </div>
            <h1 className="font-headline text-5xl lg:text-6xl font-extrabold text-primary tracking-tight mb-2">Professional Certification</h1>
            <div className="h-1 w-24 bg-secondary-container mx-auto rounded-full mt-4"></div>
          </header>

          {/* Recipient Content */}
          <section className="relative z-10 flex flex-col items-center text-center mb-20">
            <p className="font-label text-on-surface-variant italic mb-8">This document confirms the high-level professional standing of</p>
            <div className="relative mb-10 group">
              <h2 className="font-headline text-6xl lg:text-7xl font-bold text-primary tracking-tighter">{submission.caregiver?.fullName}</h2>
              <div className="absolute -bottom-4 left-0 w-full h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent opacity-40"></div>
            </div>
            <div className="max-w-2xl">
              <p className="font-body text-xl text-on-surface-variant leading-relaxed">
                For successfully mastering the <span className="font-semibold text-primary">{submission.exam?.title || "Global Caregiver Standards"}</span> with a final score of <span className="font-bold text-secondary">{submission.score}%</span>. This recipient has demonstrated exceptional proficiency in core safety, nutrition, and early childhood development.
              </p>
            </div>
          </section>

          {/* Verification Grid */}
          <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 items-end pt-12 border-t border-outline-variant/10">
            {/* ID Details */}
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold">Certification ID</span>
                <span className="font-headline text-primary font-bold">{submission.id.slice(0, 8).toUpperCase()}-CERT</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold">Date of Issue</span>
                <span className="font-headline text-primary font-bold">{dateStr}</span>
              </div>
            </div>

            {/* Verified Seal */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-secondary/20 animate-[spin_20s_linear_infinite]"></div>
                <div className="bg-surface-container-lowest p-2 rounded-full shadow-lg border border-outline-variant/20">
                  <div className="bg-secondary-fixed text-on-secondary-fixed p-4 rounded-full flex flex-col items-center justify-center text-center">
                    <MaterialIcon name="verified" className="text-3xl" fill />
                    <span className="text-[8px] font-extrabold uppercase leading-none mt-1">Global Tier</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 font-label text-[10px] uppercase font-bold text-secondary tracking-widest">Verified Accreditation</p>
            </div>

            {/* Signatures */}
            <div className="space-y-8 flex flex-col items-end">
              <div className="text-right">
                <div className="mb-1 text-2xl text-primary/80 signature-font">Marcus Thorne</div>
                <div className="h-px w-48 bg-outline-variant mb-2"></div>
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Chief Safety Officer</span>
              </div>
              <div className="text-right">
                <div className="mb-1 text-2xl text-primary/80 signature-font">Elena Rodriguez</div>
                <div className="h-px w-48 bg-outline-variant mb-2"></div>
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Director of Care Standards</span>
              </div>
            </div>
          </section>
        </div>

        {/* Action Bar */}
        <div className="flex justify-center gap-4 mt-12 mb-24">
          <button 
            onClick={() => window.print()}
            className="bg-primary hover:bg-primary-container text-on-primary px-8 py-4 rounded-xl font-headline font-bold flex items-center gap-2 transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            <MaterialIcon name="download" />
            Download PDF / Print
          </button>
          <button className="bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container-low text-primary px-8 py-4 rounded-xl font-headline font-bold flex items-center gap-2 transition-all active:scale-95">
            <MaterialIcon name="share" />
            Share to LinkedIn
          </button>
        </div>
      </main>
    </div>
  );
}
