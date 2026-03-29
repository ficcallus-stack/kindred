import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";

export default function SubscriptionErrorPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-8 animate-in fade-in zoom-in duration-700">
      <div className="max-w-xl w-full text-center space-y-10">
        
        {/* Error Icon container */}
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto">
          <MaterialIcon name="payment_error" className="text-5xl" fill />
        </div>

        <div className="space-y-4">
          <h1 className="font-headline text-4xl font-black text-primary tracking-tighter italic">
            Unexpected hiccup. <br/> Payment not completed.
          </h1>
          <p className="font-body text-base text-on-surface-variant opacity-70 leading-relaxed italic max-w-sm mx-auto">
            We couldn't process your premium subscription at this time. This is often due to a browser timeout or a card decline.
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-8">
          <Link 
            href="/dashboard/parent/subscription"
            className="px-8 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center"
          >
            Retry Payment
          </Link>
          <Link 
            href="/dashboard/parent"
            className="px-8 py-5 bg-white border border-outline-variant/10 text-primary rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-surface-container-low transition-all text-center"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="pt-12 text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/30 flex items-center justify-center gap-3">
          <MaterialIcon name="verified_user" className="text-lg" />
          <span>Secure Transactional Hub</span>
        </div>
      </div>
    </div>
  );
}
