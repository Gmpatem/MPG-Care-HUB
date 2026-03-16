import { Suspense } from "react";
import LoginClient from "./login-client";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="surface-panel w-full max-w-md p-6 text-sm text-muted-foreground">
            Loading authentication...
          </div>
        </main>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
