"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
    const router = useRouter();

    useEffect(() => {
        // No setup needed with Google OAuth. Admin is determined by email.
        router.replace("/login");
    }, [router]);

    return null;
}
