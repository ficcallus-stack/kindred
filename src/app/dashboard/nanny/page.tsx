import Link from "next/link";
import { redirect } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { syncUser } from "@/lib/user-sync";
import { cn } from "@/lib/utils";
import { db } from "@/db";
import { applications, jobs, users, bookings, messages, reviews, conversationMembers, conversations, caregiverVerifications } from "@/db/schema";
import { eq, desc, sql, and, count, avg } from "drizzle-orm";

export default async function NannyDashboardHome() {
  const user = await syncUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "parent") {
    redirect("/dashboard/parent");
  }

  // Fetch applications
  const myApplications = await db.select({
    id: applications.id,
    jobTitle: jobs.title,
    parentName: users.fullName,
    status: applications.status,
    createdAt: applications.createdAt,
  })
  .from(applications)
  .innerJoin(jobs, eq(applications.jobId, jobs.id))
  .innerJoin(users, eq(jobs.parentId, users.id))
  .where(eq(applications.caregiverId, user.id))
  .orderBy(desc(applications.createdAt));

  // Live Stats
  const [bookingStats] = await db.select({
    total: count(),
    totalEarnings: sql<number>`COALESCE(SUM(${bookings.totalAmount}), 0)`,
  })
  .from(bookings)
  .where(eq(bookings.caregiverId, user.id));

  const [messageStats] = await db.select({
    total: count(),
  })
  .from(conversationMembers)
  .where(eq(conversationMembers.userId, user.id));

  const [reviewStats] = await db.select({
    avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
    total: count(),
  })
  .from(reviews)
  .where(eq(reviews.revieweeId, user.id));

  const firstName = user.fullName.split(" ")[0] || "Caregiver";
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Fetch verification status for banner
  const verification = await db.query.caregiverVerifications.findFirst({
    where: eq(caregiverVerifications.id, user.id),
  });

  const stats = [
    { label: "Bookings", value: String(bookingStats?.total || 0), icon: "assignment", color: "bg-blue-100 text-blue-600" },
    { label: "Earnings", value: `$${((bookingStats?.totalEarnings || 0) / 100).toFixed(0)}`, icon: "payments", color: "bg-green-100 text-green-600" },
    { label: "Conversations", value: String(messageStats?.total || 0), icon: "mail", color: "bg-orange-100 text-orange-600" },
    { label: "Rating", value: reviewStats?.total ? `${Number(reviewStats.avgRating).toFixed(1)}` : "N/A", icon: "star", color: "bg-yellow-100 text-yellow-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <h1 className="font-headline text-3xl font-extrabold text-primary">Welcome, {firstName}!</h1>
        <p className="text-on-surface-variant text-sm font-medium">{today}</p>
      </div>

      {/* Verification Banner */}
      {(!verification || verification.status === "none" || verification.status === "draft") && (
        <div className="bg-terracotta/5 border border-terracotta/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-terracotta/10 rounded-2xl flex items-center justify-center">
              <MaterialIcon name="verified_user" className="text-3xl text-terracotta" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-navy text-xl">Complete Your Elite Verification</h3>
              <p className="text-on-surface-variant text-sm font-medium mt-1">Unlock trust badges and priority job listings by verifying your credentials.</p>
            </div>
          </div>
          <Link href="/dashboard/nanny/verification" className="bg-navy text-white px-8 py-3 rounded-xl font-bold hover:scale-[1.02] transition-all whitespace-nowrap uppercase tracking-widest text-xs">
            {verification?.status === "draft" ? "Continue Verification" : "Start Verification"}
          </Link>
        </div>
      )}

      {/* Quick Stats — LIVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <div className={stat.color + " p-2 rounded-lg"}>
                <MaterialIcon name={stat.icon} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-primary">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Applications */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline text-xl font-bold text-primary">My Applications</h2>
            <Link href="/jobs" className="text-xs font-bold text-primary underline decoration-2 underline-offset-4">Browse Jobs</Link>
          </div>
          <div className="space-y-4">
            {myApplications.length > 0 ? (
              myApplications.slice(0, 5).map((app: any) => (
                <div key={app.id} className="flex items-center justify-between p-6 bg-surface-container-low rounded-2xl border border-transparent hover:border-outline-variant/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary italic font-black">
                      {app.parentName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-primary tracking-tight leading-none mb-1">{app.jobTitle}</h4>
                      <p className="text-on-surface-variant text-xs font-medium opacity-60">Posted by {app.parentName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                      app.status === "pending" ? "bg-secondary/10 text-secondary"
                      : app.status === "accepted" ? "bg-green-100 text-green-700"
                      : "bg-red-50 text-red-500"
                    )}>
                      {app.status}
                    </span>
                    <MaterialIcon name="chevron_right" className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <MaterialIcon name="work_outline" className="text-2xl" />
                </div>
                <div>
                  <p className="font-headline font-bold text-primary">No applications yet</p>
                  <p className="text-xs font-medium italic">Start browsing jobs to find your next match.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Standards Promo */}
        <div className="bg-gradient-to-br from-primary to-primary-container text-on-primary p-10 rounded-[3rem] shadow-2xl shadow-primary/30 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:rotate-12 transition-transform">
              <MaterialIcon name="verified_user" className="text-4xl text-secondary" fill />
            </div>
            <h3 className="font-headline text-3xl font-black mb-6 tracking-tighter italic leading-none">Get Global <br /> Certified</h3>
            <p className="text-on-primary/70 text-lg font-medium italic leading-relaxed mb-10">
              Unlock elite bookings and 3x higher pay by completing our vetted Global Standards Program.
            </p>
          </div>
          <Link
            href="/dashboard/nanny/certifications"
            className="relative z-10 w-full py-5 bg-white text-primary font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-on-primary/95 transition-all text-center shadow-xl active:scale-95"
          >
            Start Program
          </Link>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary opacity-15 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/5 rounded-full blur-[60px]" />
        </div>
      </div>
    </div>
  );
}
