import { describe, it, expect } from "vitest";
import { checkCsrf } from "../../functions/api/_csrf";
import { mockRequest } from "./_helpers";

const ALLOWED = "https://octodeck.pages.dev";
const env = { ALLOWED_ORIGIN: ALLOWED };

describe("checkCsrf", () => {
  it("returns null (allowed) when origin and header are valid", () => {
    const req = mockRequest("https://worker.example.com/api/session", {
      Origin: ALLOWED,
      "X-GitHub-App-CSRF": "1",
      Cookie: "__Host-csrf=1",
    });
    expect(checkCsrf(req, env)).toBeNull();
  });

  it("returns 403 when custom header is missing", () => {
    const req = mockRequest("https://worker.example.com/api/session", { Origin: ALLOWED });
    expect(checkCsrf(req, env)?.status).toBe(403);
  });

  it("returns 403 when origin is wrong", () => {
    const req = mockRequest("https://worker.example.com/api/session", {
      Origin: "https://evil.com",
      "X-GitHub-App-CSRF": "1",
    });
    expect(checkCsrf(req, env)?.status).toBe(403);
  });

  it("returns null when origin is absent (same-origin request)", () => {
    // Browsers omit Origin on same-origin fetches — this must be allowed.
    const req = mockRequest("https://worker.example.com/api/session", {
      "X-GitHub-App-CSRF": "1",
      Cookie: "__Host-csrf=1",
    });
    expect(checkCsrf(req, env)).toBeNull();
  });

  it("returns 403 when both origin and header are missing", () => {
    const req = mockRequest("https://worker.example.com/api/session");
    expect(checkCsrf(req, env)?.status).toBe(403);
  });
});
