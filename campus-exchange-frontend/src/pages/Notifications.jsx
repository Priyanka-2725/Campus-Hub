import { BellRing, CheckCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { notificationApi } from "../api/axios";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  useEffect(() => {
    let mounted = true;

    notificationApi
      .getAll()
      .then(({ data }) => {
        if (mounted) {
          setNotifications(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setNotifications([]);
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

  const handleMarkAsRead = async (notificationId) => {
    const { data } = await notificationApi.markAsRead(notificationId);
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? data : notification
      )
    );
  };

  return (
    <main className="min-h-screen bg-cream px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-soft bg-white p-8 shadow-card sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine">
                Notifications
              </p>
              <h1 className="mt-4 text-4xl font-semibold text-slate-900">
                Stay on top of campus activity
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Track buyer interest, new messages, event joins, and platform updates
                in one feed.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-3xl bg-cream px-5 py-3">
              <BellRing size={18} className="text-clay" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{unreadCount} unread</p>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Active alerts
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {loading ? (
              <div className="rounded-3xl bg-cream px-5 py-8 text-sm text-slate-500">
                Loading notifications...
              </div>
            ) : notifications.length ? (
              notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`rounded-3xl border px-5 py-5 transition ${
                    notification.isRead
                      ? "border-slate-100 bg-white"
                      : "border-mint bg-mint/20"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm leading-7 text-slate-700">{notification.message}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-400">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          notification.isRead
                            ? "bg-slate-100 text-slate-500"
                            : "bg-pine text-white"
                        }`}
                      >
                        {notification.isRead ? "Read" : "Unread"}
                      </span>
                      {!notification.isRead ? (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-clay px-4 py-2 text-sm font-semibold text-clay"
                        >
                          <CheckCheck size={16} />
                          Mark as read
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 px-5 py-10 text-sm text-slate-500">
                No notifications yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
