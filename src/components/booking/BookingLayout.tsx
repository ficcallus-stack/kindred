"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BookingLayoutProps {
  children: React.ReactNode;
  currentStep: 1 | 2 | 3;
}

export function BookingLayout({ children, currentStep }: BookingLayoutProps) {
  const steps = [
    { num: 1, label: "Review Details" },
    { num: 2, label: "Secure Payment" },
    { num: 3, label: "Confirmation" },
  ];

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface antialiased">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <Link href="/" className="text-xl font-bold tracking-tighter text-blue-950 dark:text-white font-headline">
            KindredCare US
          </Link>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-slate-50/50 rounded-full transition-all">
              <MaterialIcon name="notifications" className="text-slate-900" />
            </button>
            <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant">
              <div className="w-full h-full bg-primary-container" />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-16 space-x-4">
          {steps.map((step, idx) => (
            <>
              <div 
                key={step.num}
                className={cn(
                  "flex items-center space-x-2 transition-all duration-500",
                  currentStep < step.num && "opacity-40"
                )}
              >
                <span className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                  currentStep === step.num 
                    ? "bg-secondary-container text-on-secondary-container ring-4 ring-secondary-container/20" 
                    : currentStep > step.num 
                      ? "bg-primary text-on-primary" 
                      : "bg-surface-container-highest text-on-surface-variant"
                )}>
                  {currentStep > step.num ? <MaterialIcon name="check" className="text-sm" fill /> : step.num}
                </span>
                <span className={cn(
                  "font-medium text-sm whitespace-nowrap",
                  currentStep === step.num ? "text-on-surface font-bold" : "text-on-surface-variant"
                )}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="w-12 h-px bg-outline-variant/30" />
              )}
            </>
          ))}
        </div>

        {children}
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low w-full rounded-t-[3rem] mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center py-12 px-8 max-w-7xl mx-auto space-y-6 md:space-y-0">
          <div className="text-lg font-bold text-blue-950 font-headline">KindredCare US</div>
          <p className="text-xs text-on-surface-variant opacity-60">© 2024 KindredCare US. Premium Childcare Concierge.</p>
        </div>
      </footer>
    </div>
  );
}
