import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import { AuthModal } from "@/components/AuthModal";

const mockRedirectToGitHub = vi.fn();
const mockClearError = vi.fn();

vi.mock("@/auth/oauthFlow", () => ({
  redirectToGitHub: () => mockRedirectToGitHub(),
}));

vi.mock("@/store/authStore", () => ({
  useAuthStore: vi.fn((selector: (s: { status: string; error: string | null; clearError: () => void }) => unknown) =>
    selector({ status: "idle", error: null, clearError: mockClearError }),
  ),
}));

function renderModal(onDemoMode = vi.fn(), onClose = vi.fn()) {
  return render(<AuthModal open={true} onDemoMode={onDemoMode} onClose={onClose} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("AuthModal — idle state", () => {
  it("clicking 'Sign in with GitHub' calls redirectToGitHub", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByText("Sign in with GitHub"));
    expect(mockRedirectToGitHub).toHaveBeenCalledOnce();
  });

  it("clicking 'Continue in Demo Mode' calls onDemoMode", async () => {
    const user = userEvent.setup();
    const onDemoMode = vi.fn();
    render(<AuthModal open={true} onDemoMode={onDemoMode} onClose={vi.fn()} />);
    await user.click(screen.getByText("Continue in Demo Mode"));
    expect(onDemoMode).toHaveBeenCalledOnce();
  });
});
