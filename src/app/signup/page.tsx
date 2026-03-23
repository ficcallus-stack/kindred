"use client";

import { useState } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { SignUp } from "@clerk/nextjs";

export default function SignUp() {
  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center h-20 px-6 max-w-7xl mx-auto gap-8">
          <Link href="/" className="flex items-center gap-2 group whitespace-nowrap">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-xl italic tracking-tighter">KC</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 font-headline">
              KindredCare <span className="text-primary italic">US</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="font-headline text-sm font-semibold tracking-tight text-slate-600 hover:text-blue-900 transition-all duration-300">
              Home
            </Link>
          </div>
          <Link href="/login" className="bg-primary-container text-on-primary-container font-black px-5 py-2 rounded-xl text-xs active:scale-95 transition-transform uppercase tracking-widest shadow-lg shadow-primary/10">
            Sign In
          </Link>
        </div>
      </nav>

      <main className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Branding & Welcome Column */}
          <div className="space-y-8 lg:pr-12">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-black uppercase tracking-[0.2em]">
                Premium Care
              </span>
              <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tighter text-slate-900 leading-[1] italic">
                Join <span className="text-primary">KindredCare</span>
              </h1>
              <p className="text-on-surface-variant text-lg leading-relaxed italic font-medium">
                Experience a bespoke childcare journey designed with safety, trust, and human connection at its heart.
              </p>
            </div>
            
            <div className="relative group rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/0 transition-colors duration-500 z-10"></div>
              <img
                alt="Smiling diverse family"
                className="w-full aspect-[4/3] object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBepyv5YWMXnwkEFGbrREbn6QFlqC9uiBA99AAXsBMCYo41Nlm0tqzGAZWCyz-tzFF52adiC8EUzhZBPug5HD_SyidpkmbYAZ9AyB2nehR5o-XTu603T8iFpbL-2LcNKHXwFV1cXGWy9Oga00mIZIYFGnz68fTXRPc-cWx63FDmDVx38FnLzijBWod_7DIuX3XvIslPsANnK1-jgxNaWNeZq4kaNLr2hKMlLIHDjwx0HlrYaHXpuMjA9nULFyCCnCzP9XsMKluSx6I"
              />
            </div>
          </div>

          {/* Clerk SignUp */}
          <div className="flex justify-center items-center">
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: "bg-primary hover:bg-primary-container text-[12px] font-black uppercase tracking-widest h-12 rounded-xl transition-all shadow-xl shadow-primary/20",
                  card: "bg-surface-container-low shadow-none border-none",
                  headerTitle: "font-headline font-black text-slate-900 italic tracking-tighter text-3xl",
                  headerSubtitle: "text-on-surface-variant italic font-medium text-sm",
                  socialButtonsBlockButton: "border-outline-variant/10 hover:bg-white transition-all rounded-xl h-11",
                  socialButtonsBlockButtonText: "font-bold text-[11px] tracking-tight text-slate-600",
                  formFieldLabel: "font-black text-[10px] uppercase tracking-widest text-slate-500",
                  formFieldInput: "bg-white border-outline-variant/15 rounded-xl h-12 focus:ring-primary/10 transition-all",
                  footerActionLink: "text-primary font-black hover:underline",
                  footerActionText: "text-on-surface-variant",
                  identityPreviewText: "font-bold",
                  identityPreviewEditButtonIcon: "text-primary",
                }
              }}
              routing="path"
              path="/signup"
              signInUrl="/login"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-outline-variant/10 bg-white/50 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 gap-6 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2 group whitespace-nowrap opacity-60">
            <div className="w-8 h-8 bg-slate-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm italic tracking-tighter">KC</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 font-headline">
              KindredCare US
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 font-headline font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400">
            <button className="hover:text-primary transition-colors">Privacy</button>
            <button className="hover:text-primary transition-colors">Terms</button>
            <button className="hover:text-primary transition-colors">Help</button>
          </div>
          <p className="font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            © 2024 KindredCare US
          </p>
        </div>
      </footer>
    </div>
  );
}
