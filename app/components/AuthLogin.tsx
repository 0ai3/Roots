"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  checkEmailAction,
  loginAction,
  registerAction,
} from "../actions/auth";
import { setStoredProfileId } from "../lib/profileId";

type Stage = "email" | "login" | "register" | "success";

export default function AuthLogin() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage("Please enter your email.");
      return;
    }

    setErrorMessage("");
    setStatusMessage("");

    startTransition(() => {
      checkEmailAction(normalizedEmail)
        .then((result) => {
          setStage(result.exists ? "login" : "register");
          setPassword("");
          setStatusMessage(
            result.exists
              ? "Welcome back! Enter your password to continue."
              : "We couldn't find that email. Create a password to register."
          );
        })
        .catch(() => {
          setErrorMessage("Unable to reach the server. Please try again.");
        });
    });
  };

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }

    setErrorMessage("");

    const action = stage === "login" ? loginAction : registerAction;

    startTransition(() => {
      action(normalizedEmail, password)
        .then((result) => {
          if (result.ok) {
            setStoredProfileId(result.userId ?? null);
            setStage("success");
            setStatusMessage(result.message);
            setPassword("");
            router.push("/app/dashboard");
          } else {
            setErrorMessage(result.message);
          }
        })
        .catch(() => {
          setErrorMessage("Something went wrong. Please try again.");
        });
    });
  };

  const resetFlow = () => {
    setStage("email");
    setPassword("");
    setStatusMessage("");
    setErrorMessage("");
  };

  const titleByStage: Record<Stage, string> = {
    email: "Welcome to Roots",
    login: "Login",
    register: "Create an account",
    success: "All set!",
  };

  const descriptionByStage: Record<Stage, string> = {
    email: "Enter your email to continue.",
    login: "We found your account. Please enter your password.",
    register: "Let's create your account with a secure password.",
    success: "You're authenticated. You can now continue to the app.",
  };

  const isPasswordStage = stage === "login" || stage === "register";

  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">{titleByStage[stage]}</h1>
          <p className="text-sm text-white/70">{descriptionByStage[stage]}</p>
        </div>

        {errorMessage && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {errorMessage}
          </p>
        )}

        {statusMessage && !errorMessage && (
          <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {statusMessage}
          </p>
        )}

        {stage === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <label className="block space-y-1 text-sm font-medium text-white/80">
              <span>Email</span>
              <input
                type="email"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-base text-white placeholder:text-white/50 focus:border-emerald-400 focus:outline-none"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isPending}
                required
              />
            </label>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-emerald-500 py-2 text-center text-base font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Checking..." : "Continue"}
            </button>
          </form>
        )}

        {isPasswordStage && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <p className="text-sm text-white/70">
              Signing in as <span className="font-semibold">{email}</span>
            </p>

            <label className="block space-y-1 text-sm font-medium text-white/80">
              <span>Password</span>
              <input
                type="password"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-base text-white placeholder:text-white/50 focus:border-emerald-400 focus:outline-none"
                placeholder="Enter a secure password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isPending}
                required
              />
            </label>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-emerald-500 py-2 text-center text-base font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending
                ? "Please wait..."
                : stage === "login"
                  ? "Login"
                  : "Register"}
            </button>
          </form>
        )}

        {stage === "success" && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-white/80">
              {statusMessage || "Authentication complete."}
            </p>
            <button
              type="button"
              className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm font-medium text-white transition hover:border-white/50"
              onClick={resetFlow}
            >
              Use a different email
            </button>
          </div>
        )}

        {stage !== "email" && stage !== "success" && (
          <button
            type="button"
            onClick={resetFlow}
            className="text-sm text-white/70 underline-offset-4 hover:underline"
            disabled={isPending}
          >
            Use a different email
          </button>
        )}
      </div>
    </section>
  );
}
