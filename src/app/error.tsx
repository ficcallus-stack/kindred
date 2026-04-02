"use client";

import { MaterialIcon } from "@/components/MaterialIcon";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="w-24 h-24 bg-error-container rounded-3xl flex items-center justify-center mx-auto">
          <MaterialIcon name="error_outline" className="text-5xl text-error" />
        </div>
        <div className="space-y-3">
          <h1 className="font-headline text-4xl font-black text-primary tracking-tighter">
            Something went wrong
          </h1>
          <p className="text-on-surface-variant text-lg font-medium italic leading-relaxed">
            We encountered an unexpected error. Please try again or contact support if the problem persists.
          </p>
          {error && process.env.NODE_ENV === "development" && (
            <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-xl text-left font-mono text-[10px] text-slate-500 overflow-auto max-h-32">
              <p className="font-bold text-red-400 mb-1 capitalize">Error Detail:</p>
              <p>{error.message || "Unknown error"}</p>
              {error.digest && <p className="mt-1 opacity-50 italic">Digest: {error.digest}</p>}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95"
          >
            Try Again
          </button>
          <a
            href="/dashboard/support"
            className="px-8 py-4 bg-secondary text-primary font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-black/5 hover:scale-105 transition-all"
          >
            Contact Support
          </a>
          <a
            href="/"
            className="px-8 py-4 bg-surface-container-low text-primary font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-surface-container-high transition-all"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
