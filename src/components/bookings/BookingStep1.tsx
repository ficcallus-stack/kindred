"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface BookingStep1Props {
  onNext: () => void;
  onDecline: () => void;
}

export default function BookingStep1({ onNext, onDecline }: BookingStep1Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Left Side: Profile & Details Bento Grid */}
      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Caregiver Card */}
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_4px_24px_rgba(3,31,65,0.04)] md:col-span-2 flex flex-col md:flex-row items-center gap-8 border-none">
          <div className="relative">
            <div className="w-32 h-32 rounded-tl-[1.5rem] rounded-br-[1.5rem] rounded-tr-[0.75rem] rounded-bl-[0.75rem] overflow-hidden ring-4 ring-primary-fixed shadow-lg">
              <img
                alt="Sarah Jenkins"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCylekPTTUgQYa0ulzO2n6alf_0kZ3b-uFpsGFbqjJt-pQA84iWg-YK9LgqKbkMc_WKzqZY71z7dzVh5RdY10IoT9NeWZ8M84Zi7t8Un632sEFfyzWvFBk2bq6VVv9XBc0jyD6LEBjHl28JleDYPURKDAHHS-Oa8LYVi6_XHNRkIhIYRHPiCoi6e_NCx1XySviQxBaUu1jwVG83Fqc31VXD1QngxIWeghv3Gj-E4_QSLcD1iw-c9X381p5ENY5hCNNfRjXbuQkHqLM"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-secondary text-white p-2 rounded-full shadow-md">
              <MaterialIcon name="verified" className="text-lg" fill />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h2 className="text-2xl font-bold font-headline text-primary">Sarah Jenkins</h2>
              <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-[10px] font-bold font-label uppercase">
                PLATINUM TIER
              </span>
            </div>
            <p className="text-on-surface-variant mb-4">
              "Experienced Montessori-trained nanny with over 8 years of specialized infant care."
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="bg-surface-container-low text-on-surface-variant px-4 py-1.5 rounded-full text-xs font-medium">
                CPR Certified
              </span>
              <span className="bg-surface-container-low text-on-surface-variant px-4 py-1.5 rounded-full text-xs font-medium">
                Background Checked
              </span>
              <span className="bg-surface-container-low text-on-surface-variant px-4 py-1.5 rounded-full text-xs font-medium">
                Bilingual
              </span>
            </div>
          </div>
        </div>

        {/* Calendar View Card */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_24px_rgba(3,31,65,0.04)] border-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg font-headline text-primary">Weekly Schedule</h3>
            <span className="text-primary-container font-medium text-xs">Oct 23 - Oct 27</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-primary-fixed/30 rounded-lg">
              <span className="font-semibold text-primary w-20">Mon-Fri</span>
              <span className="text-on-primary-fixed-variant text-sm font-medium">9:00 AM — 5:00 PM</span>
              <MaterialIcon name="calendar_today" className="text-primary text-sm" fill />
            </div>
            <div className="flex items-center justify-between p-3 border-none bg-surface-container-low/50 rounded-lg opacity-60">
              <span className="font-semibold text-on-surface-variant w-20">Sat-Sun</span>
              <span className="text-on-surface-variant text-sm font-medium">Unavailable</span>
              <MaterialIcon name="event_busy" className="text-on-surface-variant text-sm" />
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-surface-container-high border-dashed">
            <div className="flex items-start gap-3">
              <MaterialIcon name="info" className="text-secondary" />
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Sarah has noted she is available for occasional evening hours upon request.
              </p>
            </div>
          </div>
        </div>

        {/* Rate Breakdown Card */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_24px_rgba(3,31,65,0.04)] border-none">
          <h3 className="font-bold text-lg font-headline text-primary mb-6">Financial Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant">Hourly Rate</span>
              <span className="font-bold text-primary">$25.00/hr</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant">Weekly Hours (40 hrs)</span>
              <span className="font-bold text-primary">$1,000.00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant">Platform Service Fee</span>
              <span className="font-bold text-primary">$45.00</span>
            </div>
            <div className="pt-4 mt-4 border-t border-surface-container-high flex justify-between items-center">
              <span className="font-bold text-primary">First Week Total</span>
              <span className="text-2xl font-extrabold text-primary">$1,045.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Action Card */}
      <div className="lg:col-span-4 sticky top-28">
        <div className="bg-primary text-white rounded-xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-secondary-container to-transparent"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full mb-6">
              <MaterialIcon name="verified_user" className="text-sm text-secondary-fixed-dim" fill />
              <span className="text-[10px] font-bold tracking-wide uppercase">Price Guarantee</span>
            </div>
            <h3 className="text-2xl font-bold font-headline mb-4">Complete Your Booking</h3>
            <p className="text-on-primary-container text-xs mb-8 leading-relaxed">
              By accepting, you lock in Sarah's availability and Sarah begins her background refresh as
              part of our safety protocol.
            </p>
            <div className="space-y-4">
              <button
                onClick={onNext}
                className="w-full py-4 bg-gradient-to-r from-secondary-container to-secondary text-on-secondary-fixed font-bold rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Accept & Continue to Payment
                <MaterialIcon name="arrow_forward" />
              </button>
              <button className="w-full py-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-2">
                <MaterialIcon name="chat_bubble" className="text-sm" />
                Message Sarah
              </button>
              <button
                onClick={onDecline}
                className="w-full py-2 text-white/50 text-[10px] font-medium hover:text-white transition-colors"
              >
                Decline invitation
              </button>
            </div>
            <div className="mt-8 flex items-center gap-4 p-4 bg-surface-container-lowest/5 rounded-lg border border-white/5">
              <MaterialIcon name="security" className="text-secondary-fixed-dim" />
              <p className="text-[9px] text-on-primary-container uppercase font-bold tracking-[0.15em] leading-tight">
                Secure encrypted payment via Stripe
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-surface-container-low rounded-xl p-6 relative">
          <div className="flex gap-4">
            <div className="bg-white p-3 rounded-full h-fit shadow-sm">
              <MaterialIcon name="workspace_premium" className="text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-primary font-headline text-sm mb-1">
                NannyConnect Commitment
              </h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Every caregiver is interviewed by our concierge team and background checked every 6 months.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
