
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

type CampaignResponse = {
  success: boolean;
  message: string;
  campaign: {
    id: string;
    name: string;
    platform: "Instagram" | "YouTube";
    budget: number;
    spent: number;
    remaining: number;
    milestones: { views: number; payout: number }[];
    isLive: boolean;
  };
};

type Milestone = {
  views: string;
  payout: string;
};

const inputClass =
  "w-full border-2 border-[#191a16]/20 bg-transparent px-4 py-3 outline-none transition placeholder:text-[#99998f] focus:border-[#191a16]";

export default function CreateCampaignPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<"Instagram" | "YouTube">(
    "Instagram"
  );
  const [budget, setBudget] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([
    { views: "1000", payout: "100" },
    { views: "5000", payout: "500" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateMilestone(
    index: number,
    field: keyof Milestone,
    value: string
  ) {
    setMilestones((current) =>
      current.map((milestone, i) =>
        i === index ? { ...milestone, [field]: value } : milestone
      )
    );
  }

  function addMilestone() {
    setMilestones((current) => [
      ...current,
      { views: "", payout: "" },
    ]);
  }

  function removeMilestone(index: number) {
    setMilestones((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("meme_token");
    const storedUser = localStorage.getItem("meme_user");

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "brand") {
        setError("Only brand accounts can create campaigns.");
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }

    const numericBudget = Number(budget);

    if (!Number.isFinite(numericBudget) || numericBudget <= 0) {
      setError("Enter a valid budget greater than zero.");
      return;
    }

    if (
      milestones.some(
        (m) =>
          m.views.trim() === "" ||
          m.payout.trim() === "" ||
          !Number.isSafeInteger(Number(m.views)) ||
          Number(m.views) <= 0 ||
          !Number.isFinite(Number(m.payout)) ||
          Number(m.payout) < 0
      )
    ) {
      setError("Enter valid views and payout values for every milestone.");
      return;
    }

    const parsedMilestones = milestones.map((m) => ({
      views: Number(m.views),
      payout: Number(m.payout),
    }));

    const sorted = [...parsedMilestones].sort(
      (a, b) => a.views - b.views
    );

    for (let i = 1; i < sorted.length; i++) {
      if (
        sorted[i].views <= sorted[i - 1].views ||
        sorted[i].payout < sorted[i - 1].payout
      ) {
        setError(
          "Views must increase, and payouts cannot decrease as milestones increase."
        );
        return;
      }
    }

    setLoading(true);

    try {
      const result = await apiRequest<CampaignResponse>(
        "/campaigns",
        {
          method: "POST",
          token,
          body: {
            name: name.trim(),
            platform,
            budget: numericBudget,
            milestones: parsedMilestones,
          },
        }
      );

      setSuccess(result.message || "Campaign created successfully!");

      window.setTimeout(() => {
        router.push("/brand/dashboard");
      }, 900);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create campaign."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f0e7] text-[#191a16]">
      <header className="flex items-center justify-between border-b-2 border-[#191a16] px-6 py-5 md:px-10">
        <Link href="/" className="text-2xl font-black tracking-tighter">
          meme’d<span className="text-[#8cae00]">®</span>
        </Link>
        <Link
          href="/brand/dashboard"
          className="text-xs font-black uppercase tracking-widest underline underline-offset-4"
        >
          ← Campaign desk
        </Link>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-10 md:px-10 md:py-14">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#77786d]">
          BRAND WORKSPACE / NEW CAMPAIGN
        </p>

        <h1 className="mt-5 text-5xl font-black uppercase leading-[0.95] tracking-[-0.06em] md:text-7xl">
          Put your
          <br />
          <span className="text-[#8cae00]">budget to work.</span>
        </h1>

        <p className="mt-5 max-w-xl leading-7 text-[#62635b]">
          Set your campaign budget and decide how much creators earn
          when their content hits each view milestone.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-10 border-t-2 border-[#191a16] pt-8"
        >
          <section className="space-y-5">
            <h2 className="text-xl font-black uppercase">
              01 / Campaign basics
            </h2>

            <div>
              <label
                htmlFor="campaign-name"
                className="mb-2 block text-xs font-black uppercase tracking-widest"
              >
                Campaign name
              </label>
              <input
                id="campaign-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="e.g. Drop 01 — Summer launch"
                required
                maxLength={100}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="platform"
                  className="mb-2 block text-xs font-black uppercase tracking-widest"
                >
                  Platform
                </label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) =>
                    setPlatform(e.target.value as "Instagram" | "YouTube")
                  }
                  className={inputClass}
                >
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="budget"
                  className="mb-2 block text-xs font-black uppercase tracking-widest"
                >
                  Total budget (₹)
                </label>
                <input
                  id="budget"
                  type="number"
                  min="1"
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 25000"
                  required
                />
              </div>
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-black uppercase">
                  02 / Payout milestones
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#62635b]">
                  Add the view threshold and its payout amount.
                </p>
              </div>

              <button
                type="button"
                onClick={addMilestone}
                className="border-2 border-[#191a16] px-4 py-3 text-xs font-black uppercase transition hover:bg-[#191a16] hover:text-white"
              >
                + Add milestone
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="grid gap-4 border-2 border-[#191a16]/15 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                >
                  <div>
                    <label
                      htmlFor={`views-${index}`}
                      className="mb-2 block text-xs font-black uppercase tracking-widest"
                    >
                      Views reached
                    </label>
                    <input
                      id={`views-${index}`}
                      type="number"
                      min="1"
                      step="1"
                      value={milestone.views}
                      onChange={(e) =>
                        updateMilestone(index, "views", e.target.value)
                      }
                      className={inputClass}
                      placeholder="1000"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`payout-${index}`}
                      className="mb-2 block text-xs font-black uppercase tracking-widest"
                    >
                      Payout (₹)
                    </label>
                    <input
                      id={`payout-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={milestone.payout}
                      onChange={(e) =>
                        updateMilestone(index, "payout", e.target.value)
                      }
                      className={inputClass}
                      placeholder="100"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    disabled={milestones.length === 1}
                    aria-label={`Remove milestone ${index + 1}`}
                    className="border-2 border-[#191a16]/20 px-4 py-3 text-xs font-black uppercase transition hover:border-red-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="border-2 border-[#191a16] p-5 md:p-6">
            <p className="text-xs font-black uppercase tracking-widest text-[#77786d]">
              Budget preview
            </p>
            <p className="mt-3 text-4xl font-black">
              ₹
              {budget && Number.isFinite(Number(budget))
                ? Number(budget).toLocaleString("en-IN")
                : "0"}
            </p>
            <p className="mt-2 text-sm text-[#62635b]">
              This is your campaign budget, not an automatic payout.
              Creator payouts are calculated by the backend when
              eligible view milestones are crossed.
            </p>
          </section>

          {error && (
            <p
              role="alert"
              className="border-l-4 border-red-600 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="border-l-4 border-[#8cae00] bg-white p-4 text-sm font-bold"
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-between bg-[#a0c900] px-5 py-4 font-black uppercase transition hover:bg-[#191a16] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "CREATING CAMPAIGN..." : "CREATE CAMPAIGN"}
            <span>↗</span>
          </button>
        </form>
      </section>
    </main>
  );
}
