import { redirect } from "next/navigation";
import { syncUser } from "@/lib/user-sync";
import { db } from "@/db";
import { nannyProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProfileForm from "./ProfileForm";

export default async function NannyProfilePage() {
  const user = await syncUser();

  if (!user) {
    redirect("/login");
  }

  // Security check: Only nannies can access this page
  if (user.role !== "caregiver") {
    redirect("/dashboard/parent");
  }

  // Fetch the nanny profile details
  const profileDetails = await db.query.nannyProfiles.findFirst({
    where: eq(nannyProfiles.id, user.id),
  });

  const initialData = {
    fullName: user.fullName,
    location: profileDetails?.location || "",
    hourlyRate: profileDetails?.hourlyRate || "0",
    experienceYears: profileDetails?.experienceYears || 0,
    bio: profileDetails?.bio || "",
    photos: (profileDetails?.photos as string[]) || [],
  };

  return <ProfileForm initialData={initialData} />;
}
