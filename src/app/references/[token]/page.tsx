import { db } from "@/db";
import { referenceSubmissions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import ReferenceResponseClient from "./ReferenceResponseClient";

export default async function ReferenceVerificationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // 1. Fetch reference details
  const ref = await db.query.referenceSubmissions.findFirst({
    where: eq(referenceSubmissions.token, token),
    with: {
        // We'll need the nanny's name
    }
  });

  if (!ref) notFound();
  if (ref.status === "completed") {
      return (
        <div className="min-h-screen bg-[#faf9f9] flex items-center justify-center px-6">
            <div className="max-w-md w-full bg-white rounded-3xl p-12 shadow-sm border border-black/5 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MaterialIcon name="check_circle" className="text-3xl text-green-600" />
                </div>
                <h1 className="text-2xl font-headline font-bold text-[#000716] mb-4">Feedback Received</h1>
                <p className="text-[#44474e] leading-relaxed">
                    Thank you, {ref.employerName}. Your reference for this caregiver has been securely recorded and verified.
                </p>
            </div>
        </div>
      );
  }

  // Fetch Nanny name manually since relations might not be fully linked in types here
  const nanny = await db.query.users.findFirst({
      where: eq(users.id, ref.caregiverId)
  });

  return (
    <div className="min-h-screen bg-[#faf9f9] selection:bg-[#ffb780]/30 selection:text-[#031f41]">
      <main className="max-w-2xl mx-auto pt-24 pb-32 px-6">
        
        {/* Branding */}
        <div className="flex items-center justify-center mb-16">
            <span className="text-2xl font-extrabold text-[#031f41] tracking-tight">
                KindredCare <span className="text-[#8e4e14] italic font-medium">US</span>
            </span>
        </div>

        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-black/5">
            <header className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fef3e8] text-[#8e4e14] text-xs font-bold uppercase tracking-wider mb-6">
                    <MaterialIcon name="verified_user" className="text-sm" />
                    Secure Verification
                </div>
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-[#000716] leading-tight mb-4">
                    Reference for {nanny?.fullName}
                </h1>
                <p className="text-[#44474e] leading-relaxed">
                    Hello {ref.employerName}, you were listed as a reference for {nanny?.fullName}. 
                    Your professional feedback helps us ensure the highest standards of care.
                </p>
            </header>

            <ReferenceResponseClient token={token} />
        </div>

        <footer className="mt-12 text-center text-[#9ea0a5] text-xs">
            © 2026 KindredCare US. Secure, private, and encrypted verification.
        </footer>
      </main>
    </div>
  );
}
