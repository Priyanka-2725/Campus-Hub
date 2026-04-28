import { CalendarDays, MapPin, Users } from "lucide-react";

export default function EventCard({ event, onJoin, joining }) {
  return (
    <article className="rounded-soft bg-white p-6 shadow-card transition-transform duration-200 hover:scale-[1.02]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-slate-900">{event.title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">{event.description}</p>
        </div>
        <span className="rounded-full bg-mint/35 px-3 py-1.5 text-xs font-semibold text-pine">
          {event.joined ? "Joined" : "Open"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
        <div className="inline-flex items-center gap-2">
          <CalendarDays size={16} className="text-clay" />
          <span>{new Date(event.dateTime).toLocaleString()}</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <MapPin size={16} className="text-clay" />
          <span>{event.location}</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <Users size={16} className="text-clay" />
          <span>{event.participantCount} participants</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">Hosted by {event.createdBy?.name || "Campus user"}</p>
        <button
          type="button"
          onClick={() => onJoin?.(event.id)}
          disabled={event.joined || joining}
          className="rounded-xl bg-pine px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {event.joined ? "Already Joined" : joining ? "Joining..." : "Join Event"}
        </button>
      </div>
    </article>
  );
}
