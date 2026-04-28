import { ArrowRight, CalendarDays, MessageCircleMore, Store } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi } from "../api/axios";
import BrandLogo from "../components/BrandLogo";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    title: "Marketplace",
    text: "Buy used books, furniture, gadgets, and campus essentials without leaving your college circle.",
    icon: Store,
  },
  {
    title: "Events",
    text: "Discover student meetups, workshops, and club activities in one place with fast RSVP flows.",
    icon: CalendarDays,
  },
  {
    title: "Collaborate",
    text: "Find teammates, project partners, and quick help for hackathons, societies, and class work.",
    icon: MessageCircleMore,
  },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [liveStats, setLiveStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    totalEvents: 0,
  });

  useEffect(() => {
    let mounted = true;

    const loadStats = () => {
      dashboardApi
        .publicStats()
        .then(({ data }) => {
          if (!mounted) {
            return;
          }

          setLiveStats({
            totalUsers: Number(data?.totalUsers || 0),
            activeListings: Number(data?.activeListings || 0),
            totalEvents: Number(data?.totalEvents || 0),
          });
        })
        .catch(() => {
          if (!mounted) {
            return;
          }

          setLiveStats({ totalUsers: 0, activeListings: 0, totalEvents: 0 });
        });
    };

    loadStats();
    const intervalId = setInterval(loadStats, 30000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const statCards = useMemo(() => {
    const baselineUsers = 2400;
    const baselineListings = 380;
    const baselineEvents = 24;

    const totalUsers = baselineUsers + liveStats.totalUsers;
    const activeListings = baselineListings + liveStats.activeListings;
    const totalEvents = baselineEvents + liveStats.totalEvents;

    return [
      [
        `${(totalUsers / 1000).toLocaleString(undefined, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}K+`,
        "Total Users",
      ],
      [`${activeListings.toLocaleString()}+`, "Active Listings"],
      [totalEvents.toLocaleString(), "Events This Week"],
    ];
  }, [liveStats]);

  return (
    <main className="min-h-screen bg-cream text-slate-800">
      <section className="relative overflow-hidden px-6 pb-16 pt-8 sm:px-10 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(107,143,113,0.24),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(216,164,127,0.28),_transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <BrandLogo to="/" size={72} className="mb-8" />
              <p className="inline-flex rounded-full border border-pine/20 bg-white/80 px-4 py-2 text-sm font-medium text-pine shadow-sm">
                Buy. Join. Build. Belong.
              </p>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.02] sm:text-6xl">
                Your Campus.
                <span className="block text-pine">Connected.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                A campus-first platform for exchanging goods, discovering events,
                finding collaborators, and keeping student conversations moving.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/register"}
                  className="inline-flex items-center gap-2 rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white shadow-card"
                >
                  Get Started
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to={isAuthenticated ? "/marketplace" : "/login"}
                  className="rounded-full border border-clay bg-white px-6 py-3 text-sm font-semibold text-clay"
                >
                  Browse Listings
                </Link>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {statCards.map(([value, label]) => (
                  <div key={label} className="rounded-3xl bg-white/80 p-5 shadow-card backdrop-blur">
                    <p className="text-3xl font-semibold text-slate-900">{value}</p>
                    <p className="mt-1 text-sm text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-8 h-40 w-40 rounded-full bg-mint/50 blur-3xl" />
              <div className="absolute -right-8 bottom-8 h-40 w-40 rounded-full bg-clay/30 blur-3xl" />
              <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-slate-900 p-6 text-white shadow-card">
                <div className="rounded-[28px] bg-[linear-gradient(145deg,#6B8F71_0%,#7DA283_35%,#D8A47F_100%)] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                    Student Network Snapshot
                  </p>
                  <div className="mt-10 grid gap-4">
                    <div className="rounded-3xl bg-white/16 p-5 backdrop-blur">
                      <p className="text-sm text-white/80">Marketplace demand</p>
                      <p className="mt-2 text-3xl font-semibold">Books & Tech trending</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl bg-white/16 p-5 backdrop-blur">
                        <p className="text-sm text-white/80">Live chats</p>
                        <p className="mt-2 text-2xl font-semibold">148 today</p>
                      </div>
                      <div className="rounded-3xl bg-white/16 p-5 backdrop-blur">
                        <p className="text-sm text-white/80">Team requests</p>
                        <p className="mt-2 text-2xl font-semibold">32 open</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ title, text, icon: Icon }) => (
              <article
                key={title}
                className="rounded-soft border border-white/80 bg-white p-7 shadow-card transition-transform duration-200 hover:scale-[1.02]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint/45 text-pine">
                  <Icon size={22} />
                </div>
                <h2 className="mt-5 text-2xl font-semibold">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
