import { requireUser } from "@/lib/get-server-user";
import { getVerificationData } from "./actions";
import VerificationWizard from "./VerificationWizard";
import { SuccessState, PendingState, RejectedState } from "./StatusScreens";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

import CertificationsOverview from "@/components/dashboard/CertificationsOverview";

export default async function VerificationPage() {
  const authUser = await requireUser();
  const userData = await db.query.users.findFirst({
    where: eq(users.id, authUser.uid)
  });
  
  if (!userData) throw new Error("User profile not found");

  const initialData = await getVerificationData();
  const status = initialData?.verification?.status || "none";

  let statusContent;

  if (status === "verified") {
    statusContent = <SuccessState user={userData} />;
  } else if (status === "pending") {
    statusContent = <PendingState user={userData} />;
  } else if (status === "rejected") {
    statusContent = <RejectedState user={userData} verification={initialData.verification} />;
  } else {
    statusContent = <VerificationWizard initialData={initialData} user={userData} />;
  }

  return (
    <main className="py-20 max-w-7xl mx-auto min-h-screen px-4 md:px-8">
      {statusContent}
      
      {/* Certifications Merge */}
      <CertificationsOverview />
    </main>
  );
}
