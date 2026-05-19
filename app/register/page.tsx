import { Suspense } from "react";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"calc(100vh - 64px)", background:"var(--bg)"}} />}>
      <RegisterForm />
    </Suspense>
  );
}