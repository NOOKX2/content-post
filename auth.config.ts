import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";
import { getDefaultPathForRole } from "@/lib/auth/routes";

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === "ADMIN";
      const pathname = request.nextUrl.pathname;
      const nextUrl = request.nextUrl;

      const isAuthPage = pathname === "/login" || pathname === "/register";
      const isPublicApiRoute = pathname.startsWith("/api/auth");
      const isAdminRoute = pathname.startsWith("/admin");
      const isCreateRoute = pathname === "/create";

      const apiKey = request.headers.get("x-api-key");
      const isValidN8nKey =
        !!process.env.N8N_API_KEY && apiKey === process.env.N8N_API_KEY;
      const isN8nScheduledRoute = pathname === "/api/content/scheduled";
      const isN8nPatchRoute = /^\/api\/content\/[^/]+$/.test(pathname);

      if (
        isPublicApiRoute ||
        (isValidN8nKey && (isN8nScheduledRoute || isN8nPatchRoute))
      ) {
        return true;
      }

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(
            new URL(getDefaultPathForRole(auth?.user?.role), nextUrl)
          );
        }
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      if (isCreateRoute && isAdmin) {
        return Response.redirect(new URL("/admin", nextUrl));
      }

      if (isAdminRoute && !isAdmin) {
        return Response.redirect(
          new URL(getDefaultPathForRole(auth?.user?.role), nextUrl)
        );
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
