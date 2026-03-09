type FormMessageProps = {
  type?: "info" | "success" | "error";
  message: string;
};

export function FormMessage({
  type = "info",
  message,
}: FormMessageProps) {
  const styles = {
    info: "border bg-muted/30 text-muted-foreground",
    success: "border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300",
    error: "border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",
  };

  return (
    <div className={`rounded-lg p-3 text-sm ${styles[type]}`}>
      {message}
    </div>
  );
}
