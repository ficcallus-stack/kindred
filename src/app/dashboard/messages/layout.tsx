import AblyClientProvider from "@/components/AblyProvider";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return <AblyClientProvider>{children}</AblyClientProvider>;
}
