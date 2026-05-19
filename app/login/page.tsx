"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { loginSchema, LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";

  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError("");
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      setServerError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back</h1>
          <p className="text-[var(--text-muted)] text-sm mt-2">
            Sign in to your CampusMart account
          </p>
        </div>

        {justRegistered && (
          <div className="p-3 rounded bg-[rgba(0,229,160,0.1)] border border-[rgba(0,229,160,0.2)] text-[var(--green)] text-sm flex items-center gap-2 mb-6">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Account created! Please sign in.
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-[var(--bg-card)] border border-[var(--border-muted)] rounded p-6 flex flex-col gap-4"
        >
          {serverError && (
            <div className="p-3 rounded bg-[rgba(255,77,109,0.1)] border border-[rgba(255,77,109,0.2)] text-[var(--red)] text-sm">
              {serverError}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            icon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPass ? "text" : "password"}
              placeholder="Your password"
              icon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-[34px] text-[var(--text-subtle)] hover:text-[var(--text-muted)]"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button type="submit" loading={isSubmitting} className="mt-2 w-full" size="lg">
            Sign In <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-[var(--accent)] hover:underline font-medium">
            Create one
          </Link>
        </p>

        {/* Demo credentials */}
        <div className="mt-4 p-3 rounded bg-[var(--bg-card)] border border-[var(--border-muted)] text-xs text-[var(--text-subtle)]">
          <p className="font-medium text-[var(--text-muted)] mb-1">Demo credentials (after seeding):</p>
          <p>Buyer: buyer@campusmart.ng / password123</p>
          <p>Vendor: vendor@campusmart.ng / password123</p>
        </div>
      </div>
    </div>
  );
}
