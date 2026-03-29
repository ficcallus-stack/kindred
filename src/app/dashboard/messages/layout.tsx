import { redirect } from "next/navigation";
import AblyClientProvider from "@/components/AblyProvider";
import { getServerUser } from "@/lib/get-server-user";

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return <AblyClientProvider>{children}</AblyClientProvider>;
}
