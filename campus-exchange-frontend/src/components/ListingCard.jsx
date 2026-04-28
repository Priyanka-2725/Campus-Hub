import { IndianRupee, Tag } from "lucide-react";
import { Link } from "react-router-dom";

const statusClasses = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  INTERESTED: "bg-amber-100 text-amber-700",
  SOLD: "bg-rose-100 text-rose-700",
};

export default function ListingCard({ listing }) {
  return (
    <article className="group overflow-hidden rounded-soft bg-white shadow-card transition-transform duration-200 hover:scale-[1.02]">
      <div className="relative h-52 bg-gradient-to-br from-mint via-cream to-clay/60">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm font-medium text-slate-500">
            No image uploaded
          </div>
        )}
        {listing.badges?.length ? (
          <div className="absolute left-4 top-4 flex max-w-[80%] flex-wrap gap-2">
            {listing.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-slate-900/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur"
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}
        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${
            statusClasses[listing.status] || "bg-slate-100 text-slate-700"
          }`}
        >
          {listing.status}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{listing.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
              {listing.description}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-cream px-3 py-2 text-sm font-semibold text-slate-900">
            <IndianRupee size={14} />
            {listing.price}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-mint/35 px-3 py-1.5 font-medium text-pine">
            <Tag size={14} />
            {listing.category}
          </span>
          <span className="text-slate-500">Seller: {listing.owner?.name || "Unknown"}</span>
        </div>

        {listing.reason ? (
          <p className="mt-3 text-sm font-medium text-clay">{listing.reason}</p>
        ) : null}

        {listing.urgencyText ? (
          <p className="mt-2 text-sm text-slate-500">{listing.urgencyText}</p>
        ) : null}

        <Link
          to={`/marketplace/${listing.id}`}
          className="mt-5 inline-flex rounded-xl bg-pine px-4 py-2 text-sm font-semibold text-white"
        >
          View Listing
        </Link>
      </div>
    </article>
  );
}
