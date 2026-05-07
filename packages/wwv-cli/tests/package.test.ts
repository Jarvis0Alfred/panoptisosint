import { describe, it, expect } from "vitest";
import { packagePlugin } from "../src/commands/package";

describe("package command", () => {
    it("should export packagePlugin function", () => {
        expect(typeof packagePlugin).toBe("function");
    });
});
