import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/browse(.*)",
  "/nannies(.*)",
  "/families(.*)",
  "/jobs(.*)",
  "/api/stripe/webhooks(.*)",
  "/api/stripe/create-payment-intent(.*)",
  "/api/nannies(.*)",
  "/forgot-password(.*)",
  "/safety",
  "/faq",
  "/premium"
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
}, {
  signInUrl: "/login",
  signUpUrl: "/signup",
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
