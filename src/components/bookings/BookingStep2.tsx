"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface BookingStep2Props {
  onNext: () => void;
  onBack: () => void;
}

export default function BookingStep2({ onNext, onBack }: BookingStep2Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Left Column: Payment Form */}
      <div className="lg:col-span-7 space-y-10">
        <header>
          <h1 className="text-4xl font-extrabold font-headline text-primary tracking-tight mb-4">
            Complete Payment
          </h1>
          <p className="text-on-surface-variant text-lg">
            Your booking with Sarah is almost confirmed. All transactions are encrypted and secure.
          </p>
        </header>

        {/* Payment Methods Icons */}
        <div className="flex items-center space-x-4 p-6 bg-surface-container-low rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mr-4">
            Accepted
          </span>
          <div className="flex space-x-3">
            {["credit_card", "account_balance", "wallet"].map((icon) => (
              <div
                key={icon}
                className="w-12 h-8 bg-surface-container-lowest rounded-md flex items-center justify-center border border-outline-variant/15"
              >
                <MaterialIcon name={icon} className="text-primary text-xl" />
              </div>
            ))}
          </div>
          <div className="ml-auto flex items-center text-on-tertiary-container text-xs font-semibold">
            <MaterialIcon name="verified_user" className="mr-2 text-sm" fill />
            Secure Checkout
          </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onNext(); }}>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-primary">Cardholder Name</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all placeholder:text-on-surface-variant/40 font-medium"
              placeholder="Sarah Jenkins"
              type="text"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-primary">Card Number</label>
            <div className="relative">
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all placeholder:text-on-surface-variant/40 font-medium"
                placeholder="0000 0000 0000 0000"
                type="text"
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <MaterialIcon name="credit_card" className="text-on-surface-variant/40" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-primary">Expiry Date</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all placeholder:text-on-surface-variant/40 font-medium"
                placeholder="MM / YY"
                type="text"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-primary">CVC</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all placeholder:text-on-surface-variant/40 font-medium"
                placeholder="123"
                type="text"
                required
              />
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl flex items-start space-x-4">
            <div className="flex items-center h-5">
              <input
                className="h-5 w-5 rounded-md border-outline-variant/30 text-primary focus:ring-primary cursor-pointer"
                id="auto-pay"
                type="checkbox"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-bold text-primary cursor-pointer" htmlFor="auto-pay">
                Auto-pay weekly
              </label>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Simplify your recurring bookings. We'll automatically charge your card every Sunday.
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <button
              className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-bold py-5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-3 text-lg"
              type="submit"
            >
              <MaterialIcon name="lock" fill />
              <span>Confirm & Pay $1,000.00</span>
            </button>
            <button
               type="button"
               onClick={onBack}
               className="w-full py-4 text-on-surface-variant font-bold hover:text-primary transition-colors text-sm"
            >
                Back to Details
            </button>
            <p className="text-center text-[10px] text-on-surface-variant font-medium">
              By clicking Confirm & Pay, you agree to our Terms of Service and Cancellation Policy.
            </p>
          </div>
        </form>
      </div>

      {/* Right Column: Order Summary */}
      <aside className="lg:col-span-5">
        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0_4px_32px_rgba(3,31,65,0.04)] border border-outline-variant/10 sticky top-32">
          <h2 className="text-2xl font-bold font-headline text-primary mb-8 underline decoration-secondary/30 underline-offset-8">Booking Summary</h2>
          <div className="flex items-center space-x-5 mb-8">
            <div className="w-20 h-20 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md overflow-hidden bg-surface-container-highest shadow-md">
              <img
                alt="Sarah Jenkins"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw5C79aF49vUTnyyz0iXBic7YaL0d0jdJ4l2FNntzHXsZKLPWuEWnbwQSlKFJPUbG-IF0B2-BCIUzDTQbnsKrvKu3RiCh8reDXz8hqAMUGowyfbKQf1BawrDXDL2ekVzrJIBUZICIhh8-500qiT5mOv8Bh9iNrnaxzm0F4yBFobT-cWpppfVGhwLpBjlK7ijt_Tg-Ch9u3qHkkYS46ULZSKIZ8EeqlU4887IMUPcs5Ps3CdeG1wEBHpMh9QfNh7vv_exYb262X4fQ"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg text-primary">Sarah Jenkins</h3>
              <div className="flex items-center text-secondary font-bold text-xs">
                <MaterialIcon name="star" className="text-sm mr-1" fill />
                4.9 (124 reviews)
              </div>
              <div className="bg-tertiary-fixed text-on-tertiary-fixed text-[10px] px-2 py-0.5 rounded-full mt-2 inline-block font-bold uppercase tracking-wider">
                CPR CERTIFIED
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <div className="flex justify-between items-center py-4 border-b border-surface-container">
              <span className="text-on-surface-variant font-medium text-sm">Schedule</span>
              <span className="text-primary font-bold text-sm">Mon - Fri, 8am - 4pm</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-surface-container">
              <span className="text-on-surface-variant font-medium text-sm">Total Duration</span>
              <span className="text-primary font-bold text-sm">40 Hours</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-surface-container">
              <span className="text-on-surface-variant font-medium text-sm">Hourly Rate</span>
              <span className="text-primary font-bold text-sm">$25.00 / hr</span>
            </div>
          </div>

          <div className="space-y-4 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
            <div className="flex justify-between text-on-surface-variant text-sm font-medium">
              <span>Subtotal</span>
              <span>$1,000.00</span>
            </div>
            <div className="flex justify-between text-on-surface-variant text-sm font-medium">
              <span>Service Fee</span>
              <span>$0.00</span>
            </div>
            <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-baseline">
              <span className="text-primary font-extrabold text-xl">Total</span>
              <span className="text-primary font-extrabold text-3xl font-headline">$1,000.00</span>
            </div>
          </div>

          <div className="mt-8 flex items-center p-4 bg-secondary-fixed-dim/10 rounded-xl border border-secondary-fixed-dim/20">
            <MaterialIcon name="lightbulb" className="text-secondary mr-3" />
            <p className="text-xs text-on-secondary-fixed-variant leading-tight">
              <span className="font-bold">Pro Tip:</span> Setting up <span className="italic">Auto-pay</span> gives you priority booking for future weeks.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
