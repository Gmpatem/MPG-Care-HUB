import Link from "next/link";
import { Button } from "@/components/ui/button";

export function OpenAdmissionActivityButton({
  hospitalSlug,
  admissionId,
  variant = "outline",
  size = "sm",
}: {
  hospitalSlug: string;
  admissionId: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}) {
  return (
    <Button asChild variant={variant} size={size}>
      <Link href={`/h/${hospitalSlug}/ward/admissions/${admissionId}/activity`}>
        Open Activity
      </Link>
    </Button>
  );
}