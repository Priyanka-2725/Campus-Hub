import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import { eventApi } from "../api/axios";

const initialForm = {
  title: "",
  description: "",
  location: "",
  dateTime: "",
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  useEffect(() => {
    let mounted = true;

    eventApi
      .getAll()
      .then(({ data }) => {
        if (mounted) {
          setEvents(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setEvents([]);
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

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        dateTime: form.dateTime,
      };
      const { data } = await eventApi.create(payload);
      setEvents((current) => [data, ...current]);
      setForm(initialForm);
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (eventId) => {
    setJoiningId(eventId);

    try {
      const { data } = await eventApi.join(eventId);
      setEvents((current) => current.map((event) => (event.id === eventId ? data : event)));
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <main className="min-h-screen bg-cream px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-soft bg-white p-8 shadow-card">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine">
                Events
              </p>
              <h1 className="mt-4 text-4xl font-semibold text-slate-900">
                Join what is happening on campus
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Browse student events, meetups, workshops, and social gatherings,
                then RSVP directly from the feed.
              </p>
              <a
                href="#create-event"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-pine px-5 py-3 text-sm font-semibold text-white"
              >
                <Plus size={16} />
                Add Event
              </a>
            </div>

            {loading ? (
              <div className="rounded-soft bg-white px-6 py-10 text-sm text-slate-500 shadow-card">
                Loading events...
              </div>
            ) : events.length ? (
              <div className="space-y-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onJoin={handleJoin}
                    joining={joiningId === event.id}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-soft bg-white px-6 py-10 text-sm text-slate-500 shadow-card">
                No events available yet.
              </div>
            )}
          </div>

          <aside id="create-event" className="rounded-soft bg-white p-8 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint/35 text-pine">
                <Plus size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine">
                  Create Event
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Announce your next campus gathering.
                </p>
              </div>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleCreate}>
              <input
                type="text"
                value={form.title}
                onChange={handleChange("title")}
                placeholder="Event title"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                required
              />
              <textarea
                value={form.description}
                onChange={handleChange("description")}
                placeholder="Event description"
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                required
              />
              <input
                type="text"
                value={form.location}
                onChange={handleChange("location")}
                placeholder="Location"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                required
              />
              <input
                type="datetime-local"
                value={form.dateTime}
                onChange={handleChange("dateTime")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-pine px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Creating..." : "Create Event"}
              </button>
            </form>
          </aside>
        </section>
      </div>
    </main>
  );
}
