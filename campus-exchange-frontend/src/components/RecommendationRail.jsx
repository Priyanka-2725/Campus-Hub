import ListingCard from "./ListingCard";

export default function RecommendationRail({ title, subtitle, listings, loading }) {
  return (
    <section className="rounded-soft bg-white p-8 shadow-card">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine">
            {title}
          </p>
          {subtitle ? <p className="mt-3 text-sm leading-7 text-slate-500">{subtitle}</p> : null}
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-72 rounded-soft bg-cream" />
            ))}
          </div>
        ) : listings.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <div key={listing.id} className="space-y-3">
                {listing.reason ? (
                  <p className="text-sm font-medium text-clay">{listing.reason}</p>
                ) : null}
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 px-6 py-10 text-sm text-slate-500">
            No recommendations available yet. Browse more listings to improve suggestions.
          </div>
        )}
      </div>
    </section>
  );
}
