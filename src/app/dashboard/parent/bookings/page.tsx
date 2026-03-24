"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { StripeProvider } from "@/components/StripeProvider";
import BookingStep2 from "@/components/bookings/BookingStep2";
import BookingStep3 from "@/components/bookings/BookingStep3";

export default function BookingsPage() {
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    bookingId: string;
    clientSecret: string;
  } | null>(null);
  const [bookingDetails, setBookingDetails] = useState({
    nannyName: "",
    schedule: "Mon - Fri, 8am - 4pm",
    hoursPerDay: 8,
    hourlyRate: 25,
    totalDays: 5,
    caregiverId: "",
  });
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load existing bookings
  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => setExistingBookings(data))
      .catch(() => {});
  }, []);

  // If coming from accepted applicant
  useEffect(() => {
    const caregiverId = searchParams.get("caregiverId");
    if (caregiverId) {
      setBookingDetails((prev) => ({ ...prev, caregiverId }));
      // Fetch nanny name
      fetch(`/api/nannies/${caregiverId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.fullName) {
            setBookingDetails((prev) => ({
              ...prev,
              nannyName: data.fullName,
              hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : 25,
            }));
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  const handleCreateBooking = async () => {
    setIsCreating(true);
    try {
      const totalAmount = bookingDetails.hoursPerDay * bookingDetails.totalDays * bookingDetails.hourlyRate;

      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caregiverId: bookingDetails.caregiverId,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          hoursPerDay: bookingDetails.hoursPerDay,
          totalAmount,
        }),
      });

      const data = await res.json();
      if (data.bookingId && data.clientSecret) {
        setBookingResult(data);
        setStep(2);
      }
    } catch (err) {
      console.error("Failed to create booking:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const goToDashboard = () => router.push("/dashboard/parent");
  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const totalAmount =
    bookingDetails.hoursPerDay * bookingDetails.totalDays * bookingDetails.hourlyRate * 100;

  return (
    <div className={cn(
      "bg-surface font-body text-on-surface min-h-screen",
      step === 3
        ? "bg-[radial-gradient(circle_at_20%_30%,#ffdfc4_0%,transparent_40%),radial-gradient(circle_at_80%_70%,#d5e3ff_0%,transparent_40%)]"
        : ""
    )}>
      <main className={cn("pt-8 pb-24 px-6 max-w-7xl mx-auto relative", step === 3 ? "overflow-hidden" : "")}>
        {step === 1 && (
          <div className="space-y-10">
            <header>
              <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs font-label">
                Bookings
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-primary font-headline mt-2 mb-4 leading-tight tracking-tight">
                {bookingDetails.caregiverId ? `Book ${bookingDetails.nannyName || "Caregiver"}` : "My Bookings"}
              </h1>
            </header>

            {/* New Booking Form (if caregiverId provided) */}
            {bookingDetails.caregiverId && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/10 max-w-2xl space-y-6">
                <h2 className="font-headline text-xl font-bold text-primary">Create New Booking</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Hours per Day</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={bookingDetails.hoursPerDay}
                      onChange={(e) => setBookingDetails((p) => ({ ...p, hoursPerDay: parseInt(e.target.value) || 8 }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Total Days</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={bookingDetails.totalDays}
                      onChange={(e) => setBookingDetails((p) => ({ ...p, totalDays: parseInt(e.target.value) || 5 }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Rate</span>
                    <span className="font-bold text-primary">${bookingDetails.hourlyRate}/hr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-bold text-primary">{bookingDetails.hoursPerDay}hrs × {bookingDetails.totalDays} days</span>
                  </div>
                  <div className="pt-3 border-t flex justify-between">
                    <span className="font-bold text-primary text-lg">Total</span>
                    <span className="font-black text-2xl text-primary">
                      ${(bookingDetails.hoursPerDay * bookingDetails.totalDays * bookingDetails.hourlyRate).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCreateBooking}
                  disabled={isCreating}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  <MaterialIcon name="payments" />
                  {isCreating ? "Setting up payment..." : "Proceed to Payment"}
                </button>
              </div>
            )}

            {/* Existing Bookings List */}
            <div className="space-y-4">
              <h2 className="font-headline text-xl font-bold text-primary">
                {existingBookings.length > 0 ? "Active Bookings" : ""}
              </h2>
              {existingBookings.map((booking: any) => (
                <div key={booking.id} className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="font-black text-lg text-primary">
                        {booking.caregiver?.fullName?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-primary">{booking.caregiver?.fullName || "Caregiver"}</h4>
                      <p className="text-xs text-slate-500">
                        ${(booking.totalAmount / 100).toFixed(2)} · {booking.hoursPerDay}hrs/day
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                    booking.status === "confirmed" ? "bg-green-100 text-green-700"
                    : booking.status === "pending" ? "bg-yellow-100 text-yellow-700"
                    : booking.status === "completed" ? "bg-blue-100 text-blue-700"
                    : "bg-red-50 text-red-500"
                  )}>
                    {booking.status}
                  </span>
                </div>
              ))}
              {existingBookings.length === 0 && !bookingDetails.caregiverId && (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
                  <MaterialIcon name="event_note" className="text-6xl mb-4" />
                  <p className="font-headline font-bold text-xl text-primary">No bookings yet</p>
                  <p className="text-sm italic mt-2">Accept an applicant to start a booking.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && bookingResult && (
          <StripeProvider clientSecret={bookingResult.clientSecret}>
            <BookingStep2
              onNext={nextStep}
              onBack={prevStep}
              clientSecret={bookingResult.clientSecret}
              amount={totalAmount}
              nannyName={bookingDetails.nannyName}
              schedule={bookingDetails.schedule}
              hoursPerDay={bookingDetails.hoursPerDay}
              hourlyRate={bookingDetails.hourlyRate}
              bookingId={bookingResult.bookingId}
            />
          </StripeProvider>
        )}

        {step === 3 && <BookingStep3 onDone={goToDashboard} />}
      </main>
    </div>
  );
}
