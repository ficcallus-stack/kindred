import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";

export default function SubscriptionSuccessPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-8 animate-in fade-in zoom-in duration-700">
      <div className="max-w-2xl w-full text-center space-y-10">
        
        {/* Success Icon Animation container */}
        <div className="relative inline-block">
          <div className="w-32 h-32 bg-secondary/10 rounded-full flex items-center justify-center text-secondary relative z-10 animate-pulse">
            <MaterialIcon name="verified" className="text-6x" fill />
          </div>
          <div className="absolute inset-0 bg-secondary/20 rounded-full blur-2xl animate-ping opacity-20 scale-150"></div>
        </div>

        <div className="space-y-4">
          <h1 className="font-headline text-5xl font-black text-primary tracking-tighter italic">
            You're Golden! <br/> Welcome to Premium.
          </h1>
          <p className="font-body text-xl text-on-surface-variant opacity-70 leading-relaxed italic max-w-md mx-auto">
            Your family's premium benefits are now active. You can start messaging nannies directly and your jobs will now be featured.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 max-w-lg mx-auto">
          <Link 
            href="/browse"
            className="px-8 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center"
          >
            Browse Caregivers
          </Link>
          <Link 
            href="/dashboard/parent"
            className="px-8 py-5 bg-white border border-outline-variant/10 text-primary rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-surface-container-low transition-all text-center"
          >
            Dashboard
          </Link>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/30 italic">
          A confirmation email has been sent to your inbox.
        </p>
      </div>
    </div>
  );
}
