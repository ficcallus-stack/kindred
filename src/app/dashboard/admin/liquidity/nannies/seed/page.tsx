"use client";

import { useState, useTransition, useRef } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";
import { seedGhostNannies } from "./actions";

export default function SeederPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const [successLogs, setSuccessLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      showToast("Please upload a valid .json file.", "error");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      showToast(`Loaded ${file.name} successfully.`, "success");
    };
    reader.readAsText(file);
  };

  const verifyJsonFormat = (data: any): boolean => {
    if (!Array.isArray(data)) {
      showToast("JSON must be an array of nanny objects.", "error");
      return false;
    }
    
    if (data.length === 0) {
      showToast("JSON array is empty.", "error");
      return false;
    }

    const requiredKeys = ["Name", "Bio", "Zipcode", "Rate per hr"];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const missingKeys = requiredKeys.filter(k => !(k in item));
      if (missingKeys.length > 0) {
        showToast(`Item ${i + 1} (${item.Name || 'Unknown'}) is missing keys: ${missingKeys.join(", ")}`, "error");
        return false;
      }
    }
    
    return true;
  };

  const handleSeed = () => {
    if (!jsonInput.trim()) {
      showToast("Please provide JSON data either by uploading a file or pasting.", "error");
      return;
    }

    try {
      const data = JSON.parse(jsonInput);
      
      // Verification Step
      if (!verifyJsonFormat(data)) return;

      startTransition(async () => {
        try {
          const result = await seedGhostNannies(data);
          showToast(`Successfully seeded ${result.count} ghosts!`, "success");
          setSuccessLogs(result.logs || []);
          setJsonInput("");
          setFileName(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err: any) {
          showToast(err.message || "Failed to seed ghosts", "error");
        }
      });
    } catch (e: any) {
      showToast(`Invalid JSON Syntax: ${e.message}`, "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Synthesize Liquidity</h2>
          <p className="text-on-surface-variant font-medium mt-1">
            Upload or paste JSON payloads to rapidly spin up verified Ghost Nannies.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/5 space-y-8">
        
        {/* OPTION 1: FILE UPLOAD */}
        <div>
          <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">1</span>
            Upload JSON File (Preferred)
          </h3>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-primary/20 hover:border-primary hover:bg-primary/5 transition-all rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer group"
          >
            <input 
              type="file" 
              accept=".json,application/json" 
              onChange={handleFileUpload} 
              className="hidden" 
              ref={fileInputRef} 
            />
            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MaterialIcon name="upload_file" className="text-primary text-2xl" />
            </div>
            <p className="font-bold text-primary font-headline">Click to browse or drag JSON file here</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">{fileName || "Requires Name, Bio, Zipcode, and Rate"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 py-2 opacity-50">
           <div className="h-px bg-slate-300 flex-1" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Or Option 2</span>
           <div className="h-px bg-slate-300 flex-1" />
        </div>

        {/* OPTION 2: PASTE TEXT */}
        <div>
           <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
             <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">2</span>
             Paste Raw Payload
           </h3>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="[\n  {\n    'Name': 'Jane Doe',\n    'Bio': '...', \n    'Zipcode': '...', \n    'Rate per hr': 25\n  }\n]"
            className="w-full h-48 p-5 rounded-2xl bg-slate-50 border border-outline-variant/20 font-mono text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-300 transition-all font-medium resize-y"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end pt-4 border-t border-outline-variant/10">
          <button
            onClick={handleSeed}
            disabled={isPending}
            className="px-10 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-secondary transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-primary/20"
          >
            {isPending ? (
              <>
                <MaterialIcon name="hourglass_empty" className="animate-spin text-sm" />
                Validating & Synthesizing...
              </>
            ) : (
              <>
                <MaterialIcon name="bolt" className="text-sm" fill />
                Ignite Protocol
              </>
            )}
          </button>
        </div>
      </div>

      {/* LOGS */}
      {successLogs.length > 0 && (
        <div className="bg-slate-900 text-emerald-400 font-mono text-[10px] p-6 rounded-[2rem] shadow-xl max-h-64 overflow-y-auto font-medium">
          <p className="text-white/50 mb-4 inline-block border-b border-white/10 pb-2 flex items-center gap-2">
             <MaterialIcon name="terminal" className="text-[12px]" />
             Synthesis Execution Logs
          </p>
          <ul className="space-y-1 opacity-90">
            {successLogs.map((log, i) => (
              <li key={i}>{log}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
