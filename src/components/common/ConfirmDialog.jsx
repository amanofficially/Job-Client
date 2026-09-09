import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AlertTriangle, HelpCircle } from "lucide-react";

const ConfirmDialog = ({
  open,
  onOpenChange,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  loading = false,
}) => {
  const isDanger = variant === "danger";
  const Icon = isDanger ? AlertTriangle : HelpCircle;

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] z-50 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <AlertDialog.Content
          className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm card p-5 sm:p-6 focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isDanger ? "bg-danger-light text-danger" : "bg-primary-light text-primary-dark"
              }`}
            >
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <AlertDialog.Title className="font-display font-semibold text-base">{title}</AlertDialog.Title>
              {description && (
                <AlertDialog.Description className="text-sm text-muted mt-1">{description}</AlertDialog.Description>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <AlertDialog.Cancel asChild>
              <button className="btn-secondary text-sm" disabled={loading}>
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>
            <button
              className={isDanger ? "btn-danger text-sm" : "btn-primary text-sm"}
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
            >
              {loading ? "Working..." : confirmLabel}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default ConfirmDialog;
