"use client";

import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

export type DrawerShellProps = {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when drawer should close */
  onOpenChange: (open: boolean) => void;
  /** Drawer title - keep concise */
  title: string;
  /** Optional description below title */
  description?: string;
  /** Drawer content */
  children: ReactNode;
  /** Footer content (typically actions) */
  footer?: ReactNode;
  /** Drawer width size */
  size?: DrawerSize;
  /** Which side the drawer opens from */
  side?: "left" | "right";
  /** Prevent closing via overlay click or escape */
  preventClose?: boolean;
  /** Hide the default close button (X) */
  hideCloseButton?: boolean;
  className?: string;
};

const sizeClasses: Record<DrawerSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  full: "sm:max-w-2xl",
};

/**
 * DrawerShell - Unified sheet container for contextual overlays
 *
 * Use for:
 * - Detail peeks (preview without full navigation)
 * - Secondary flows that need more space than a dialog
 * - Mobile-friendly edit/review flows
 * - Contextual workspace-side actions
 * - Selection dialogs with many options
 *
 * Not for:
 * - Simple confirmations (use ModalShell/ConfirmationModal)
 * - Dense workflows (use full page)
 * - Actions that need center-screen focus (use ModalShell)
 *
 * Example:
 * <DrawerShell
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Patient Details"
 *   description="Quick preview of patient information"
 *   size="md"
 *   footer={
 *     <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
 *   }
 * >
 *   <PatientSummary patient={patient} />
 * </DrawerShell>
 */
export function DrawerShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  side = "right",
  preventClose = false,
  hideCloseButton = false,
  className,
}: DrawerShellProps) {
  return (
    <Sheet open={open} onOpenChange={preventClose ? undefined : onOpenChange}>
      <SheetContent
        side={side}
        className={cn(sizeClasses[size], "flex flex-col", className)}
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
        <SheetHeader className="shrink-0">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">{children}</div>

        {footer && <SheetFooter className="shrink-0">{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}

export type DetailPeekSheetProps = Omit<
  DrawerShellProps,
  "size"
> & {
  /** Optional link to full page view */
  fullPageHref?: string;
  /** Close button label */
  closeLabel?: string;
};

/**
 * DetailPeekSheet - Calmer overlay for previewing details
 *
 * Distinct from confirmations and edits:
 * - Calmer, less dramatic presentation
 * - "Close" is the primary action
 * - Optional "Open full page" for deeper navigation
 * - Appropriate for read-only peeks
 *
 * Use for:
 * - Patient quick previews
 * - Order/invoice summaries
 * - History/event details
 * - Reference information
 *
 * Example:
 * <DetailPeekSheet
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Lab Order #1234"
 *   description="Ordered 2 hours ago"
 *   fullPageHref={`/h/${hospitalSlug}/lab/orders/${orderId}`}
 * >
 *   <LabOrderSummary order={order} />
 * </DetailPeekSheet>
 */
export function DetailPeekSheet({
  fullPageHref,
  closeLabel = "Close",
  footer,
  ...drawerProps
}: DetailPeekSheetProps) {
  const defaultFooter = (
    <div className="flex w-full items-center gap-3">
      {fullPageHref ? (
        <a
          href={fullPageHref}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Open Full Page
        </a>
      ) : null}
      <button
        type="button"
        onClick={() => drawerProps.onOpenChange(false)}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          fullPageHref ? "flex-1" : "w-full"
        )}
      >
        {closeLabel}
      </button>
    </div>
  );

  return (
    <DrawerShell
      {...drawerProps}
      size="md"
      footer={footer ?? defaultFooter}
    />
  );
}

export type SelectionSheetProps = Omit<DrawerShellProps, "size"> & {
  /** Primary select action */
  onSelect: () => void;
  /** Select button text */
  selectLabel?: string;
  /** Whether selection is pending */
  pending?: boolean;
  /** Disable select button */
  selectDisabled?: boolean;
  /** Cancel/close button text */
  cancelLabel?: string;
};

/**
 * SelectionSheet - Standardized selection from a list
 *
 * For choosing items from a larger set:
 * - Search/filter at top (optional)
 * - Scrollable list in middle
 * - Select/Cancel at bottom
 * - Mobile-optimized
 *
 * Example:
 * <SelectionSheet
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Select Ward"
 *   onSelect={handleSelect}
 *   selectLabel="Assign to Ward"
 * >
 *   <WardList wards={wards} selectedId={selectedId} onSelect={setSelectedId} />
 * </SelectionSheet>
 */
export function SelectionSheet({
  onSelect,
  selectLabel = "Select",
  pending = false,
  selectDisabled = false,
  cancelLabel = "Cancel",
  footer,
  ...drawerProps
}: SelectionSheetProps) {
  const defaultFooter = (
    <>
      <button
        type="button"
        onClick={() => drawerProps.onOpenChange(false)}
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onSelect}
        disabled={pending || selectDisabled}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {selectLabel}...
          </>
        ) : (
          selectLabel
        )}
      </button>
    </>
  );

  return (
    <DrawerShell {...drawerProps} size="md" footer={footer ?? defaultFooter} />
  );
}

export type SecondaryFlowSheetProps = Omit<DrawerShellProps, "size"> & {
  /** Primary action - typically "Save" or "Continue" */
  onAction?: () => void;
  /** Action button text */
  actionLabel?: string;
  /** Whether action is pending */
  pending?: boolean;
  /** Disable action button */
  actionDisabled?: boolean;
  /** Cancel/close button text */
  cancelLabel?: string;
  /** Show back button instead of cancel */
  showBack?: boolean;
  /** Back button action */
  onBack?: () => void;
};

/**
 * SecondaryFlowSheet - Multi-step or extended secondary flows
 *
 * For workflows that need more space but shouldn't be full pages:
 * - Form-based flows with multiple fields
 * - Step-by-step wizards (compact)
 * - Data entry that benefits from page context
 * - Actions that need vertical space
 *
 * Example:
 * <SecondaryFlowSheet
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Record Vitals"
 *   actionLabel="Save Vitals"
 *   onAction={handleSave}
 *   pending={pending}
 * >
 *   <VitalsForm />
 * </SecondaryFlowSheet>
 */
export function SecondaryFlowSheet({
  onAction,
  actionLabel = "Save",
  pending = false,
  actionDisabled = false,
  cancelLabel = "Cancel",
  showBack = false,
  onBack,
  footer,
  ...drawerProps
}: SecondaryFlowSheetProps) {
  const defaultFooter = (
    <>
      <button
        type="button"
        onClick={showBack && onBack ? onBack : () => drawerProps.onOpenChange(false)}
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {showBack ? "Back" : cancelLabel}
      </button>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          disabled={pending || actionDisabled}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {actionLabel}...
            </>
          ) : (
            actionLabel
          )}
        </button>
      )}
    </>
  );

  return (
    <DrawerShell {...drawerProps} size="lg" footer={footer ?? defaultFooter} />
  );
}
