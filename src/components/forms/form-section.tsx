import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * FormSection - Standardized titled field group for forms
 * 
 * Use for:
 * - Grouping related fields under a clear heading
 * - Separating primary from secondary information
 * - Creating visual hierarchy in complex forms
 * 
 * Example:
 * <FormSection title="Patient Identity" description="Required patient information">
 *   <FormGrid>...</FormGrid>
 * </FormSection>
 */
export type FormSectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Visual separation style */
  variant?: "default" | "bordered" | "subtle";
};

export function FormSection({
  title,
  description,
  children,
  className,
  variant = "default",
}: FormSectionProps) {
  const variantStyles = {
    default: "",
    bordered: "rounded-xl border p-4 sm:p-5",
    subtle: "rounded-lg bg-muted/30 p-4",
  };

  return (
    <section className={cn("space-y-4", variantStyles[variant], className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/**
 * FormGrid - Responsive grid layout for form fields
 * 
 * Automatically handles:
 * - Single column on mobile
 * - Two columns on tablet/desktop
 * - Optional three-column layout
 * - Consistent gap spacing
 * 
 * Example:
 * <FormGrid>
 *   <input name="first_name" />
 *   <input name="last_name" />
 * </FormGrid>
 */
export type FormGridProps = {
  children: ReactNode;
  className?: string;
  /** Number of columns on desktop */
  cols?: 1 | 2 | 3 | 4;
  /** Tighter spacing for dense forms */
  dense?: boolean;
};

export function FormGrid({
  children,
  className,
  cols = 2,
  dense = false,
}: FormGridProps) {
  const colStyles = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid",
        colStyles[cols],
        dense ? "gap-3" : "gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * FormField - Standardized label + input wrapper
 * 
 * Provides consistent:
 * - Label styling
 * - Required/optional indicator
 * - Helper text placement
 * - Error message placement
 * 
 * Example:
 * <FormField label="First Name" name="first_name" required>
 *   <Input name="first_name" />
 * </FormField>
 */
export type FormFieldProps = {
  label: string;
  name: string;
  children: ReactNode;
  className?: string;
  /** Show required indicator */
  required?: boolean;
  /** Show optional indicator */
  optional?: boolean;
  /** Helper text below label */
  helper?: string;
  /** Error message */
  error?: string;
};

export function FormField({
  label,
  name,
  children,
  className,
  required = false,
  optional = false,
  helper,
  error,
}: FormFieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <label htmlFor={name} className="flex items-center gap-1.5 text-sm font-medium">
        {label}
        {required && (
          <span className="text-red-500" aria-label="required">
            *
          </span>
        )}
        {optional && !required && (
          <span className="text-xs font-normal text-muted-foreground">(optional)</span>
        )}
      </label>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      {children}
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * FormActionsBar - Standardized submit/cancel action area
 * 
 * Provides consistent:
 * - Primary submit button placement
 * - Secondary/cancel action placement
 * - Visual separation from form fields
 * - Responsive behavior
 * 
 * Example:
 * <FormActionsBar>
 *   <SubmitButton>Save Patient</SubmitButton>
 *   <Button variant="outline" onClick={onCancel}>Cancel</Button>
 * </FormActionsBar>
 */
export type FormActionsBarProps = {
  children: ReactNode;
  className?: string;
  /** Align actions to the right (default) or left */
  align?: "left" | "right" | "center";
  /** Add top border for visual separation */
  bordered?: boolean;
  /** Make actions stick to bottom on mobile */
  sticky?: boolean;
};

export function FormActionsBar({
  children,
  className,
  align = "left",
  bordered = false,
}: FormActionsBarProps) {
  const alignStyles = {
    left: "justify-start",
    right: "justify-end",
    center: "justify-center",
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 pt-4",
        alignStyles[align],
        bordered && "border-t",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * FormFeedback - Standardized form-level feedback display
 * 
 * Use for:
 * - Success messages after submission
 * - Form-level error messages
 * - Warning/info messages that affect the whole form
 * 
 * Example:
 * <FormFeedback type="success" message="Patient registered successfully" />
 * <FormFeedback type="error" message={state.error} />
 */
export type FormFeedbackProps = {
  type: "success" | "error" | "warning" | "info";
  message: string;
  className?: string;
};

export function FormFeedback({
  type,
  message,
  className,
}: FormFeedbackProps) {
  const styles = {
    success:
      "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
    error:
      "border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",
    warning:
      "border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
    info:
      "border border-border bg-muted/40 text-muted-foreground",
  };

  return (
    <div className={cn("rounded-lg px-3 py-2.5 text-sm", styles[type], className)}>
      {message}
    </div>
  );
}
