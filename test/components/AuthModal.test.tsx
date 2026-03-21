import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { AuthModal } from "@/components/AuthModal";

const mockStart = vi.fn();
const mockClearError = vi.fn();

vi.mock("@/auth/useDeviceFlow", () => ({
  useDeviceFlow: vi.fn(() => ({
    userCode: null,
    verificationUri: null,
    expiresAt: null,
    status: "idle",
    error: null,
    start: mockStart,
  })),
}));

vi.mock("@/store/authStore", () => ({
  useAuthStore: vi.fn((selector: (s: { clearError: () => void }) => unknown) =>
    selector({ clearError: mockClearError }),
  ),
}));

vi.mock("@/hooks/useCountdownTimer", () => ({
  useCountdownTimer: vi.fn(() => 0),
}));

import { useDeviceFlow } from "@/auth/useDeviceFlow";

function renderModal(onDemoMode = vi.fn(), onClose = vi.fn()) {
  return {
    onDemoMode,
    onClose,
    ...render(<AuthModal open={true} onDemoMode={onDemoMode} onClose={onClose} />),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AuthModal — idle state", () => {
  beforeEach(() => {
    vi.mocked(useDeviceFlow).mockReturnValue({
      userCode: null,
      verificationUri: null,
      expiresAt: null,
      status: "idle",
      error: null,
      start: mockStart,
    });
  });

  it("clicking 'Sign in with GitHub' calls start but not clearError", async () => {
    const user = userEvent.setup();
    const { onDemoMode } = renderModal();
    await user.click(screen.getByText("Sign in with GitHub"));
    expect(mockStart).toHaveBeenCalledOnce();
    expect(mockClearError).not.toHaveBeenCalled();
    expect(onDemoMode).not.toHaveBeenCalled();
  });

  it("clicking 'Continue in Demo Mode' calls onDemoMode", async () => {
    const user = userEvent.setup();
    const { onDemoMode } = renderModal();
    await user.click(screen.getByText("Continue in Demo Mode"));
    expect(onDemoMode).toHaveBeenCalledOnce();
  });
});

describe("AuthModal — error state", () => {
  beforeEach(() => {
    vi.mocked(useDeviceFlow).mockReturnValue({
      userCode: null,
      verificationUri: null,
      expiresAt: null,
      status: "error",
      error: "Something went wrong",
      start: mockStart,
    });
  });

  it("clicking 'Sign in with GitHub' calls clearError then start", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByText("Sign in with GitHub"));
    expect(mockClearError).toHaveBeenCalledOnce();
    expect(mockStart).toHaveBeenCalledOnce();
  });
});

describe("AuthModal — polling state", () => {
  beforeEach(() => {
    vi.mocked(useDeviceFlow).mockReturnValue({
      userCode: "ABCD-1234",
      verificationUri: "https://github.com/login/device",
      expiresAt: Date.now() + 900_000,
      status: "polling",
      error: null,
      start: mockStart,
    });
  });

  it("clicking Cancel calls clearError and onDemoMode", async () => {
    const user = userEvent.setup();
    const { onDemoMode } = renderModal();
    await user.click(screen.getByText("Cancel"));
    expect(mockClearError).toHaveBeenCalledOnce();
    expect(onDemoMode).toHaveBeenCalledOnce();
  });
});
