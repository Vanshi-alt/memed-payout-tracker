
const campaigns = [
  {
    id: "001",
    name: "THE SUMMER DROP",
    platform: "INSTAGRAM REELS",
    views: "48,290",
    payout: "₹4,000",
    progress: 78,
  },
  {
    id: "002",
    name: "THE STREET FILES",
    platform: "YOUTUBE SHORTS",
    views: "12,840",
    payout: "₹1,500",
    progress: 42,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f3f0e7] text-[#191a16]">
      {/* Navigation */}
      <nav className="flex items-center justify-between border-b-2 border-[#191a16] px-5 py-5 md:px-12">
        <a href="/" className="text-2xl font-black tracking-tighter">
          meme’d<span className="text-[#a0c900]">®</span>
        </a>

        <span className="hidden text-xs font-bold uppercase tracking-[0.2em] md:block">
          The creator payout system
        </span>

        <a
          href="/login"
          className="border-2 border-[#191a16] px-4 py-2 text-sm font-bold transition hover:bg-[#191a16] hover:text-white"
        >
          SIGN IN ↗
        </a>
      </nav>

      {/* Hero */}
      <section className="grid border-b-2 border-[#191a16] lg:grid-cols-[1.4fr_0.6fr]">
        <div className="px-5 py-14 md:px-12 md:py-20">
          <div className="mb-10 flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#a0c900]" />
            <p className="text-xs font-bold uppercase tracking-[0.2em]">
              The economics of going viral
            </p>
          </div>

          <h1 className="max-w-4xl text-6xl font-black uppercase leading-[0.86] tracking-[-0.075em] sm:text-7xl md:text-8xl xl:text-[112px]">
            Views are
            <br />
            <span className="text-[#a0c900]">currency.</span>
            <br />
            Get paid.
          </h1>

          <div className="mt-10 flex max-w-xl flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <p className="max-w-xs text-base leading-7 text-[#62635b]">
              The campaign payout desk for brands that spend smarter
              and creators who know their worth.
            </p>

            <a
              href="/signup"
              className="inline-flex shrink-0 items-center justify-between gap-8 bg-[#a0c900] px-5 py-4 font-black transition hover:bg-[#191a16] hover:text-white"
            >
              GET IN THE GAME <span>↗</span>
            </a>
          </div>
        </div>

        {/* Campaign artwork */}
        <div className="relative flex min-h-[340px] flex-col justify-between overflow-hidden border-t-2 border-[#191a16] bg-[#a0c900] p-6 sm:min-h-[420px] lg:border-l-2 lg:border-t-0 md:p-10">
          <div className="flex items-start justify-between">
            <span className="text-xs font-black tracking-widest">
              MM—001 / EST. FOR CREATORS
            </span>
            <span className="text-3xl font-black">✳</span>
          </div>

          <div className="relative mx-auto flex h-48 w-48 items-center justify-center rounded-full border-[3px] border-[#191a16] sm:h-60 sm:w-60">
            <div className="absolute inset-3 rotate-[-12deg] border-2 border-dashed border-[#191a16]" />
            <div className="rotate-[-12deg] text-center">
              <p className="text-xs font-black tracking-widest">VIEWS IN</p>
              <p className="text-6xl font-black tracking-tighter">₹</p>
              <p className="text-xs font-black tracking-widest">VALUE OUT</p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4">
            <p className="max-w-[200px] text-2xl font-black uppercase leading-tight">
              Make every view count.
            </p>
            <span className="text-xs font-bold">SCROLL TO EXPLORE ↓</span>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="overflow-hidden border-b-2 border-[#191a16] bg-[#191a16] px-5 py-4 text-[#f3f0e7]">
        <p className="text-center text-xs font-bold uppercase tracking-[0.12em] sm:text-sm sm:tracking-[0.2em]">
          NO GUESSWORK &nbsp; ✳ &nbsp; JUST VIEWS &nbsp; ✳ &nbsp;
          MILESTONES &nbsp; ✳ &nbsp; PAYOUTS &nbsp; ✳ &nbsp;
          NO GUESSWORK
        </p>
      </div>

      {/* Product preview */}
      <section className="px-5 py-16 md:px-12 md:py-24">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#6c6d63]">
              01 / THE CAMPAIGN DESK
            </p>
            <h2 className="text-4xl font-black uppercase tracking-[-0.06em] sm:text-6xl">
              The numbers
              <br />
              <span className="text-[#77786d]">don’t lie.</span>
            </h2>
          </div>

          <p className="max-w-xs text-sm leading-6 text-[#62635b]">
            From the first view to the final milestone, every campaign
            has a paper trail.
          </p>
        </div>

        <div className="border-2 border-[#191a16]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#191a16] bg-white/40 px-5 py-4">
            <span className="text-xs font-black uppercase tracking-widest">
              Live campaign ledger
            </span>
            <span className="flex items-center gap-2 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-[#a0c900]" />
              SAMPLE DATA
            </span>
          </div>

          {campaigns.map((campaign) => (
            <article
              key={campaign.id}
              className="grid gap-5 border-b border-[#191a16]/25 p-5 last:border-b-0 md:grid-cols-[50px_1.3fr_1fr_0.7fr] md:items-center md:px-7 md:py-8"
            >
              <span className="text-sm font-bold text-[#77786d]">
                /{campaign.id}
              </span>

              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">
                  {campaign.name}
                </h3>
                <p className="mt-1 text-xs font-bold tracking-widest text-[#77786d]">
                  {campaign.platform}
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold">
                  <span>VIEWS</span>
                  <span>{campaign.views}</span>
                </div>

                <div className="h-2 border border-[#191a16] p-[1px]">
                  <div
                    className="h-full bg-[#a0c900]"
                    style={{ width: `${campaign.progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[#77786d]">
                  {campaign.progress}% to next milestone
                </p>
              </div>

              <div className="md:text-right">
                <p className="text-xs font-bold text-[#77786d]">EARNED</p>
                <p className="mt-1 text-2xl font-black tracking-tight">
                  {campaign.payout}
                </p>
              </div>
            </article>
          ))}

          <div className="border-t-2 border-[#191a16] bg-[#a0c900] p-5 md:p-7">
            <p className="text-xs font-black uppercase tracking-widest">
              The point is simple.
            </p>
            <p className="mt-2 text-xl font-black uppercase tracking-tight sm:text-2xl">
              More views. More milestones. Clearer payouts. ↗
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#77786d]">
          * All campaign names, views, progress and payouts shown above
          are illustrative sample data.
        </p>
      </section>

      {/* Two user types */}
      <section className="grid border-y-2 border-[#191a16] md:grid-cols-2">
        <div className="border-b-2 border-[#191a16] p-7 md:border-b-0 md:border-r-2 md:p-12">
          <p className="text-xs font-black uppercase tracking-widest text-[#77786d]">
            02A / FOR BRANDS
          </p>
          <h2 className="mt-8 text-4xl font-black uppercase leading-none tracking-[-0.06em] sm:text-5xl">
            You set
            <br />
            the budget.
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-[#62635b]">
            Create campaigns, build milestone ladders and keep track
            of what you have spent versus what remains.
          </p>
          <a
            href="/signup?role=brand"
            className="mt-8 inline-flex border-b-2 border-[#191a16] pb-2 text-sm font-black"
          >
            BUILD A CAMPAIGN ↗
          </a>
        </div>

        <div className="bg-[#dedbd1] p-7 md:p-12">
          <p className="text-xs font-black uppercase tracking-widest text-[#77786d]">
            02B / FOR CREATORS
          </p>
          <h2 className="mt-8 text-4xl font-black uppercase leading-none tracking-[-0.06em] sm:text-5xl">
            You make.
            <br />
            You earn.
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-[#62635b]">
            Find live campaigns, submit your content links and see
            how your views move you towards the next payout.
          </p>
          <a
            href="/signup?role=creator"
            className="mt-8 inline-flex border-b-2 border-[#191a16] pb-2 text-sm font-black"
          >
            FIND YOUR NEXT CAMPAIGN ↗
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col justify-between gap-6 px-5 py-10 sm:flex-row sm:items-end md:px-12">
        <div>
          <p className="text-3xl font-black tracking-tighter">
            meme’d<span className="text-[#a0c900]">®</span>
          </p>
          <p className="mt-2 text-xs text-[#77786d]">
            Campaigns with receipts.
          </p>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-[#77786d]">
          MADE FOR THE NEXT MILLION VIEWS.
        </p>
      </footer>
    </main>
  );
}
