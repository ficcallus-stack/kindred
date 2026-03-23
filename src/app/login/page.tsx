"use client";

import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { SignIn } from "@clerk/nextjs";

export default function Login() {
  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      {/* Top Navigation Shell */}
      <nav className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl shadow-sm shadow-blue-900/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <Link href="/" className="text-xl font-bold tracking-tighter text-blue-900">
            KindredCare US
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="font-headline text-sm font-semibold tracking-tight text-slate-600 hover:text-blue-900 transition-all duration-300">
              Home
            </Link>
            <Link href="/signup" className="font-headline text-sm font-semibold tracking-tight text-slate-600 hover:text-blue-900 transition-all duration-300">
              Sign Up
            </Link>
          </div>
          <Link href="/login" className="bg-primary-container text-on-primary-container font-semibold px-5 py-2 rounded-xl text-sm active:scale-95 transition-transform">
            Sign In
          </Link>
        </div>
      </nav>

      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4">
        <div className="max-w-md w-full flex justify-center items-center">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary hover:bg-primary-container text-sm font-black uppercase tracking-widest",
                card: "bg-surface-container-low shadow-none border-none",
                headerTitle: "font-headline font-black text-primary italic tracking-tighter text-3xl",
                headerSubtitle: "text-on-surface-variant italic font-medium",
                socialButtonsBlockButton: "border-outline-variant/10 hover:bg-white transition-all",
                socialButtonsBlockButtonText: "font-bold text-xs",
              }
            }}
            routing="path"
            path="/login"
            signUpUrl="/signup"
          />
        </div>
      </main>
    </div>
  );
}
