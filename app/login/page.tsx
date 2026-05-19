"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { loginSchema, LoginInput } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError("");
    const res = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    if (res?.error) { setServerError("Invalid email or password"); return; }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <>
      <style>{`
        .auth-page   { min-height: calc(100vh - 64px); display: flex; align-items: center;
                       justify-content: center; padding: 48px 24px; background: var(--bg); }
        .auth-card   { width: 100%; max-width: 420px; }
        .auth-header { text-align: center; margin-bottom: 32px; }
        .auth-header h1 { font-size: 1.75rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
        .auth-header p  { font-size: 14px; color: var(--text-muted); margin-top: 6px; }

        .auth-form   { background: var(--bg-card); border: 1px solid var(--border-muted);
                       border-radius: 16px; padding: 28px; display: flex; flex-direction: column; gap: 18px; }

        .field       { display: flex; flex-direction: column; gap: 6px; }
        .field label { font-size: 13px; font-weight: 500; color: var(--text-muted); }
        .input-wrap  { position: relative; }
        .input-icon  { position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
                       color: var(--text-subtle); pointer-events: none; }
        .field input { width: 100%; background: var(--bg-elevated); border: 1px solid var(--border);
                       border-radius: 10px; padding: 11px 14px 11px 38px; font-size: 14px;
                       color: var(--text); outline: none; transition: border-color 0.15s; font-family: inherit; }
        .field input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0,212,255,0.1); }
        .field input.error { border-color: var(--red); }
        .field-error { font-size: 12px; color: var(--red); }
        .pass-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
                       background: none; border: none; cursor: pointer; color: var(--text-subtle);
                       padding: 2px; display: flex; }
        .pass-toggle:hover { color: var(--text-muted); }

        .alert       { padding: 12px 14px; border-radius: 10px; font-size: 13px;
                       display: flex; align-items: center; gap: 8px; }
        .alert-error { background: rgba(255,77,109,0.08); border: 1px solid rgba(255,77,109,0.2); color: var(--red); }
        .alert-success { background: rgba(0,229,160,0.08); border: 1px solid rgba(0,229,160,0.2); color: var(--green); }

        .btn-submit  { width: 100%; padding: 13px; border-radius: 10px; border: none; cursor: pointer;
                       background: var(--accent); color: #0a0f1e; font-size: 15px; font-weight: 700;
                       display: flex; align-items: center; justify-content: center; gap: 8px;
                       box-shadow: 0 0 20px rgba(0,212,255,0.25); transition: opacity 0.15s; font-family: inherit; }
        .btn-submit:hover { opacity: 0.88; }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .spinner     { width: 16px; height: 16px; border: 2px solid currentColor;
                       border-top-color: transparent; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-footer { text-align: center; margin-top: 20px; font-size: 14px; color: var(--text-muted); }
        .auth-footer a { color: var(--accent); text-decoration: none; font-weight: 500; }
        .auth-footer a:hover { text-decoration: underline; }

        .demo-box    { margin-top: 12px; padding: 12px 14px; background: var(--bg-card);
                       border: 1px solid var(--border-muted); border-radius: 10px; font-size: 12px; color: var(--text-subtle); }
        .demo-box strong { color: var(--text-muted); display: block; margin-bottom: 4px; }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your CampusMart account</p>
          </div>

          {justRegistered && (
            <div className="alert alert-success" style={{marginBottom: 16}}>
              <CheckCircle size={15} /> Account created! Please sign in.
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
            {serverError && <div className="alert alert-error">{serverError}</div>}

            <div className="field">
              <label>Email Address</label>
              <div className="input-wrap">
                <Mail size={15} className="input-icon" />
                <input type="email" placeholder="your@email.com"
                  className={errors.email ? "error" : ""}
                  {...register("email")} />
              </div>
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </div>

            <div className="field">
              <label>Password</label>
              <div className="input-wrap">
                <Lock size={15} className="input-icon" />
                <input type={showPass ? "text" : "password"} placeholder="Your password"
                  className={errors.password ? "error" : ""}
                  {...register("password")} />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password.message}</span>}
            </div>

            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? <span className="spinner" /> : null}
              Sign In <ArrowRight size={16} />
            </button>
          </form>

          <p className="auth-footer">
            Don&apos;t have an account? <Link href="/register">Create one</Link>
          </p>

          <div className="demo-box">
            <strong>Demo credentials (after seeding):</strong>
            Buyer: buyer@campusmart.ng / password123<br />
            Vendor: vendor@campusmart.ng / password123
          </div>
        </div>
      </div>
    </>
  );
}