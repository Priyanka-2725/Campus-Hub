import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import RecommendationRail from "../components/RecommendationRail";
import ListingCard from "../components/ListingCard";
import { listingApi } from "../api/axios";
import { readFileAsDataUrl } from "../util/imageUpload";

const initialListingForm = {
  title: "",
  description: "",
  price: "",
  category: "BOOKS",
  imageUrl: "",
};

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [recommendedListings, setRecommendedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [listingForm, setListingForm] = useState(initialListingForm);
  const [filters, setFilters] = useState({
    search: "",
    category: "ALL",
    status: "ALL",
  });

  useEffect(() => {
    let mounted = true;

    Promise.all([listingApi.getAll(), listingApi.getRecommended()])
      .then(([allResponse, recommendedResponse]) => {
        if (mounted) {
          setListings(allResponse.data);
          setRecommendedListings(recommendedResponse.data);
        }
      })
      .catch(() => {
        if (mounted) {
          setListings([]);
          setRecommendedListings([]);
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

  const categories = useMemo(
    () => ["ALL", ...new Set(listings.map((listing) => listing.category).filter(Boolean))],
    [listings]
  );

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        listing.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        listing.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory =
        filters.category === "ALL" || listing.category === filters.category;
      const matchesStatus = filters.status === "ALL" || listing.status === filters.status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [filters, listings]);

  const handleChange = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleListingChange = (field) => (event) => {
    setListingForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleListingImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setListingForm((current) => ({ ...current, imageUrl: String(dataUrl) }));
  };

  const handleCreateListing = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setCreateError("");

    try {
      const payload = {
        ...listingForm,
        price: Number(listingForm.price),
        imageUrl: listingForm.imageUrl || undefined,
      };

      const { data } = await listingApi.create(payload);
      setListings((current) => [data, ...current]);
      setRecommendedListings((current) => [data, ...current]);
      setListingForm(initialListingForm);
      setIsCreateOpen(false);
    } catch (error) {
      setCreateError(error.response?.data?.message || "Unable to create listing right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-soft bg-white p-8 shadow-card sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine">
                Marketplace
              </p>
              <h1 className="mt-4 text-4xl font-semibold text-slate-900">
                Browse campus listings
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Search through student-posted items, filter by category or status,
                and discover what is moving around campus right now.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCreateOpen((current) => !current)}
                aria-expanded={isCreateOpen}
                aria-controls="create-listing-form"
                className="inline-flex items-center gap-2 rounded-full bg-pine px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus size={16} />
                {isCreateOpen ? "Hide Listing Form" : "Add Listing"}
              </button>
              <div className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-medium text-slate-600">
                <SlidersHorizontal size={16} className="text-clay" />
                {filteredListings.length} results
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={handleChange("search")}
                placeholder="Search listings"
                className="w-full border-none bg-transparent outline-none"
              />
            </label>

            <select
              value={filters.category}
              onChange={handleChange("category")}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "ALL" ? "All Categories" : category}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={handleChange("status")}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
            >
              {["ALL", "AVAILABLE", "INTERESTED", "SOLD"].map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All Statuses" : status}
                </option>
              ))}
            </select>
          </div>

          <section
            id="create-listing"
            className={`mt-8 rounded-3xl border border-slate-100 bg-cream/45 p-6 ${
              isCreateOpen ? "" : "hidden"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-pine shadow-sm">
                <Plus size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pine">Create Listing</p>
                <p className="text-sm text-slate-500">Post an item for your campus community.</p>
              </div>
            </div>

            <form
              id="create-listing-form"
              className="mt-5 grid gap-4 md:grid-cols-2"
              onSubmit={handleCreateListing}
            >
              <input
                type="text"
                value={listingForm.title}
                onChange={handleListingChange("title")}
                placeholder="Listing title"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
                required
              />
              <input
                type="text"
                value={listingForm.category}
                onChange={handleListingChange("category")}
                placeholder="Category (e.g. BOOKS, ELECTRONICS)"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
                required
              />
              <textarea
                value={listingForm.description}
                onChange={handleListingChange("description")}
                placeholder="Describe your item"
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none md:col-span-2"
                required
              />
              <input
                type="number"
                min="1"
                step="0.01"
                value={listingForm.price}
                onChange={handleListingChange("price")}
                placeholder="Price"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
                required
              />
              <label className="w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 md:col-span-2">
                <span className="block font-medium text-slate-700">Upload image</span>
                <span className="mt-1 block text-xs text-slate-500">
                  JPG, PNG, WEBP, or GIF. This will be stored with your listing.
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleListingImageUpload}
                  className="mt-3 w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-pine file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
              </label>
              {listingForm.imageUrl ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white md:col-span-2">
                  <img
                    src={listingForm.imageUrl}
                    alt="Listing preview"
                    className="h-52 w-full object-cover"
                  />
                </div>
              ) : null}
              {createError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2">
                  {createError}
                </div>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-pine px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2 md:w-fit"
              >
                {submitting ? "Posting listing..." : "Post Listing"}
              </button>
            </form>
          </section>
        </section>

        <section className="mt-8">
          <RecommendationRail
            title="Recommended Listings"
            subtitle="Suggestions powered by your browsing patterns and category interests."
            listings={recommendedListings.slice(0, 3)}
            loading={loading}
          />
        </section>

        <section className="mt-8">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-80 rounded-soft bg-white shadow-card" />
              ))}
            </div>
          ) : filteredListings.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="rounded-soft border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-card">
              No listings matched the current filters.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
