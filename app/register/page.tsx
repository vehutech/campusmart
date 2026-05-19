"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ArrowRight, User, Mail, Lock, Phone, Hash } from "lucide-react";
import { registerSchema, RegisterInput } from "@/lib/validations";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as "BUYER" | "VENDOR") || "BUYER";
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole },
  });

  const role = watch("role");

  const onSubmit = async (data: RegisterInput) => {
    setServerError("");
    const res = await fetch("/api/register", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) { setServerError(json.error || "Registration failed"); return; }
    router.push("/login?registered=true");
  };

  return (
    <>
      <style>{`
        .auth-page   { min-height: calc(100vh - 64px); display: flex; align-items: center;
                       justify-content: center; padding: 48px 24px; background: var(--bg); }
        .auth-card   { width: 100%; max-width: 460px; }
        .auth-header { text-align: center; margin-bottom: 28px; }
        .auth-header h1 { font-size: 1.75rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
        .auth-header p  { font-size: 14px; color: var(--text-muted); margin-top: 6px; }

        .role-toggle { display: flex; background: var(--bg-elevated); border: 1px solid var(--border);
                       border-radius: 12px; padding: 4px; margin-bottom: 20px; }
        .role-btn    { flex: 1; padding: 9px; border: none; background: none; border-radius: 9px;
                       font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit;
                       color: var(--text-muted); }
        .role-btn.active { background: var(--accent); color: #0a0f1e;
                           box-shadow: 0 0 14px rgba(0,212,255,0.3); }

        .auth-form   { background: var(--bg-card); border: 1px solid var(--border-muted);
                       border-radius: 16px; padding: 28px; display: flex; flex-direction: column; gap: 16px; }

        .field       { display: flex; flex-direction: column; gap: 6px; }
        .field label { font-size: 13px; font-weight: 500; color: var(--text-muted); }
        .input-wrap  { position: relative; }
        .input-icon  { position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
                       color: var(--text-subtle); pointer-events: none; }
        .field input { width: 100%; background: var(--bg-elevated); border: 1px solid var(--border);
                       border-radius: 10px; padding: 11px 14px 11px 38px; font-size: 14px;
                       color: var(--text); outline: none; transition: border-color 0.15s; font-family: inherit; }
        .field input::placeholder { color: var(--text-subtle); }
        .field input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0,212,255,0.1); }
        .field input.has-error { border-color: var(--red); }
        .field-error { font-size: 12px; color: var(--red); }
        .pass-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
                       background: none; border: none; cursor: pointer; color: var(--text-subtle);
                       padding: 2px; display: flex; }
        .pass-toggle:hover { color: var(--text-muted); }

        .alert-error { padding: 12px 14px; border-radius: 10px; font-size: 13px;
                       background: rgba(255,77,109,0.08); border: 1px solid rgba(255,77,109,0.2); color: var(--red); }

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
      `}</style>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join the FULokoja campus marketplace</p>
          </div>

          <div className="role-toggle">
            <button type="button" className={`role-btn ${role === "BUYER" ? "active" : ""}`}
              onClick={() => setValue("role", "BUYER")}>
              I want to Buy
            </button>
            <button type="button" className={`role-btn ${role === "VENDOR" ? "active" : ""}`}
              onClick={() => setValue("role", "VENDOR")}>
              I want to Sell
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
            {serverError && <div className="alert-error">{serverError}</div>}

            {[
              { name: "name",            label: "Full Name",              type: "text",     icon: User,  placeholder: "e.g. Amina Ibrahim" },
              { name: "email",           label: "Email Address",          type: "email",    icon: Mail,  placeholder: "your@email.com" },
              { name: "matricNo",        label: "Matric Number (optional)",type: "text",    icon: Hash,  placeholder: "FUL/2021/0001" },
              { name: "phone",           label: "Phone Number (optional)", type: "text",    icon: Phone, placeholder: "+234 800 000 0000" },
            ].map(({ name, label, type, icon: Icon, placeholder }) => (
              <div className="field" key={name}>
                <label>{label}</label>
                <div className="input-wrap">
                  <Icon size={15} className="input-icon" />
                  <input type={type} placeholder={placeholder}
                    className={(errors as any)[name] ? "has-error" : ""}
                    {...register(name as any)} />
                </div>
                {(errors as any)[name] && <span className="field-error">{(errors as any)[name].message}</span>}
              </div>
            ))}

            <div className="field">
              <label>Password</label>
              <div className="input-wrap">
                <Lock size={15} className="input-icon" />
                <input type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                  className={errors.password ? "has-error" : ""}
                  {...register("password")} />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password.message}</span>}
            </div>

            <div className="field">
              <label>Confirm Password</label>
              <div className="input-wrap">
                <Lock size={15} className="input-icon" />
                <input type="password" placeholder="Repeat your password"
                  className={errors.confirmPassword ? "has-error" : ""}
                  {...register("confirmPassword")} />
              </div>
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword.message}</span>}
            </div>

            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? <span className="spinner" /> : null}
              Create {role === "VENDOR" ? "Vendor " : ""}Account <ArrowRight size={16} />
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}