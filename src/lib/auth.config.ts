import type { NextAuthConfig } from "next-auth";

/**
 * Auth config for middleware.
 * Public access by default. Only gate specific features.
 */
export const authConfig: NextAuthConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isApi = nextUrl.pathname.startsWith("/api");
            const isSetup = nextUrl.pathname.startsWith("/setup");
            const isLogin = nextUrl.pathname.startsWith("/login");

            // API, setup, login — always public
            if (isApi || isSetup || isLogin) return true;

            // Everything else — public. Auth only gates admin features.
            return true;
        },
    },
    providers: [], // Added in auth.ts
};
