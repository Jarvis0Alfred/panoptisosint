"use server";

export async function createAdminAccount() {
    // No-op: Admin is determined by Google OAuth email (dtsakmakis@gmail.com)
    return { success: false, error: "Use Google Sign In instead." };
}
