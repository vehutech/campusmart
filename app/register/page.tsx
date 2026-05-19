"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ArrowRight, User, Mail, Lock, Phone, Hash } from "lucide-react";
import { registerSchema, RegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as "BUYER" | "VENDOR") || "BUYER";

  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole },
  });

  const role = watch("role");

  const onSubmit = async (data: RegisterInput) => {
    setServerError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error || "Registration failed");
      return;
    }
    router.push("/login?registered=true");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Create Account</h1>
          <p className="text-[var(--text-muted)] text-sm mt-2">
            Join the FULokoja campus marketplace
          </p>
        </div>

        {/* Role toggle */}
        <div className="flex rounded bg-[var(--bg-elevated)] border border-[var(--border)] p-1 mb-6">
          {(["BUYER", "VENDOR"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setValue("role", r)}
              className={`flex-1 py-2 text-sm font-semibold rounded-sm transition-all duration-200 ${
                role === r
                  ? "bg-[var(--accent)] text-[var(--bg)] shadow-[0_0_15px_var(--accent-glow)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {r === "BUYER" ? "I want to Buy" : "I want to Sell"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-[var(--bg-card)] border border-[var(--border-muted)] rounded p-6 flex flex-col gap-4">
          {serverError && (
            <div className="p-3 rounded bg-[rgba(255,77,109,0.1)] border border-[rgba(255,77,109,0.2)] text-[var(--red)] text-sm">
              {serverError}
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="e.g. Amina Ibrahim"
            icon={<User className="w-4 h-4" />}
            error={errors.name?.message}
            {...register("name")}
          />

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
              placeholder="Min. 6 characters"
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

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat your password"
            icon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Input
            label="Matric Number (optional)"
            placeholder="e.g. FUL/2021/0001"
            icon={<Hash className="w-4 h-4" />}
            {...register("matricNo")}
          />

          <Input
            label="Phone Number (optional)"
            placeholder="+234 800 000 0000"
            icon={<Phone className="w-4 h-4" />}
            {...register("phone")}
          />

          <Button type="submit" loading={isSubmitting} className="mt-2 w-full" size="lg">
            Create {role === "VENDOR" ? "Vendor" : ""} Account <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
