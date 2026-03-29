import { db } from "@/db";
import { bookings, nannyProfiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { BookingLayout } from "@/components/booking/BookingLayout";
import { PaymentStep } from "@/components/booking/PaymentStep";
import { requireUser } from "@/lib/get-server-user";
import { stripe } from "@/lib/stripe";

export default async function PaymentPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const nannyId = params.id;
  const bookingId = searchParams.bookingId;
  const user = await requireUser();

  if (!bookingId) return redirect(`/nannies/${nannyId}/book/schedule`);

  // 1. Fetch Booking and Nanny
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
    with: {
      caregiver: true,
      caregiverProfile: true
    }
  });

  if (!booking) return notFound();

  // 2. Fetch Saved Cards (if customer exists)
  let savedCards: any[] = [];
  if (user.stripeCustomerId) {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });
    savedCards = paymentMethods.data;
  }

  return (
    <BookingLayout currentStep={2}>
      <PaymentStep 
        booking={booking} 
        nanny={{
          name: booking.caregiver.fullName,
          hourlyRate: booking.caregiverProfile.hourlyRate
        }} 
        savedCards={savedCards}
      />
    </BookingLayout>
  );
}
