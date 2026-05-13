import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { authConfig } from "@/lib/auth.config";

/** Hardcoded admin email */
const ADMIN_EMAIL = "dtsakmakis@gmail.com";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    session: { strategy: "jwt" },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, account }) {
            // On first sign-in, persist role into the JWT
            if (user?.email) {
                token.role = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
                    ? "admin"
                    : "user";
                token.id = user.id || user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as { role?: string }).role = token.role as string;
            }
            return session;
        },
        async signIn({ user }) {
            // Allow anyone with a Google account
            return true;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
});
