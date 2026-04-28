import { IndianRupee, MessageCircleMore, ShoppingBag, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { listingApi, messageApi } from "../api/axios";
import { useAuth } from "../context/AuthContext";

const statusClasses = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  INTERESTED: "bg-amber-100 text-amber-700",
  SOLD: "bg-rose-100 text-rose-700",
};

const smartReplies = [
  "Is this still available?",
  "Can you lower the price?",
  "Can I pick this up today?",
  "Where should we meet?",
];

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    listingApi
      .getById(id)
      .then(({ data }) => {
        if (mounted) {
          setListing(data);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.response?.data?.message || "Unable to load listing.");
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
  }, [id]);

  const isOwner = listing?.owner?.id === user?.id;

  const handleInterest = async () => {
    setActionLoading(true);
    setError("");

    try {
      const { data } = await listingApi.expressInterest(id);
      setListing(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to express interest.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmSale = async () => {
    setActionLoading(true);
    setError("");

    try {
      const { data } = await listingApi.confirmSale(id);
      setListing(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to confirm sale.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessageSeller = async (customMessage) => {
    if (!listing?.owner?.id || isOwner) {
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      await messageApi.send({
        receiverId: listing.owner.id,
        content:
          customMessage || `Hi, I am interested in your listing "${listing.title}".`,
        listingId: listing.id,
      });
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to message seller.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-cream px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl rounded-soft bg-white px-8 py-12 text-sm text-slate-500 shadow-card">
          Loading listing...
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-cream px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl rounded-soft bg-white px-8 py-12 text-sm text-slate-500 shadow-card">
          {error || "Listing not found."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <Link to="/marketplace" className="text-sm font-semibold text-pine">
          Back to marketplace
        </Link>

        <section className="mt-5 grid gap-8 rounded-soft bg-white p-8 shadow-card lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-mint via-cream to-clay/50">
              {listing.imageUrl ? (
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="h-[420px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[420px] items-center justify-center px-6 text-center text-sm font-medium text-slate-500">
                  No image uploaded for this listing.
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine">
                  Listing Detail
                </p>
                <h1 className="mt-4 text-4xl font-semibold text-slate-900">{listing.title}</h1>
                {listing.reason ? (
                  <p className="mt-3 text-sm font-medium text-clay">{listing.reason}</p>
                ) : null}
              </div>
              <span
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  statusClasses[listing.status] || "bg-slate-100 text-slate-700"
                }`}
              >
                {listing.status}
              </span>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-base font-semibold text-white">
              <IndianRupee size={16} />
              {listing.price}
            </div>

            {listing.badges?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {listing.badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full bg-pine/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-pine"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {listing.urgencyText ? (
                <div className="rounded-3xl bg-cream/70 p-4 text-sm font-semibold text-slate-700">
                  {listing.urgencyText}
                </div>
              ) : null}
              {listing.interestCount != null ? (
                <div className="rounded-3xl bg-cream/70 p-4 text-sm font-semibold text-slate-700">
                  {listing.interestCount} people interested
                </div>
              ) : null}
            </div>

            <p className="mt-6 text-base leading-8 text-slate-600">{listing.description}</p>

            <div className="mt-8 rounded-3xl bg-cream/70 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                Seller
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-pine shadow-sm">
                  <UserRound size={22} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {listing.owner?.name || "Campus user"}
                  </p>
                  <p className="text-sm text-slate-500">{listing.owner?.email}</p>
                </div>
              </div>
            </div>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              {!isOwner && listing.status === "AVAILABLE" ? (
                <button
                  type="button"
                  onClick={handleInterest}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-pine px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <ShoppingBag size={16} />
                  {actionLoading ? "Submitting..." : "Express Interest"}
                </button>
              ) : null}

              {isOwner && listing.status === "INTERESTED" ? (
                <button
                  type="button"
                  onClick={handleConfirmSale}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <ShoppingBag size={16} />
                  {actionLoading ? "Confirming..." : "Confirm Sale"}
                </button>
              ) : null}

              {!isOwner ? (
                <button
                  type="button"
                  onClick={handleMessageSeller}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-clay px-5 py-3 text-sm font-semibold text-clay disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <MessageCircleMore size={16} />
                  Message Seller
                </button>
              ) : null}
            </div>

            {!isOwner ? (
              <div className="mt-8 rounded-3xl border border-slate-100 bg-cream/55 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pine">
                  Smart chat prompts
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {smartReplies.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => handleMessageSeller(reply)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
