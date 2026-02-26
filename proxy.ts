import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/chat(.*)",
]);

export default clerkMiddleware(async (auth, req) => {

  const { userId } = await auth();

  if (!userId && isProtectedRoute(req)) {

    return Response.redirect(
      new URL("/sign-in", req.url)
    );

  }

});

export const config = {

  matcher: [

    "/((?!_next|.*\\..*).*)/chat/:path*",

  ],

};