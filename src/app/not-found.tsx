import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="relative">
          <span className="text-[12rem] font-black text-surface-container-high font-headline leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <MaterialIcon name="search_off" className="text-7xl text-primary/30" />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="font-headline text-3xl font-black text-primary tracking-tighter">
            Page Not Found
          </h1>
          <p className="text-on-surface-variant text-lg font-medium italic leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95"
          >
            Go Home
          </Link>
          <Link
            href="/browse"
            className="px-8 py-4 bg-surface-container-low text-primary font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-surface-container-high transition-all"
          >
            Browse Nannies
          </Link>
        </div>
      </div>
    </div>
  );
}
