
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../../lib/api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "brand" | "creator";
};

type Milestone = {
  views: number;
  payout: number;
};

type Campaign = {
  id?: string;
  _id?: string;
  name: string;
  platform: "Instagram" | "YouTube";
  budget: number;
  spent: number;
  remaining?: number;
  milestones: Milestone[];
  isLive?: boolean;
};

type CampaignResponse = {
  success: boolean;
  count: number;
  campaigns: Campaign[];
};

export default function BrandDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [checking, setChecking] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("meme_token");
      const storedUser = localStorage.getItem("meme_user");

      if (!token || !storedUser) {
        router.replace("/login");
        return;
      }

      let parsedUser: User;

      try {
        parsedUser = JSON.parse(storedUser) as User;

        if (parsedUser.role !== "brand") {
          router.replace("/creator/dashboard");
          return;
        }

        setUser(parsedUser);
        setChecking(false);
      } catch {
        localStorage.removeItem("meme_token");
        localStorage.removeItem("meme_user");
        router.replace("/login");
        return;
      }

      try {
        const response = await apiRequest<CampaignResponse>(
          "/campaigns/mine",
          { token }
        );

        setCampaigns(response.campaigns ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load campaigns."
        );
      } finally {
        setLoadingCampaigns(false);
      }
    }

    loadDashboard();
  }, [router]);

  function logout() {
    localStorage.removeItem("meme_token");
    localStorage.removeItem("meme_user");
    router.replace("/login");
  }

  const totalBudget = campaigns.reduce(
    (sum, campaign) => sum + Number(campaign.budget || 0),
    0
  );

  const totalSpent = campaigns.reduce(
    (sum, campaign) => sum + Number(campaign.spent || 0),
    0
  );

  const budgetLeft = campaigns.reduce(
    (sum, campaign) =>
      sum +
      Number(
        campaign.remaining ??
          Number(campaign.budget || 0) - Number(campaign.spent || 0)
      ),
    0
  );

  const formatMoney = (amount: number) =>
    `₹${amount.toLocaleString("en-IN")}`;

  if (checking || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f0e7] text-sm font-bold uppercase tracking-widest text-[#62635b]">
        Opening your campaign desk...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f0e7] text-[#191a16]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#191a16] px-6 py-5 md:px-10">
        <Link href="/" className="text-2xl font-black tracking-tighter">
          meme’d<span className="text-[#8cae00]">®</span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm text-[#62635b]">
            {user.name} / BRAND
          </span>
          <button
            onClick={logout}
            className="border-2 border-[#191a16] px-4 py-2 text-xs font-black uppercase tracking-widest transition hover:bg-[#191a16] hover:text-white"
          >
            Log out
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-16">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#77786d]">
          BRAND WORKSPACE / 001
        </p>

        <h1 className="mt-5 text-5xl font-black uppercase leading-[0.95] tracking-[-0.06em] md:text-7xl">
          Make noise.
          <br />
          <span className="text-[#8cae00]">Track every rupee.</span>
        </h1>

        <p className="mt-5 max-w-xl leading-7 text-[#62635b]">
          Your campaign desk. Set the budget, define the milestones,
          and see how creator payouts move.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { label: "CAMPAIGNS", value: String(campaigns.length) },
            { label: "TOTAL SPENT", value: formatMoney(totalSpent) },
            { label: "BUDGET LEFT", value: formatMoney(budgetLeft) },
          ].map((item) => (
            <div
              key={item.label}
              className="border-2 border-[#191a16]/15 p-6"
            >
              <p className="text-xs font-black tracking-widest text-[#77786d]">
                {item.label}
              </p>
              <p className="mt-5 break-words text-3xl font-black">
                {loadingCampaigns ? "..." : item.value}
              </p>
              <p className="mt-2 text-xs text-[#77786d]">
                {item.label === "CAMPAIGNS"
                  ? "Your campaigns"
                  : item.label === "TOTAL SPENT"
                    ? `Allocated budget: ${formatMoney(totalBudget)}`
                    : "Across all your campaigns"}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t-2 border-[#191a16] pt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#77786d]">
                YOUR CAMPAIGNS
              </p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-tight">
                The ledger.
              </h2>
            </div>

            <button
              onClick={() => router.push("/brand/dashboard/create")}
              className="bg-[#a0c900] px-5 py-4 text-sm font-black uppercase transition hover:bg-[#191a16] hover:text-white"
            >
              + Create campaign ↗
            </button>
          </div>

          {error && (
            <div className="mt-6 border-2 border-red-700 bg-red-50 p-5 text-sm text-red-800">
              <p className="font-black uppercase">Could not load campaigns</p>
              <p className="mt-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 underline"
              >
                Try again
              </button>
            </div>
          )}

          {loadingCampaigns ? (
            <div className="mt-6 border-2 border-dashed border-[#191a16]/25 px-6 py-12 text-center">
              Loading your campaigns...
            </div>
          ) : !error && campaigns.length === 0 ? (
            <div className="mt-6 border-2 border-dashed border-[#191a16]/25 px-6 py-12 text-center">
              <p className="text-lg font-black uppercase">
                Your next campaign starts here.
              </p>
              <p className="mt-3 text-sm leading-6 text-[#62635b]">
                Create your first campaign to see its budget and milestones
                here.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {campaigns.map((campaign) => (
                <article
                  key={campaign.id ?? campaign._id ?? campaign.name}
                  className="border-2 border-[#191a16]/20 p-5 md:p-7"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black uppercase">
                        {campaign.name}
                      </h3>
                      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[#77786d]">
                        {campaign.platform}
                        {" / "}
                        {campaign.isLive === false ? "NOT LIVE" : "LIVE"}
                      </p>
                    </div>

                    <p className="bg-[#a0c900] px-3 py-2 text-xs font-black uppercase">
                      {formatMoney(Number(campaign.remaining ?? (
                        Number(campaign.budget || 0) -
                        Number(campaign.spent || 0)
                      )))} left
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#77786d]">
                        Total budget
                      </p>
                      <p className="mt-2 text-lg font-black">
                        {formatMoney(Number(campaign.budget || 0))}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#77786d]">
                        Spent
                      </p>
                      <p className="mt-2 text-lg font-black">
                        {formatMoney(Number(campaign.spent || 0))}
                      </p>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#77786d]">
                        Milestones
                      </p>
                      <p className="mt-2 text-lg font-black">
                        {campaign.milestones?.length ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-[#191a16]/15 pt-4">
                    <p className="text-xs font-black uppercase tracking-widest text-[#77786d]">
                      Payout milestones
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(campaign.milestones ?? []).map((milestone, index) => (
                        <span
                          key={`${milestone.views}-${index}`}
                          className="border border-[#191a16]/20 px-3 py-2 text-xs font-bold"
                        >
                          {milestone.views.toLocaleString("en-IN")} views
                          {" → "}
                          {formatMoney(milestone.payout)}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
