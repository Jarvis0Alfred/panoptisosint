import type { Metadata } from "next";
import { OsintToolkit } from "./components/OsintToolkit";

export const metadata: Metadata = {
    title: "OSINT Toolkit — Panoptis",
    description: "The ultimate open-source intelligence toolkit. Find anyone, anything, anywhere.",
};

export default function OsintPage() {
    return (
        <main className="min-h-screen bg-[#0a0a0f]">
            <OsintToolkit />
        </main>
    );
}
