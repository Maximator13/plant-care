import { clerkMiddleware } from "@clerk/nextjs/server";

// Initialises Clerk's auth context and sets the Content-Security-Policy (Clerk merges its own
// domains). Access control is resource-based: every page and Server Action checks the user itself
// (lib/plants.ts → requireUserId / requireHome).
export default clerkMiddleware({
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "img-src": ["'self'", "data:", "blob:"],
      "object-src": ["'none'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"],
      "frame-ancestors": ["'none'"],
    },
  },
});

export const config = {
  matcher: [
    "/((?!_next|\\.well-known/workflow/|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
