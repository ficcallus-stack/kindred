"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface BookingStep3Props {
  onDone: () => void;
}

export default function BookingStep3({ onDone }: BookingStep3Props) {
  return (
    <div className="max-w-2xl mx-auto relative z-10 animate-in fade-in zoom-in-95 duration-700">
      {/* Success Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-24 h-24 mb-8 bg-tertiary-fixed rounded-[2rem] rotate-3 hover:rotate-0 transition-transform duration-500 shadow-xl shadow-tertiary/10">
          <MaterialIcon
            name="check_circle"
            className="text-[48px] text-on-tertiary-fixed-variant font-fill"
            fill
          />
        </div>
        <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tight text-primary mb-6">
          You're all set!
        </h1>
        <p className="font-body text-xl text-on-surface-variant leading-relaxed">
          Your booking with <span className="font-bold text-primary">Sarah Jenkins</span> is confirmed
          for Monday, June 10th.
        </p>
      </div>

      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Main Confirmation Card */}
        <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-[0_32px_48px_-12px_rgba(3,31,65,0.05)] relative overflow-hidden border border-outline-variant/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-5 rounded-bl-full"></div>
          <h2 className="font-headline text-2xl font-bold text-primary mb-8">What happens next?</h2>
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start gap-6 group">
              <div className="w-10 h-10 shrink-0 bg-primary-fixed rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                <MaterialIcon name="notifications" className="text-primary" fill />
              </div>
              <div>
                <h3 className="font-bold text-on-surface mb-1">Sarah has been notified</h3>
                <p className="text-on-surface-variant text-sm leading-snug">
                  She has received all your details and is preparing for her visit.
                </p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="flex items-start gap-6 group">
              <div className="w-10 h-10 shrink-0 bg-primary-fixed rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                <MaterialIcon name="calendar_add_on" className="text-primary" fill />
              </div>
              <div>
                <h3 className="font-bold text-on-surface mb-1">You'll receive a calendar invite</h3>
                <p className="text-on-surface-variant text-sm leading-snug">
                  A digital invitation will be sent to your primary email address shortly.
                </p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="flex items-start gap-6 group">
              <div className="w-10 h-10 shrink-0 bg-primary-fixed rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                <MaterialIcon name="chat_bubble" className="text-primary" fill />
              </div>
              <div>
                <h3 className="font-bold text-on-surface mb-1">Message Sarah</h3>
                <p className="text-on-surface-variant text-sm leading-snug">
                  Coordinate the first morning or share any last-minute house rules.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nanny Mini Card */}
        <div className="bg-surface-container-low p-6 rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-lg rounded-bl-lg flex items-center gap-4 border border-outline-variant/5">
          <img
            alt="Sarah Jenkins"
            className="w-16 h-16 rounded-xl object-cover shadow-sm grayscale hover:grayscale-0 transition-all duration-500"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA_a1zBOFLvpQEWnfW3Gx5LhVsXB9_MRERaJRKV_HvkENPZgPqyfDsy2tQ8vXasykZJ1wjalk8fkFhjA-Jf-GmGz-BLp_bL_giHh91IVSrDvfywZj0STYg99J5JVO_Zr7GbrZXuP1lwK78yi8XfdDcNukCjEHqgWu0d1xxEEJmQOQ52Yp5gQht6Qu7Kmam0LROSfGNPqZxpF_uM9U-hB3D0E12G7NjkBF9XTTs4DEMf592dexfvyuJcYy47c8Xd4O8U-z9zoDP3OU"
          />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant opacity-60">
              Your Caregiver
            </p>
            <p className="font-bold text-primary">Sarah Jenkins</p>
            <div className="flex items-center gap-1">
              <MaterialIcon name="star" className="text-[14px] text-secondary" fill />
              <span className="text-sm font-medium">4.9 (124 reviews)</span>
            </div>
          </div>
        </div>

        {/* Receipt Link Card */}
        <div className="bg-surface-container-low p-6 rounded-tr-[2.5rem] rounded-bl-[2.5rem] rounded-tl-lg rounded-br-lg flex flex-col justify-center border border-outline-variant/5">
          <p className="text-on-surface-variant text-xs mb-2">Transaction ID: #CC-92841</p>
          <a
            className="inline-flex items-center gap-2 font-bold text-primary hover:text-secondary transition-colors group"
            href="#"
          >
            View Full Receipt
            <MaterialIcon name="open_in_new" className="text-sm transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={onDone}
          className="w-full md:w-auto px-12 py-5 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-lg rounded-xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          Go to Dashboard
        </button>
        <button className="font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 text-sm">
          <MaterialIcon name="print" className="text-xl" />
          Download Booking Details
        </button>
      </div>
    </div>
  );
}
