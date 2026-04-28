import { MessageCircle, Shapes, Store, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import RecommendationRail from "../components/RecommendationRail";
import { activityApi, dashboardApi, listingApi, notificationApi } from "../api/axios";
import { useAuth } from "../context/AuthContext";

const navCards = [
  {
    title: "Marketplace",
    text: "Browse listings, post campus finds, and track your item activity.",
    icon: Store,
    to: "/marketplace",
  },
  {
    title: "Chat",
    text: "Continue student conversations and respond to buyer interest quickly.",
    icon: MessageCircle,
    to: "/chat",
  },
  {
    title: "Events",
    text: "See what is happening across clubs, societies, and campus groups.",
    icon: Ticket,
    to: "/events",
  },
  {
    title: "Collab",
    text: "Find teammates, helpers, and project opportunities around campus.",
    icon: Shapes,
    to: "/collaboration",
  },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [recommendedListings, setRecommendedListings] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      dashboardApi.stats(),
      notificationApi.getAll(),
      listingApi.getRecommended(),
      activityApi.recent(),
    ])
      .then(([statsResponse, notificationsResponse, recommendedResponse, activitiesResponse]) => {
        if (!mounted) {
          return;
        }

        setStats(statsResponse.data);
        setNotifications(notificationsResponse.data.slice(0, 5));
        setRecommendedListings(recommendedResponse.data.slice(0, 3));
        setActivities(activitiesResponse.data.slice(0, 4));
      })
      .catch(() => {
        if (mounted) {
          setStats(null);
          setNotifications([]);
          setRecommendedListings([]);
          setActivities([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-cream px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-soft bg-white p-8 shadow-card sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine">
                  Dashboard
                </p>
                <h1 className="mt-4 text-4xl font-semibold text-slate-900">
                  Welcome back, {user?.name || "Student"}.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Your campus network is active. Jump into listings, conversations,
                  events, and collaboration requests from one place.
                </p>
              </div>
              <NotificationBell count={stats?.unreadNotifications || 0} />
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {navCards.map(({ title, text, icon: Icon, to }) => (
                <Link
                  key={title}
                  to={to}
                  className="rounded-soft border border-slate-100 bg-cream/55 p-5 transition-transform duration-200 hover:scale-[1.02]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-pine shadow-sm">
                    <Icon size={22} />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-slate-900">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </Link>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["Users", stats?.totalUsers ?? "--"],
                ["Active Listings", stats?.activeListings ?? "--"],
                ["Events", stats?.totalEvents ?? "--"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl bg-slate-900 p-5 text-white">
                  <p className="text-sm text-white/70">{label}</p>
                  <p className="mt-2 text-3xl font-semibold">{loading ? "..." : value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-mint/40 bg-mint/15 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pine">
                Insights For You
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                {stats?.insightHeadline || "Your campus profile is warming up"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {stats?.insightDetail || "Keep browsing and posting to unlock personalized insights."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-white px-4 py-2 font-medium text-slate-700">
                  Best time to post: {stats?.bestTimeToPost || "Evening"}
                </span>
                <span className="rounded-full bg-white px-4 py-2 font-medium text-slate-700">
                  Top category: {stats?.topCategory || "General"}
                </span>
              </div>
            </div>
          </div>

          <aside className="rounded-soft bg-white p-8 shadow-card sm:p-10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine">
                  Recent Notifications
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Latest activity from your campus network.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {notifications.length ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-3xl border border-slate-100 bg-cream/45 p-4"
                  >
                    <p className="text-sm leading-6 text-slate-700">{notification.message}</p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                      {notification.isRead ? "Read" : "Unread"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 px-5 py-8 text-sm text-slate-500">
                  No notifications yet.
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/marketplace"
                className="rounded-xl bg-pine px-5 py-3 text-sm font-semibold text-white"
              >
                Explore Marketplace
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-clay px-5 py-3 text-sm font-semibold text-clay"
              >
                Logout
              </button>
            </div>
          </aside>
        </section>

        <div className="mt-8">
          <RecommendationRail
            title="Recommended For You"
            subtitle="Fresh suggestions with reasons behind each recommendation."
            listings={recommendedListings}
            loading={loading}
          />
        </div>

        <section className="mt-8 rounded-soft bg-white p-8 shadow-card">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine">
                What is happening now
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Live signals from listings, events, and student activity.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {activities.length ? (
              activities.map((activity) => (
                <article
                  key={activity.id}
                  className="rounded-3xl border border-slate-100 bg-cream/45 p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
                    {activity.type}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{activity.message}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.22em] text-slate-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 px-6 py-10 text-sm text-slate-500 md:col-span-2">
                No live activity yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
