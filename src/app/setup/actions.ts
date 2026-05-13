"use server";

import { hashSync } from "bcryptjs";
import { prisma } from "@/lib/db";

interface SetupResult {
    success: boolean;
    error?: string;
}

/** Create the initial admin account. Rejects if any user already exists. */
export async function createAdminAccount(formData: FormData): Promise<SetupResult> {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirm = formData.get("confirm") as string;

        if (!name || !email || !password) {
            return { success: false, error: "All fields are required." };
        }
        if (password.length < 8) {
            return { success: false, error: "Password must be at least 8 characters." };
        }
        if (password !== confirm) {
            return { success: false, error: "Passwords do not match." };
        }

        const existingCount = await prisma.user.count();
        if (existingCount > 0) {
            return { success: false, error: "Admin account already exists." };
        }

        const hashedPassword = hashSync(password, 12);
        await prisma.user.create({
            data: { name, email, hashedPassword, role: "admin" },
        });

        return { success: true };
    } catch (err: any) {
        console.error("[setup] createAdminAccount failed:", err);
        if (err?.message?.includes("connect")) {
            return { success: false, error: "Database connection failed. Check DATABASE_URL in .env.local" };
        }
        return { success: false, error: err?.message || "Setup failed. Check server logs." };
    }
}
