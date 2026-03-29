import { requireUser } from "@/lib/get-server-user";
import { getVerificationData } from "./actions";
import VerificationWizard from "./VerificationWizard";
import { SuccessState, PendingState, RejectedState } from "./StatusScreens";

export default async function VerificationPage() {
  const { user } = await requireUser();
  const initialData = await getVerificationData();
  const status = initialData?.verification?.status || "none";

  if (status === "verified") {
    return (
      <main className="py-20 max-w-7xl mx-auto min-h-screen">
        <SuccessState user={user} />
      </main>
    );
  }

  if (status === "pending") {
    return (
      <main className="py-20 max-w-7xl mx-auto min-h-screen">
        <PendingState user={user} />
      </main>
    );
  }

  if (status === "rejected") {
    return (
      <main className="py-20 max-w-7xl mx-auto min-h-screen">
        <RejectedState user={user} verification={initialData.verification} />
      </main>
    );
  }

  return (
    <main className="py-20 max-w-7xl mx-auto min-h-screen">
      <VerificationWizard initialData={initialData} user={user} />
    </main>
  );
}
