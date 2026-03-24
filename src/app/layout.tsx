import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "KindredCare US | Trusted Childcare Professionals",
  description: "Bespoke Care for Your Little Ones. Connecting elite families with the nation's most trusted, certified caregivers.",
  keywords: ["nanny", "childcare", "babysitter", "caregiver", "KindredCare", "US"],
  openGraph: {
    title: "KindredCare US | Trusted Childcare Professionals",
    description: "Connecting elite families with the nation's most trusted, certified caregivers.",
    siteName: "KindredCare US",
    type: "website",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider signInUrl="/login" signUpUrl="/signup">
      <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable}`}>
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="antialiased bg-surface text-on-surface font-body min-h-screen flex flex-col">
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
