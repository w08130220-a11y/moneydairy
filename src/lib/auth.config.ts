import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe config used by middleware. Providers that need Node APIs
 * (e.g. bcryptjs) live in `auth.ts` only.
 */
export const authConfig = {
  session: { strategy: "jwt" as const },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) token.uid = (user as { id: string }).id;
      return token;
    },
    session: ({ session, token }) => {
      if (session.user && token.uid) {
        (session.user as { id?: string }).id = token.uid as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
