import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";
import { getDefaultPathForRole } from "@/lib/auth/domain/routes";

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
      const pathname = request.nextUrl.pathname.replace(/\/$/, "") || "/";
      const nextUrl = request.nextUrl;

      const isAuthPage = pathname === "/login" || pathname === "/register";
      const isPublicApiRoute = pathname.startsWith("/api/auth");
      const isAdminRoute = pathname.startsWith("/admin");
      const isLineWebhookRoute = pathname === "/api/line/webhook";

      const apiKey = request.headers.get("x-api-key");
      const isValidN8nKey =
        !!process.env.N8N_API_KEY && apiKey === process.env.N8N_API_KEY;
      const isN8nScheduledRoute = pathname === "/api/content/scheduled";
      const isCronProcessDueRoute = pathname === "/api/cron/process-due";
      const isN8nPatchRoute = /^\/api\/content\/[^/]+$/.test(pathname);
      const isN8nContentCreateRoute = pathname === "/api/content";

      if (
        isPublicApiRoute ||
        isLineWebhookRoute ||
        (isValidN8nKey &&
          (isN8nScheduledRoute ||
            isCronProcessDueRoute ||
            isN8nPatchRoute ||
            isN8nContentCreateRoute))
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

      if (isAdminRoute && !isAdmin) {
        return Response.redirect(
          new URL(getDefaultPathForRole(auth?.user?.role), nextUrl)
        );
      }

      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.displayName = user.displayName;
        token.position = user.position;
        token.busy = user.busy;
      }
      if (trigger === "update" && session?.user) {
        token.name = session.user.name ?? token.name;
        token.email = session.user.email ?? token.email;
        token.picture = session.user.image ?? token.picture;
        token.displayName = session.user.displayName ?? token.displayName;
        token.position = session.user.position ?? token.position;
        token.busy = session.user.busy ?? token.busy;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.image =
          typeof token.picture === "string" ? token.picture : session.user.image;
        session.user.displayName =
          typeof token.displayName === "string"
            ? token.displayName
            : session.user.displayName;
        session.user.position =
          typeof token.position === "string"
            ? token.position
            : session.user.position;
        session.user.busy = Boolean(token.busy);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
