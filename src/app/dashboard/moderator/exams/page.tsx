"use client";

import { useState, useTransition } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { uploadExamJson } from "../actions";
import { useToast } from "@/components/Toast";

const SAMPLE_JSON = {
  "certificationType": "standards_program",
  "title": "Global Caregiver Standards Exam",
  "description": "Premium childcare standards and safety protocols validation.",
  "passPercentage": 75,
  "timeLimit": 60,
  "price": 4500,
  "retakePrice": 500,
  "questions": [
    {
      "text": "How do you handle a toddler having a tantrum in a public place?",
      "marks": 10,
      "page": 1,
      "order": 1
    },
    {
      "text": "What are the key safety checks before preparing a bottle?",
      "marks": 5,
      "page": 1,
      "order": 2
    }
  ]
};

export default function ExamManagementPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const handleUpload = () => {
    if (!jsonInput.trim()) {
      showToast("Please paste a valid JSON string", "error");
      return;
    }

    try {
      const data = JSON.parse(jsonInput);
      
      startTransition(async () => {
        try {
          const result = await uploadExamJson(data);
          showToast(`Success! New version (${result.version}) is now live.`, "success");
          setJsonInput("");
        } catch (err: any) {
          showToast(err.message || "Upload failed", "error");
        }
      });
    } catch (e) {
      showToast("Invalid JSON format", "error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-primary tracking-tight">Exam Management</h1>
          <p className="text-on-surface-variant font-medium mt-1">Update certification exams via JSON. This will create a new version.</p>
        </div>
        <button 
          onClick={() => setJsonInput(JSON.stringify(SAMPLE_JSON, null, 2))}
          className="text-sm font-bold text-primary underline decoration-2 underline-offset-4 hover:text-secondary transition-colors"
        >
          Insert Sample JSON
        </button>
      </div>

      <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10">
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-900">
            <MaterialIcon name="warning" className="text-amber-600 shrink-0" fill />
            <div className="text-sm">
              <p className="font-bold">Versioning Warning</p>
              <p className="opacity-80">Existing versions will NOT be deleted. New versions only apply to users who start the exam after this update. Users currently in the middle of an exam will continue with their current question set.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Exam JSON Structure</label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your exam JSON here..."
              className="w-full h-[500px] bg-slate-50 border border-outline-variant/20 rounded-2xl p-6 font-mono text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-4">
             <button
              onClick={handleUpload}
              disabled={isPending || !jsonInput}
              className="px-10 py-4 bg-primary text-white font-headline font-black rounded-xl shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
            >
              {isPending ? "Validating & Syncing..." : "Sync Exam Version"}
              <MaterialIcon name="sync" className={isPending ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10">
           <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
             <MaterialIcon name="info" className="text-xl" fill /> Required Fields
           </h4>
           <ul className="text-xs space-y-2 text-on-surface-variant font-medium">
             <li><code className="bg-white px-1">certificationType</code>: <code className="text-primary italic">"standards_program"</code> (for now)</li>
             <li><code className="bg-white px-1">questions</code>: Array of objects with text, marks, page, and order.</li>
             <li><code className="bg-white px-1">passPercentage</code>: Defaults to 75 if missing.</li>
           </ul>
        </div>
        <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10">
           <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
             <MaterialIcon name="auto_awesome" className="text-xl" fill /> Auto-Calculations
           </h4>
           <ul className="text-xs space-y-2 text-on-surface-variant font-medium">
             <li><code className="bg-white px-1">totalMarks</code>: Automatically summed from all questions.</li>
             <li><code className="bg-white px-1">version</code>: Automatically incremented based on existing data.</li>
           </ul>
        </div>
      </div>
    </div>
  );
}
