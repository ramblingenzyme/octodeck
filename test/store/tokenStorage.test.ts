import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadToken, saveToken, clearToken } from "@/store/tokenStorage";

const STORAGE_KEY = "gh-deck:token";

beforeEach(() => {
  localStorage.clear();
});

describe("loadToken", () => {
  it("returns null when storage is empty", () => {
    expect(loadToken()).toBeNull();
  });

  it("returns the stored value after saveToken", () => {
    saveToken("my-token");
    expect(loadToken()).toBe("my-token");
  });

  it("returns null when localStorage.getItem throws", () => {
    const original = localStorage.getItem.bind(localStorage);
    Object.defineProperty(localStorage, "getItem", {
      configurable: true,
      value: () => {
        throw new Error("storage error");
      },
    });
    try {
      expect(loadToken()).toBeNull();
    } finally {
      Object.defineProperty(localStorage, "getItem", { configurable: true, value: original });
    }
  });
});

describe("saveToken", () => {
  it("persists to localStorage under the correct key", () => {
    saveToken("abc123");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("abc123");
  });
});

describe("clearToken", () => {
  it("removes the value (loadToken returns null afterwards)", () => {
    saveToken("abc123");
    clearToken();
    expect(loadToken()).toBeNull();
  });
});
