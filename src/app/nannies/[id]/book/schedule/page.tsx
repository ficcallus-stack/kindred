import { db } from "@/db";
import { nannyProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BookingLayout } from "@/components/booking/BookingLayout";
import { ScheduleStep } from "@/components/booking/ScheduleStep";

export default async function SchedulePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const nannyId = params.id;

  const nanny = await db.query.nannyProfiles.findFirst({
    where: eq(nannyProfiles.id, nannyId),
    with: { user: true }
  });

  if (!nanny) return notFound();

  return (
    <BookingLayout currentStep={1}>
      <ScheduleStep nanny={{
        id: nanny.id!,
        name: nanny.user.fullName!,
        hourlyRate: nanny.hourlyRate || "0",
        availability: nanny.availability || {}
      }} />
    </BookingLayout>
  );
}
