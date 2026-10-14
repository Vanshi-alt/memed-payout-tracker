
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

type AuthResponse = {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "brand" | "creator";
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setLoading(true);

    try {
      const result = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      localStorage.setItem("meme_token", result.token);
      localStorage.setItem("meme_user", JSON.stringify(result.user));

      if (result.user.role === "brand") {
        router.push("/brand/dashboard");
      } else {
        router.push("/creator/dashboard");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to log in. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f3f0e7] text-[#191a16] md:grid-cols-2">
      <section className="flex flex-col justify-between border-b-2 border-[#191a16] p-6 md:border-b-0 md:border-r-2 md:p-12">
        <Link href="/" className="text-2xl font-black tracking-tighter">
          meme’d<span className="text-[#a0c900]">®</span>
        </Link>

        <div className="py-12">
          <p className="text-xs font-black uppercase tracking-[0.2em]">
            YOUR NEXT CHAPTER STARTS HERE
          </p>

          <h1 className="mt-8 text-6xl font-black uppercase leading-[0.9] tracking-[-0.07em] md:text-7xl">
            The work
            <br />
            is yours.
            <br />
            <span className="text-[#8cae00]">Own it.</span>
          </h1>

          <p className="mt-6 max-w-sm leading-7 text-[#62635b]">
            Your campaigns, your content, your numbers.
            Everything starts with one sign in.
          </p>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-[#77786d]">
          CAMPAIGNS WITH RECEIPTS. ↗
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-14 md:px-12">
        <div className="w-full max-w-md">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#77786d]">
            MEMBER ACCESS / 001
          </p>

          <h2 className="mt-5 text-4xl font-black uppercase tracking-tight">
            Welcome back.
          </h2>

          <p className="mt-3 text-sm text-[#62635b]">
            Sign in to continue to your campaign desk.
          </p>

          <form onSubmit={handleLogin} className="mt-10 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-black uppercase tracking-widest"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                className="w-full border-2 border-[#191a16]/20 bg-transparent px-4 py-4 outline-none transition placeholder:text-[#99998f] focus:border-[#191a16]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-black uppercase tracking-widest"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                className="w-full border-2 border-[#191a16]/20 bg-transparent px-4 py-4 outline-none transition placeholder:text-[#99998f] focus:border-[#191a16]"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-between bg-[#a0c900] px-5 py-4 font-black transition hover:bg-[#191a16] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "SIGNING IN..." : "SIGN IN"}
              <span>↗</span>
            </button>
          </form>

          <p className="mt-8 text-sm text-[#62635b]">
            New around here?{" "}
            <Link
              href="/signup"
              className="font-black text-[#191a16] underline underline-offset-4"
            >
              Create an account
            </Link>
          </p>

          <Link
            href="/"
            className="mt-8 inline-block text-xs font-bold uppercase tracking-widest text-[#77786d]"
          >
            ← Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
