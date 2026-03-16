import { Suspense } from "react";
import LoginClient from "./login-client";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md rounded-xl border p-6 text-sm text-muted-foreground">
            Loading authentication...
          </div>
        </main>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
