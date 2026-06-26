import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { authStorage, getToken } from "./authContext.js";

describe("getToken()", () => {
  const ORIGINAL_TOKEN = process.env.MIKKU_MCP_TOKEN;

  beforeEach(() => {
    delete process.env.MIKKU_MCP_TOKEN;
  });

  afterEach(() => {
    if (ORIGINAL_TOKEN === undefined) {
      delete process.env.MIKKU_MCP_TOKEN;
    } else {
      process.env.MIKKU_MCP_TOKEN = ORIGINAL_TOKEN;
    }
  });

  it("returns undefined when no ALS context and no env var", () => {
    expect(getToken()).toBeUndefined();
  });

  it("returns the env var value when no ALS context", () => {
    process.env.MIKKU_MCP_TOKEN = "env-jwt";
    expect(getToken()).toBe("env-jwt");
  });

  it("returns the ALS context token when wrapped in authStorage.run", () => {
    process.env.MIKKU_MCP_TOKEN = "env-jwt";
    const result = authStorage.run({ token: "als-jwt" }, () => getToken());
    expect(result).toBe("als-jwt");
  });

  it("ALS context wins over env var", () => {
    process.env.MIKKU_MCP_TOKEN = "env-jwt";
    const inside = authStorage.run({ token: "als-jwt" }, () => getToken());
    expect(inside).toBe("als-jwt");
    expect(getToken()).toBe("env-jwt");
  });
});
