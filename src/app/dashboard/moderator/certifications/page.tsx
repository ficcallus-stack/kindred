"use server";

import { getPendingExams } from "../actions";
import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";
import Image from "next/image";

export default async function ModeratorCertificationsPage() {
  const pendingExams = await getPendingExams();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <header>
        <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">Exam Marking Queue</h2>
        <p className="text-on-surface-variant max-w-2xl">
          Review and grade caregiver submissions for the Global Caregiver Standards Exam. Professional certification requires manual validation of typed scenario responses.
        </p>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Caregiver</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Exam Title</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Submitted</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {pendingExams.length > 0 ? pendingExams.map((submission) => {
              const caregiver = submission.caregiver as any;
              const exam = submission.exam as any;
              return (
              <tr key={submission.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden relative border border-slate-200 shadow-inner">
                      {caregiver.fullName?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-primary leading-tight">{caregiver.fullName}</p>
                      <p className="text-[10px] text-on-surface-variant opacity-60">{caregiver.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-primary">{exam.title}</p>
                  <p className="text-[10px] text-secondary font-black uppercase tracking-widest">{exam.certificationType}</p>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-medium text-on-surface-variant">
                    {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold">
                    {submission.submittedAt ? new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </td>
                <td className="px-8 py-6">
                  <span className="px-4 py-1.5 bg-secondary/5 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full border border-secondary/10">
                    Awaiting Review
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <Link
                    href={`/dashboard/moderator/certifications/${submission.id}`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                  >
                    Review Exam
                    <MaterialIcon name="arrow_forward" className="text-sm" />
                  </Link>
                </td>
              </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-30">
                    <MaterialIcon name="verified" className="text-6xl" />
                    <p className="font-headline font-bold text-xl italic">The marking queue is empty.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
