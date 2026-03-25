// @vitest-environment node
import { describe, it, expect } from "vitest";
import { onRequestPost } from "../../functions/api/logout";
import { makeCtx, mockRequest } from "./_helpers";

const ALLOWED = "https://octodeck.pages.dev";

function makeCtxLogout(headers: Record<string, string>) {
  return makeCtx(mockRequest("https://worker.example.com/api/logout", headers), {
    ALLOWED_ORIGIN: ALLOWED,
  });
}

describe("/api/logout", () => {
  it("returns 403 without CSRF header", async () => {
    const res = await onRequestPost(makeCtxLogout({ Origin: ALLOWED, Cookie: "__Host-csrf=tok" }));
    expect(res.status).toBe(403);
  });

  it("returns 403 when CSRF header does not match cookie", async () => {
    const res = await onRequestPost(
      makeCtxLogout({
        Origin: ALLOWED,
        "X-GitHub-App-CSRF": "wrong",
        Cookie: "__Host-csrf=tok",
      }),
    );
    expect(res.status).toBe(403);
  });

  it("returns 403 with wrong origin", async () => {
    const res = await onRequestPost(
      makeCtxLogout({
        Origin: "https://evil.com",
        "X-GitHub-App-CSRF": "tok",
        Cookie: "__Host-csrf=tok",
      }),
    );
    expect(res.status).toBe(403);
  });

  it("returns 204 with valid CSRF", async () => {
    const res = await onRequestPost(
      makeCtxLogout({
        Origin: ALLOWED,
        "X-GitHub-App-CSRF": "tok",
        Cookie: "__Host-csrf=tok",
      }),
    );
    expect(res.status).toBe(204);
  });

  it("clears session and csrf cookies", async () => {
    const res = await onRequestPost(
      makeCtxLogout({
        Origin: ALLOWED,
        "X-GitHub-App-CSRF": "tok",
        Cookie: "__Host-csrf=tok",
      }),
    );
    const setCookies = res.headers.getSetCookie();
    expect(setCookies.some((c) => c.startsWith("__Host-session=") && c.includes("Max-Age=0"))).toBe(
      true,
    );
    expect(setCookies.some((c) => c.startsWith("__Host-csrf=") && c.includes("Max-Age=0"))).toBe(
      true,
    );
  });
});
