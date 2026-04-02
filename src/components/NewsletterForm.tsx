"use client";

import { useState } from "react";
import { MaterialIcon } from "./MaterialIcon";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async () => {
    if (!email) return;
    setStatus("loading");
    const res = await subscribeToNewsletter(email);
    if (res.success) {
      setStatus("success");
      setEmail("");
    } else {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
        <MaterialIcon name="check_circle" className="text-emerald-500 text-xl" />
        <span className="text-xs font-bold text-emerald-700">You&apos;re subscribed!</span>
      </div>
    );
  }

  return (
    <div className="flex bg-white rounded-2xl p-2 border border-primary/5 shadow-2xl shadow-primary/5">
      <input
        className="flex-1 bg-transparent border-none focus:ring-0 text-primary text-sm font-bold px-4 placeholder:text-slate-300"
        placeholder="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <button
        onClick={handleSubmit}
        disabled={status === "loading"}
        className="bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-900 transition-colors shadow-lg disabled:opacity-50"
      >
        <MaterialIcon name={status === "loading" ? "sync" : "arrow_forward"} className={`text-xl ${status === "loading" ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}
