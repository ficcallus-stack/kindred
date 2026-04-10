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

    </div>
  );
}
