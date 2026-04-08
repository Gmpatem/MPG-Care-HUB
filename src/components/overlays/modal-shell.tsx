"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export type ModalShellProps = {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onOpenChange: (open: boolean) => void;
  /** Modal title - keep concise */
  title: string;
  /** Optional description below title */
  description?: string;
  /** Modal content */
  children: ReactNode;
  /** Footer content (typically actions) */
  footer?: ReactNode;
  /** Modal width size */
  size?: ModalSize;
  /** Prevent closing via overlay click or escape */
  preventClose?: boolean;
  /** Hide the default close button (X) */
  hideCloseButton?: boolean;
  className?: string;
};

const sizeClasses: Record<ModalSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  full: "sm:max-w-2xl",
};

/**
 * ModalShell - Unified dialog container for interruptive interactions
 *
 * Use for:
 * - Confirmations (small, focused)
 * - Quick edits (medium, form-based)
 * - Compact data entry (medium-large)
 * - "Are you sure?" decisions
 *
 * Not for:
 * - Detail peeks (use DetailPeekSheet)
 * - Long workflows (use full page)
 * - Mobile-first experiences (use Sheet)
 *
 * Example:
 * <ModalShell
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Confirm Discharge"
 *   description="This action will finalize the patient discharge."
 *   size="sm"
 *   footer={
 *     <>
 *       <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button onClick={handleConfirm}>Confirm Discharge</Button>
 *     </>
 *   }
 * >
 *   <DischargeSummary />
 * </ModalShell>
 */
export function ModalShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  preventClose = false,
  hideCloseButton = false,
  className,
}: ModalShellProps) {
  return (
    <Dialog open={open} onOpenChange={preventClose ? undefined : onOpenChange}>
      <DialogContent
        className={cn(sizeClasses[size], className)}
        showCloseButton={!hideCloseButton && !preventClose}
        onInteractOutside={(e) => {
          if (preventClose) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (preventClose) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="py-2">{children}</div>

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export type ConfirmationModalProps = Omit<
  ModalShellProps,
  "size" | "footer" | "children"
> & {
  /** What is being confirmed */
  children?: ReactNode;
  /** Primary confirm action */
  onConfirm: () => void;
  /** Confirm button text */
  confirmLabel?: string;
  /** Confirm button variant */
  confirmVariant?: "default" | "destructive";
  /** Cancel button text */
  cancelLabel?: string;
  /** Whether confirmation is pending */
  pending?: boolean;
  /** Disable confirm button */
  confirmDisabled?: boolean;
};

/**
 * ConfirmationModal - Standardized confirmation dialog
 *
 * Consistent treatment for consequential actions:
 * - Clear title stating the action
 * - Brief description of consequences
 * - Compact summary of what's being confirmed
 * - Clear confirm/cancel hierarchy
 * - Destructive actions use red styling
 *
 * Example:
 * <ConfirmationModal
 *   open={showConfirm}
 *   onOpenChange={setShowConfirm}
 *   title="Finalize Discharge?"
 *   description="This will release the bed and complete the admission."
 *   onConfirm={handleDischarge}
 *   confirmLabel="Finalize Discharge"
 *   confirmVariant="default"
 *   pending={pending}
 * >
 *   <DischargeSummary patient={patient} />
 * </ConfirmationModal>
 */
export function ConfirmationModal({
  onConfirm,
  confirmLabel = "Confirm",
  confirmVariant = "default",
  cancelLabel = "Cancel",
  pending = false,
  confirmDisabled = false,
  children,
  ...modalProps
}: ConfirmationModalProps) {
  return (
    <ModalShell
      {...modalProps}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={() => modalProps.onOpenChange(false)}
            disabled={pending}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending || confirmDisabled}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-primary-foreground ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              confirmVariant === "destructive"
                ? "bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                : "bg-primary hover:bg-primary/90"
            )}
          >
            {pending ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {confirmLabel}...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </>
      }
    >
      {children}
    </ModalShell>
  );
}

export type QuickEditModalProps = Omit<ModalShellProps, "size"> & {
  /** Primary save action - if not provided, assumes form submit */
  onSave?: () => void;
  /** Save button text */
  saveLabel?: string;
  /** Whether save is pending */
  pending?: boolean;
  /** Disable save button */
  saveDisabled?: boolean;
  /** Form id if using external form */
  formId?: string;
};

/**
 * QuickEditModal - Standardized quick edit dialog
 *
 * For compact edits that don't need a full page:
 * - Clear title stating what's being edited
 * - Form-based content with standard field spacing
 * - Save/Cancel action hierarchy
 * - Consistent with Pack G1 form patterns
 *
 * Example:
 * <QuickEditModal
 *   open={isEditing}
 *   onOpenChange={setIsEditing}
 *   title="Edit Department"
 *   description="Update department details."
 *   onSave={handleSave}
 *   pending={pending}
 * >
 *   <DepartmentFormFields department={department} />
 * </QuickEditModal>
 */
export function QuickEditModal({
  onSave,
  saveLabel = "Save Changes",
  pending = false,
  saveDisabled = false,
  formId,
  footer,
  ...modalProps
}: QuickEditModalProps) {
  const defaultFooter = (
    <>
      <button
        type="button"
        onClick={() => modalProps.onOpenChange(false)}
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        Cancel
      </button>
      {formId ? (
        <button
          type="submit"
          form={formId}
          disabled={pending || saveDisabled}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving...
            </>
          ) : (
            saveLabel
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onSave}
          disabled={pending || saveDisabled}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving...
            </>
          ) : (
            saveLabel
          )}
        </button>
      )}
    </>
  );

  return (
    <ModalShell {...modalProps} size="md" footer={footer ?? defaultFooter} />
  );
}
