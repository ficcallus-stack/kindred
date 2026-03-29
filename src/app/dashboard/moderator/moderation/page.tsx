import { getAllBookingsAdmin } from "../../nanny/bookings/actions";
import ModerationClient from "./ModerationClient";

export default async function ModerationPage() {
  const allBookings = await getAllBookingsAdmin();

  return (
    <ModerationClient initialBookings={allBookings} />
  );
}
