import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"calc(100vh - 64px)", background:"var(--bg)"}} />}>
      <LoginForm />
    </Suspense>
  );
}