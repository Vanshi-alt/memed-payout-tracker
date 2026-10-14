
"use client";

import { useCallback, useEffect, useState } from "react";
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

type PopulatedCampaign = {
  _id?: string;
  id?: string;
  name: string;
  platform: "Instagram" | "YouTube";
  milestones?: Milestone[];
};

type Submission = {
  _id: string;
  campaignId: PopulatedCampaign | string;
  postUrl: string;
  views: number;
  payoutEarned: number;
  createdAt?: string;
};

type CampaignResponse = {
  success: boolean;
  count: number;
  campaigns: Campaign[];
};

type SubmissionResponse = {
  success: boolean;
  count: number;
  totalEarnings: number;
  submissions: Submission[];
};

type UpdateViewsResponse = {
  success: boolean;
  message: string;
  views: number;
  targetPayout: number;
  payoutThisUpdate: number;
  totalPayout: number;
  campaignRemaining: number;
};

export default function CreatorDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [viewsInput, setViewsInput] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState("");

  const formatMoney = (amount: number) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const loadCreatorData = useCallback(async (token: string) => {
    setLoading(true);
    setError("");

    try {
      const [campaignResponse, submissionResponse] = await Promise.all([
        apiRequest<CampaignResponse>("/campaigns/live", { token }),
        apiRequest<SubmissionResponse>("/submissions/mine", { token }),
      ]);

      setCampaigns(campaignResponse.campaigns ?? []);
      setSubmissions(submissionResponse.submissions ?? []);
      setTotalEarnings(Number(submissionResponse.totalEarnings ?? 0));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load your data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("meme_token");
    const storedUser = localStorage.getItem("meme_user");

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as User;

      if (parsedUser.role !== "creator") {
        router.replace("/brand/dashboard");
        return;
      }

      setUser(parsedUser);
      setChecking(false);
      void loadCreatorData(token);
    } catch {
      localStorage.removeItem("meme_token");
      localStorage.removeItem("meme_user");
      router.replace("/login");
    }
  }, [router, loadCreatorData]);

  function logout() {
    localStorage.removeItem("meme_token");
    localStorage.removeItem("meme_user");
    router.replace("/login");
  }

  async function handleSubmitPost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");

    const token = localStorage.getItem("meme_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!selectedCampaign || !postUrl.trim()) {
      setError("Select a campaign and enter your post URL.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await apiRequest<{
        success: boolean;
        message: string;
        submission: Submission;
      }>("/submissions", {
        method: "POST",
        token,
        body: {
          campaignId: selectedCampaign,
          postUrl: postUrl.trim(),
        },
      });

      setNotice(response.message || "Post submitted successfully.");
      setPostUrl("");
      setSelectedCampaign("");

      await loadCreatorData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Post submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateViews(submissionId: string) {
    setError("");
    setNotice("");

    const token = localStorage.getItem("meme_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const views = Number(viewsInput[submissionId]);

    if (!Number.isSafeInteger(views) || views < 0) {
      setError("Enter a valid non-negative whole number of views.");
      return;
    }

    setUpdatingId(submissionId);

    try {
      const response = await apiRequest<UpdateViewsResponse>(
        `/submissions/${submissionId}/views`,
        {
          method: "PATCH",
          token,
          body: { views },
        }
      );

      setNotice(
        `Views updated. This update paid ${formatMoney(
          response.payoutThisUpdate
        )}. Total earned on this update: ${formatMoney(
          response.totalPayout
        )}.`
      );

      await loadCreatorData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update views.");
    } finally {
      setUpdatingId("");
    }
  }

  if (checking || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f0e7] text-sm font-bold uppercase tracking-widest text-[#62635b]">
        Opening your creator workspace...
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
            {user.name} / CREATOR
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
          CREATOR WORKSPACE / 002
        </p>

        <h1 className="mt-5 text-5xl font-black uppercase leading-[0.95] tracking-[-0.06em] md:text-7xl">
          Your content.
          <br />
          <span className="text-[#8cae00]">Your earnings.</span>
        </h1>

        <p className="mt-5 max-w-xl leading-7 text-[#62635b]">
          Find a campaign, submit your post, and track your payout milestones.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { label: "LIVE CAMPAIGNS", value: String(campaigns.length) },
            { label: "SUBMISSIONS", value: String(submissions.length) },
            { label: "TOTAL EARNED", value: formatMoney(totalEarnings) },
          ].map((item) => (
            <div
              key={item.label}
              className="border-2 border-[#191a16]/15 p-6"
            >
              <p className="text-xs font-black tracking-widest text-[#77786d]">
                {item.label}
              </p>
              <p className="mt-5 break-words text-3xl font-black">
                {loading ? "..." : item.value}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-6 border-2 border-red-700 bg-red-50 p-4 text-sm text-red-800">
            <strong className="uppercase">Something went wrong</strong>
            <p className="mt-2">{error}</p>
          </div>
        )}

        {notice && (
          <div className="mt-6 border-2 border-[#8cae00] p-4 text-sm">
            {notice}
          </div>
        )}

        <div className="mt-12 border-t-2 border-[#191a16] pt-8">
          <p className="text-xs font-black uppercase tracking-widest text-[#77786d]">
            STEP 01 / DISCOVER
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase">
            Live campaigns.
          </h2>

          {loading ? (
            <p className="mt-6">Loading campaigns...</p>
          ) : campaigns.length === 0 ? (
            <p className="mt-6 border-2 border-dashed border-[#191a16]/25 p-8 text-sm">
              No live campaigns are available right now.
            </p>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {campaigns.map((campaign) => (
                <article
                  key={campaign.id ?? campaign._id ?? campaign.name}
                  className="border-2 border-[#191a16]/20 p-5 md:p-7"
                >
                  <p className="text-xs font-black uppercase tracking-widest text-[#77786d]">
                    {campaign.platform}
                  </p>
                  <h3 className="mt-2 text-2xl font-black uppercase">
                    {campaign.name}
                  </h3>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase text-[#77786d]">
                        Budget
                      </p>
                      <p className="mt-2 text-xl font-black">
                        {formatMoney(campaign.budget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-[#77786d]">
                        Remaining
                      </p>
                      <p className="mt-2 text-xl font-black">
                        {formatMoney(
                          campaign.remaining ??
                            campaign.budget - campaign.spent
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[#191a16]/15 pt-4">
                    <p className="text-xs font-black uppercase tracking-widest text-[#77786d]">
                      Payout milestones
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {campaign.milestones.map((milestone, index) => (
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

        <div className="mt-12 border-t-2 border-[#191a16] pt-8">
          <p className="text-xs font-black uppercase tracking-widest text-[#77786d]">
            STEP 02 / SUBMIT
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase">
            Drop your post.
          </h2>

          <form
            onSubmit={handleSubmitPost}
            className="mt-6 max-w-2xl space-y-5 border-2 border-[#191a16]/20 p-5 md:p-7"
          >
            <div>
              <label className="text-xs font-black uppercase tracking-widest">
                Select campaign
              </label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                required
                className="mt-2 w-full border-2 border-[#191a16]/25 bg-transparent px-4 py-3 outline-none focus:border-[#8cae00]"
              >
                <option value="">Choose a live campaign</option>
                {campaigns.map((campaign) => (
                  <option
                    key={campaign.id ?? campaign._id}
                    value={campaign.id ?? campaign._id}
                  >
                    {campaign.name} — {campaign.platform}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest">
                Public post URL
              </label>
              <input
                type="url"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://www.instagram.com/... or YouTube URL"
                required
                className="mt-2 w-full border-2 border-[#191a16]/25 bg-transparent px-4 py-3 outline-none focus:border-[#8cae00]"
              />
              <p className="mt-2 text-xs text-[#77786d]">
                Use an HTTPS Instagram or YouTube URL matching the campaign.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || campaigns.length === 0}
              className="bg-[#a0c900] px-5 py-4 text-sm font-black uppercase transition hover:bg-[#191a16] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit post ↗"}
            </button>
          </form>
        </div>

        <div className="mt-12 border-t-2 border-[#191a16] pt-8">
          <p className="text-xs font-black uppercase tracking-widest text-[#77786d]">
            STEP 03 / TRACK
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase">
            Your submissions.
          </h2>

          {loading ? (
            <p className="mt-6">Loading submissions...</p>
          ) : submissions.length === 0 ? (
            <p className="mt-6 border-2 border-dashed border-[#191a16]/25 p-8 text-sm">
              Your submitted posts and earnings will appear here.
            </p>
          ) : (
            <div className="mt-6 grid gap-5">
              {submissions.map((submission) => {
                const campaign =
                  typeof submission.campaignId === "object"
                    ? submission.campaignId
                    : null;

                return (
                  <article
                    key={submission._id}
                    className="border-2 border-[#191a16]/20 p-5 md:p-7"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-[#77786d]">
                          {campaign?.platform ?? "CAMPAIGN"}
                        </p>
                        <h3 className="mt-2 text-xl font-black uppercase">
                          {campaign?.name ?? "Campaign submission"}
                        </h3>
                        <a
                          href={submission.postUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-block break-all text-sm underline"
                        >
                          Open submitted post ↗
                        </a>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase text-[#77786d]">
                          Total earned
                        </p>
                        <p className="mt-2 text-2xl font-black">
                          {formatMoney(submission.payoutEarned)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase text-[#77786d]">
                          Current views
                        </p>
                        <p className="mt-2 text-xl font-black">
                          {submission.views.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor={`views-${submission._id}`}
                          className="text-xs font-bold uppercase text-[#77786d]"
                        >
                          Simulate a views update
                        </label>
                        <div className="mt-2 flex gap-2">
                          <input
                            id={`views-${submission._id}`}
                            type="number"
                            min="0"
                            step="1"
                            value={viewsInput[submission._id] ?? ""}
                            onChange={(e) =>
                              setViewsInput((previous) => ({
                                ...previous,
                                [submission._id]: e.target.value,
                              }))
                            }
                            placeholder="Enter views"
                            className="min-w-0 flex-1 border-2 border-[#191a16]/25 bg-transparent px-3 py-2"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateViews(submission._id)
                            }
                            disabled={updatingId === submission._id}
                            className="bg-[#191a16] px-3 py-2 text-xs font-black uppercase text-white disabled:opacity-50"
                          >
                            {updatingId === submission._id
                              ? "Updating..."
                              : "Update"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-5 text-[#77786d]">
                      View updates are simulated for this assignment. They
                      do not fetch verified counts from Instagram or YouTube.
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
