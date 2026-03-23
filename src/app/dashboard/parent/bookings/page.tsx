"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import BookingStep1 from "@/components/bookings/BookingStep1";
import BookingStep2 from "@/components/bookings/BookingStep2";
import BookingStep3 from "@/components/bookings/BookingStep3";

export default function BookingsPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  const goToDashboard = () => router.push("/dashboard/parent");

  return (
    <div className={cn("bg-surface font-body text-on-surface min-h-screen", step === 3 ? "bg-[radial-gradient(circle_at_20%_30%,#ffdfc4_0%,transparent_40%),radial-gradient(circle_at_80%_70%,#d5e3ff_0%,transparent_40%)]" : "")}>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="text-2xl font-bold tracking-tight text-primary font-headline cursor-pointer italic"
            onClick={goToDashboard}
          >
            KindredCare US
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={goToDashboard} className="text-slate-600 font-medium hover:text-primary transition-colors font-headline">Find a Nanny</button>
            <button className="text-slate-600 font-medium hover:text-primary transition-colors font-headline">How it Works</button>
            <button className="text-slate-600 font-medium hover:text-primary transition-colors font-headline">Safety</button>
            <button className="text-slate-600 font-medium hover:text-primary transition-colors font-headline">Pricing</button>
          </nav>
          <div className="flex items-center space-x-6">
            <button className="text-primary font-medium hover:text-secondary transition-colors">Messages</button>
            <button className="text-primary font-bold border-b-2 border-primary pb-1">My Bookings</button>
            <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/20">
              <img
                alt="Parent Profile"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIIYapeORFBnEnCjm8cORKG4azkrByov8vaJutGwL5_9-8QBXhg0rHD-MFahYTckZfRweIICfKbjj94ITa_ahbg1FHWLXRXh585n1cdUbX4DbXr3FxT1SzjLaDxqi8BAjub1vm6yCKOq6E_eLc3cCIwBCGbn85H4ZBlzpqB0E8tjBTfqCDECfa_Py7dMpF3OzR-OGWPDi03LvqIqUSeFqIptyqcKU0WjHtmc-JLo3j_2VOqt9BrogHtGKx5_MiSi0WtHGOWFC3j-A"
              />
            </div>
          </div>
        </div>
      </header>

      <main className={cn("pt-32 pb-24 px-6 max-w-7xl mx-auto relative", step === 3 ? "overflow-hidden" : "")}>
        {step < 3 && (
          <div className="mb-12">
            {/* Breadcrumb / Progress for Step 2 */}
            {step === 2 && (
              <div className="flex items-center space-x-2 mb-8 text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">
                <span className="cursor-pointer hover:text-primary" onClick={() => setStep(1)}>Select Care</span>
                <MaterialIcon name="chevron_right" className="text-sm" />
                <span className="text-primary">Secure Payment</span>
              </div>
            )}
            
            <div className="mb-12">
              <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs font-label">
                {step === 1 ? "New Booking Request" : "Step 2 of 2"}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-primary font-headline mt-2 mb-4 leading-tight tracking-tight">
                {step === 1 ? "Review Invitation from Sarah" : "Complete Payment"}
              </h1>
              <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
                {step === 1 
                  ? "A KindredCare caregiver has sent you a proposed schedule for your upcoming childcare needs."
                  : "Your booking with Sarah is almost confirmed. All transactions are encrypted and secure."
                }
              </p>
            </div>
          </div>
        )}

        {/* Step Rendering */}
        {step === 1 && <BookingStep1 onNext={nextStep} onDecline={goToDashboard} />}
        {step === 2 && <BookingStep2 onNext={nextStep} onBack={prevStep} />}
        {step === 3 && <BookingStep3 onDone={goToDashboard} />}
      </main>

      {/* Background Editorial Elements for Step 3 */}
      {step === 3 && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-fixed opacity-10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-fixed opacity-10 rounded-full blur-[100px] pointer-events-none"></div>
        </>
      )}

      {/* Mobile Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/90 backdrop-blur-xl border-t border-outline-variant/10 shadow-[0_-4px_24px_rgba(3,31,65,0.06)] z-50 rounded-t-3xl">
        <button className="flex flex-col items-center justify-center text-slate-500 px-5 py-2">
          <MaterialIcon name="search" />
          <span className="text-[10px] font-bold tracking-wide uppercase mt-1">Search</span>
        </button>
        <button className="flex flex-col items-center justify-center text-primary bg-primary-fixed/30 rounded-2xl px-5 py-2">
          <MaterialIcon name="calendar_today" fill />
          <span className="text-[10px] font-bold tracking-wide uppercase mt-1">Bookings</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-500 px-5 py-2">
          <MaterialIcon name="payments" />
          <span className="text-[10px] font-bold tracking-wide uppercase mt-1">Payments</span>
        </button>
        <button className="flex flex-col items-center justify-center text-slate-500 px-5 py-2">
          <MaterialIcon name="person" />
          <span className="text-[10px] font-bold tracking-wide uppercase mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
