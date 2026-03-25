import { NextRequest, NextResponse } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/browse",
  "/nannies",
  "/families",
  "/jobs",
  "/api/stripe/webhooks",
  "/api/stripe/create-payment-intent",
  "/api/nannies",
  "/api/auth/session",
  "/api/auth/me",
  "/api/auth/send-otp",
  "/api/auth/verify-otp",
  "/api/auth/sync",
  "/forgot-password",
  "/verify-email",
  "/safety",
  "/faq",
  "/premium",
  "/cookies",
  "/terms",
  "/privacy",
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (route === pathname) return true;
    if (pathname.startsWith(route + "/")) return true;
    return false;
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(html?|css|js|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)$/)
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check session cookie
  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Since middleware runs on Edge runtime, we cannot use firebase-admin here.
  // We simply verify the token exists. Real JWT cryptographic validation happens 
  // downstream in the Server Actions / Server Components executing in the Node runtime.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
