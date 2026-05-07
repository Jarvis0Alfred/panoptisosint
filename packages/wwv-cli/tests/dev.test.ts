import { describe, it, expect, vi } from "vitest";
import { startDevServer } from "../src/commands/dev";

// Mock vite and ws
vi.mock("vite", () => ({
    createServer: vi.fn().mockResolvedValue({
        listen: vi.fn(),
        httpServer: { on: vi.fn() },
        ws: { on: vi.fn() }
    })
}));

describe("dev command", () => {
    it("should export startDevServer function", () => {
        expect(typeof startDevServer).toBe("function");
    });
});
