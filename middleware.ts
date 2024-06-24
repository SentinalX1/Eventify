import { clerkMiddleware, ClerkMiddlewareOptions } from "@clerk/nextjs/server";
import { NextRequest } from 'next/server';
import customMiddleware from "./customMiddleware";

const isProduction = process.env.NODE_ENV === 'production';

export default function middleware(req: NextRequest, event: any) {
  if (isProduction) {
    return customMiddleware(req, event);
  } else {
    const options: ClerkMiddlewareOptions = {};
    return clerkMiddleware(options)(req, event);
  }
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
