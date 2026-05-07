import { describe, it, expect } from "vitest";
import { buildPackage } from "../src/commands/publish";

describe("publish command", () => {
    it("should export buildPackage function", () => {
        expect(typeof buildPackage).toBe("function");
    });
});
