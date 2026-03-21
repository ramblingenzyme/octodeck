import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/preact";
import { Modal } from "@/components/ui/Modal";

// happy-dom doesn't implement showModal/close, stub them out
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

function renderModal(props: Partial<Parameters<typeof Modal>[0]> = {}) {
  const onClose = vi.fn();
  const { container } = render(
    <Modal open={false} title="Test" titleId="test-title" onClose={onClose} {...props}>
      content
    </Modal>,
  );
  const dialog = container.querySelector("dialog") as HTMLDialogElement;
  return { dialog, onClose };
}

describe("Modal onCancel", () => {
  it("without preventCancel: cancel event calls onClose", () => {
    const { dialog, onClose } = renderModal();
    const event = new Event("cancel", { cancelable: true });
    dialog.dispatchEvent(event);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("with preventCancel: cancel event does not call onClose", () => {
    const { dialog, onClose } = renderModal({ preventCancel: true });
    const event = new Event("cancel", { cancelable: true });
    dialog.dispatchEvent(event);
    expect(onClose).not.toHaveBeenCalled();
  });
});
