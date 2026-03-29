import { MaterialIcon } from "@/components/MaterialIcon";

export const metadata = {
  title: "Support Hub | Moderator Dashboard",
};

export default function SupportPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 relative overflow-hidden h-full">
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl shadow-slate-200/50 text-slate-400 mb-6 border-4 border-slate-50 relative z-10">
        <MaterialIcon name="support_agent" className="text-4xl" />
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse"></span>
      </div>
      <h2 className="font-headline font-black text-2xl text-primary tracking-tighter italic mb-2 relative z-10">Select a Conversation</h2>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 max-w-sm text-center relative z-10">
        Choose a User on the left to begin secure real-time encrypted messaging.
      </p>
    </div>
  );
}
