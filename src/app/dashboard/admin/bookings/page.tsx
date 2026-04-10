import { getAdminBookings } from "./actions";
import AdminBookingsClient from "./AdminBookingsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Bookings Oversight | KindredCare",
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; status?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const status = searchParams.status || "all";

  const data = await getAdminBookings(page, search, status);

  return <AdminBookingsClient initialData={data} currentParams={{ page, search, status }} />;
}
