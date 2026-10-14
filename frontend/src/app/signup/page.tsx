
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import type { FormEvent } from "react";

export default function SignupPage() {
  const [role, setRole] = useState<"brand" | "creator">("creator");

  
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

// Inside your SignupPage component:
const router = useRouter();
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

async function handleSignup(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setError("");

  const formData = new FormData(event.currentTarget);

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  setLoading(true);

  try {
    const result = await apiRequest<AuthResponse>("/auth/signup", {
      method: "POST",
      body: { name, email, password, role },
    });

    localStorage.setItem("meme_token", result.token);
    localStorage.setItem("meme_user", JSON.stringify(result.user));

    router.push(
      result.user.role === "brand"
        ? "/brand/dashboard"
        : "/creator/dashboard"
    );
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Something went wrong."
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="grid min-h-screen bg-[#f3f0e7] text-[#191a16] md:grid-cols-2">
      <section className="flex flex-col justify-between border-b-2 border-[#191a16] p-6 md:border-b-0 md:border-r-2 md:p-12">
        <a href="/" className="text-2xl font-black tracking-tighter">
          meme’d<span className="text-[#a0c900]">®</span>
        </a>

        <div className="py-12">
          <p className="text-xs font-black uppercase tracking-[0.2em]">
            YOUR ACCOUNT. YOUR RULES.
          </p>

          <h1 className="mt-8 text-6xl font-black uppercase leading-[0.9] tracking-[-0.07em] md:text-7xl">
            Make moves.
            <br />
            <span className="text-[#8cae00]">Get paid.</span>
          </h1>

          <p className="mt-6 max-w-sm leading-7 text-[#62635b]">
            Whether you build campaigns or create content,
            there’s a place for you at Meme’d.
          </p>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-[#77786d]">
          CAMPAIGNS WITH RECEIPTS. ↗
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-14 md:px-12">
        <div className="w-full max-w-md">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#77786d]">
            NEW MEMBER ACCESS / 002
          </p>

          <h2 className="mt-5 text-4xl font-black uppercase tracking-tight">
            Join the desk.
          </h2>

          <p className="mt-3 text-sm text-[#62635b]">
            First, tell us what brings you here.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("creator")}
              aria-pressed={role === "creator"}
              className={`border-2 p-4 text-left transition ${
                role === "creator"
                  ? "border-[#191a16] bg-[#a0c900]"
                  : "border-[#191a16]/20 hover:border-[#191a16]"
              }`}
            >
              <span className="text-2xl">✳</span>
              <span className="mt-4 block font-black uppercase">
                Creator
              </span>
              <span className="mt-1 block text-xs">
                I make content.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole("brand")}
              aria-pressed={role === "brand"}
              className={`border-2 p-4 text-left transition ${
                role === "brand"
                  ? "border-[#191a16] bg-[#a0c900]"
                  : "border-[#191a16]/20 hover:border-[#191a16]"
              }`}
            >
              <span className="text-2xl">↗</span>
              <span className="mt-4 block font-black uppercase">
                Brand
              </span>
              <span className="mt-1 block text-xs">
                I run campaigns.
              </span>
            </button>
          </div>

          <form className="mt-8 space-y-5"  onSubmit={handleSignup}>
            <input type="hidden" name="role" value={role} />

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-xs font-black uppercase tracking-widest"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                required
                className="w-full border-2 border-[#191a16]/20 bg-transparent px-4 py-3.5 outline-none transition placeholder:text-[#99998f] focus:border-[#191a16]"
              />
            </div>

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
                className="w-full border-2 border-[#191a16]/20 bg-transparent px-4 py-3.5 outline-none transition placeholder:text-[#99998f] focus:border-[#191a16]"
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
                autoComplete="new-password"
                minLength={8}
                placeholder="At least 8 characters"
                required
                className="w-full border-2 border-[#191a16]/20 bg-transparent px-4 py-3.5 outline-none transition placeholder:text-[#99998f] focus:border-[#191a16]"
              />
            </div>

            {error && (
  <p role="alert" className="text-sm text-red-600">
    {error}
  </p>
)}

            <button disabled={loading}
              type="submit"
              className="flex w-full items-center justify-between bg-[#a0c900] px-5 py-4 font-black transition hover:bg-[#191a16] hover:text-white"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-7 text-sm text-[#62635b]">
            Already a member?{" "}
            <a
              href="/login"
              className="font-black text-[#191a16] underline underline-offset-4"
            >
              Sign in
            </a>
          </p>

          <a
            href="/"
            className="mt-7 inline-block text-xs font-bold uppercase tracking-widest text-[#77786d]"
          >
            ← Back to home
          </a>
        </div>
      </section>
    </main>
  );
}
