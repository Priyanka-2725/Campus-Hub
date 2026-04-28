import { CalendarDays, Mail, Pencil, Plus, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collaborationApi, dashboardApi, listingApi, userApi } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { readFileAsDataUrl } from "../util/imageUpload";

const tabs = [
  { key: "listings", label: "Listings" },
  { key: "events", label: "Events" },
  { key: "posts", label: "Posts" },
  { key: "responses", label: "Responses" },
];

const initialEditForm = {
  title: "",
  description: "",
  price: "",
  category: "",
  imageUrl: "",
};

export default function Profile() {
  const { user, refreshProfile, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("listings");
  const [myListings, setMyListings] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [myResponses, setMyResponses] = useState([]);
  const [myInterests, setMyInterests] = useState([]);
  const [loadingError, setLoadingError] = useState("");
  const [interestError, setInterestError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editListingId, setEditListingId] = useState(null);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    let mounted = true;

    setLoadingError("");
    setInterestError("");

    Promise.allSettled([
      refreshProfile(),
      dashboardApi.stats(),
      userApi.myListings(),
      userApi.myEvents(),
      userApi.myPosts(),
      userApi.myResponses(),
      userApi.myInterests(),
    ]).then((results) => {
      if (!mounted) {
        return;
      }

      const [profileResult, statsResult, listingsResult, eventsResult, postsResult, responsesResult, interestsResult] = results;
      const resolvedUserId =
        profileResult.status === "fulfilled" ? profileResult.value?.id : user?.id;

      if (profileResult.status === "rejected") {
        setLoadingError(profileResult.reason?.response?.data?.message || "Unable to load your profile.");
      }

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value.data);
      }

      if (listingsResult.status === "fulfilled") {
        setMyListings(listingsResult.value.data);
      } else if (resolvedUserId) {
        // Fallback for environments where /users/me/listings is temporarily unavailable.
        listingApi
          .getAll()
          .then(({ data }) => {
            if (mounted) {
              setMyListings((data || []).filter((listing) => listing.owner?.id === resolvedUserId));
            }
          })
          .catch(() => {
            if (mounted) {
              setLoadingError("Unable to load your listings right now.");
            }
          });
      } else {
        setLoadingError("Unable to load your listings right now.");
      }

      if (eventsResult.status === "fulfilled") {
        setMyEvents(eventsResult.value.data);
      }

      if (postsResult.status === "fulfilled") {
        setMyPosts(postsResult.value.data);
      }

      if (responsesResult.status === "fulfilled") {
        setMyResponses(responsesResult.value.data);
      }

      if (interestsResult.status === "fulfilled") {
        setMyInterests(interestsResult.value.data);
      } else {
        setInterestError("Listing interests could not be loaded right now.");
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Recently";

  const openEditModal = (listing) => {
    setEditListingId(listing.id);
    setEditForm({
      title: listing.title || "",
      description: listing.description || "",
      price: listing.price || "",
      category: listing.category || "",
      imageUrl: listing.imageUrl || "",
    });
    setEditError("");
    setEditOpen(true);
  };

  const closeEditModal = () => {
    if (editSubmitting) {
      return;
    }

    setEditOpen(false);
    setEditListingId(null);
    setEditForm(initialEditForm);
    setEditError("");
  };

  const handleEditChange = (field) => (event) => {
    setEditForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleEditImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setEditForm((current) => ({ ...current, imageUrl: String(dataUrl) }));
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    setEditSubmitting(true);
    setEditError("");

    try {
      const payload = {
        ...editForm,
        price: Number(editForm.price),
        imageUrl: editForm.imageUrl || null,
      };

      const { data } = await listingApi.update(editListingId, payload);
      setMyListings((current) =>
        current.map((listing) => (listing.id === editListingId ? data : listing))
      );
      closeEditModal();
    } catch (submitError) {
      setEditError(submitError.response?.data?.message || "Unable to update listing right now.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    try {
      await listingApi.remove(listingId);
      setMyListings((current) => current.filter((listing) => listing.id !== listingId));
    } catch (deleteError) {
      setLoadingError(deleteError.response?.data?.message || "Unable to delete listing right now.");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await collaborationApi.remove(postId);
      setMyPosts((current) => current.filter((post) => post.id !== postId));
    } catch (deleteError) {
      setLoadingError(deleteError.response?.data?.message || "Unable to delete collaboration post right now.");
    }
  };

  return (
    <main className="min-h-screen bg-cream px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-soft bg-[linear-gradient(160deg,#6B8F71_0%,#89AA8D_48%,#D8A47F_100%)] p-8 text-white shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
              Student Profile
            </p>

            <div className="mt-8 flex flex-col items-center text-center">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white/45 bg-white/20 shadow-card">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.name || "Profile avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound size={52} />
                )}
              </div>
              <h1 className="mt-6 text-4xl font-semibold">{user?.name || "Student"}</h1>
              <p className="mt-2 text-sm text-white/80">{user?.email}</p>
              <span className="mt-5 rounded-full bg-white/18 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] backdrop-blur">
                {user?.role || "STUDENT"}
              </span>
            </div>

            <div className="mt-10 grid gap-3">
              <div className="grid gap-3">
                <Link
                  to="/marketplace"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-pine"
                >
                  <Plus size={16} />
                  Add Listing
                </Link>
                <Link
                  to="/events#create-event"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/85 px-5 py-3 text-sm font-semibold text-pine"
                >
                  <Plus size={16} />
                  Create Event
                </Link>
                <Link
                  to="/collaboration#create-collab"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/85 px-5 py-3 text-sm font-semibold text-pine"
                >
                  <Plus size={16} />
                  Post Collaboration
                </Link>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-2xl border border-white/55 px-5 py-3 text-sm font-semibold text-white"
              >
                Logout
              </button>
            </div>
          </aside>

          <div className="space-y-6">
            <section className="rounded-soft bg-white p-8 shadow-card sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine">
                Account Details
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <ProfileInfo icon={UserRound} label="Full Name" value={user?.name || "Not set"} />
                <ProfileInfo icon={Mail} label="Email" value={user?.email || "Not set"} />
                <ProfileInfo icon={ShieldCheck} label="Role" value={user?.role || "STUDENT"} />
                <ProfileInfo icon={CalendarDays} label="Joined" value={joinedDate} />
              </div>
            </section>

            <section className="rounded-soft bg-white p-8 shadow-card sm:p-10">
              <div className="flex flex-wrap items-center gap-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeTab === tab.key
                        ? "bg-pine text-white"
                        : "bg-cream text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {loadingError ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {loadingError}
                </div>
              ) : null}

              <div className="mt-8">
                {activeTab === "listings" ? (
                  <div className="space-y-4">
                    {myListings.length ? (
                      myListings.map((listing) => {
                        const isOwner = listing.owner?.id === user?.id;
                        const isSold = listing.status === "SOLD";

                        return (
                          <article key={listing.id} className="rounded-3xl border border-slate-100 bg-cream/45 p-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <p className="text-xl font-semibold text-slate-900">{listing.title}</p>
                                <p className="mt-2 text-sm text-slate-500">{listing.category}</p>
                              </div>
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                                {listing.status}
                              </span>
                            </div>
                            <p className="mt-4 text-sm leading-7 text-slate-600">{listing.description}</p>
                            <p className="mt-3 text-sm font-semibold text-slate-900">Rs {listing.price}</p>
                            <div className="mt-5 flex flex-wrap gap-3">
                              {isOwner ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(listing)}
                                    disabled={isSold}
                                    className="inline-flex items-center gap-2 rounded-xl bg-pine px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <Pencil size={15} />
                                    {isSold ? "Cannot Edit Sold" : "Edit"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteListing(listing.id)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-clay px-4 py-2 text-sm font-semibold text-clay"
                                  >
                                    <Trash2 size={15} />
                                    Delete
                                  </button>
                                </>
                              ) : null}
                              <Link
                                to={`/marketplace/${listing.id}`}
                                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                              >
                                View
                              </Link>
                            </div>
                          </article>
                        );
                      })
                    ) : (
                      <EmptyState text="You have not posted any listings yet." />
                    )}
                  </div>
                ) : null}

                {activeTab === "events" ? (
                  <div className="space-y-4">
                    {myEvents.length ? (
                      myEvents.map((event) => (
                        <article key={event.id} className="rounded-3xl border border-slate-100 bg-cream/45 p-5">
                          <p className="text-xl font-semibold text-slate-900">{event.title}</p>
                          <p className="mt-3 text-sm text-slate-600">{event.description}</p>
                          <p className="mt-3 text-sm font-medium text-slate-800">{event.location}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {new Date(event.dateTime).toLocaleString()}
                          </p>
                        </article>
                      ))
                    ) : (
                      <EmptyState text="You have not created any events yet." />
                    )}
                  </div>
                ) : null}

                {activeTab === "posts" ? (
                  <div className="space-y-4">
                    {myPosts.length ? (
                      myPosts.map((post) => (
                        <article key={post.id} className="rounded-3xl border border-slate-100 bg-cream/45 p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xl font-semibold text-slate-900">{post.title}</p>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                              {post.type}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-7 text-slate-600">{post.description}</p>
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              {new Date(post.createdAt).toLocaleString()}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleDeletePost(post.id)}
                              className="inline-flex items-center gap-2 rounded-xl border border-clay px-4 py-2 text-sm font-semibold text-clay"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                          </div>
                        </article>
                      ))
                    ) : (
                      <EmptyState text="You have not posted any collaboration requests yet." />
                    )}
                  </div>
                ) : null}

                {activeTab === "responses" ? (
                  <div className="space-y-4">
                    {interestError ? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        {interestError}
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                        Messages Received
                      </p>
                      {myResponses.length ? (
                        myResponses.map((message) => (
                          <article key={message.id} className="rounded-3xl border border-slate-100 bg-cream/45 p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine">
                                From {message.sender?.name || "Campus user"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(message.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <p className="mt-3 text-sm leading-7 text-slate-700">{message.content}</p>
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                {message.listingId ? `Listing #${message.listingId}` : "General message"}
                              </p>
                              <Link
                                to="/chat"
                                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                              >
                                Open Chat
                              </Link>
                            </div>
                          </article>
                        ))
                      ) : (
                        <EmptyState text="No received messages yet." />
                      )}
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                        Listing Interests
                      </p>
                      {myInterests.length ? (
                        myInterests.map((interest) => (
                          <article key={interest.id} className="rounded-3xl border border-slate-100 bg-cream/45 p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine">
                                {interest.interestedUser?.name || "Campus user"} showed interest
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(interest.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <p className="mt-3 text-sm leading-7 text-slate-700">
                              Listing: {interest.listingTitle || "Untitled listing"}
                            </p>
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                {interest.interestedUser?.email || "No contact"}
                              </p>
                              <Link
                                to={interest.listingId ? `/marketplace/${interest.listingId}` : "/marketplace"}
                                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                              >
                                View Listing
                              </Link>
                            </div>
                          </article>
                        ))
                      ) : (
                        <EmptyState text="No listing interests yet." />
                      )}
                    </div>

                    {!myResponses.length && !myInterests.length ? (
                      <EmptyState text="No responses yet. Messages and listing interests will appear here." />
                    ) : null}
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </section>
      </div>

      {editOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4">
          <div className="w-full max-w-2xl rounded-soft bg-white p-7 shadow-card">
            <h2 className="text-2xl font-semibold text-slate-900">Edit Listing</h2>
            <p className="mt-2 text-sm text-slate-500">
              Update your title, price, description, image, or category.
            </p>

            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleEditSubmit}>
              <input
                type="text"
                value={editForm.title}
                onChange={handleEditChange("title")}
                placeholder="Title"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                required
              />
              <input
                type="text"
                value={editForm.category}
                onChange={handleEditChange("category")}
                placeholder="Category"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                required
              />
              <textarea
                value={editForm.description}
                onChange={handleEditChange("description")}
                rows={4}
                placeholder="Description"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none md:col-span-2"
                required
              />
              <input
                type="number"
                min="1"
                step="0.01"
                value={editForm.price}
                onChange={handleEditChange("price")}
                placeholder="Price"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                required
              />
              <label className="w-full cursor-pointer rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600 md:col-span-2">
                <span className="block font-medium text-slate-700">Upload image</span>
                <span className="mt-1 block text-xs text-slate-500">
                  Replace the listing image by selecting a new file.
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageUpload}
                  className="mt-3 w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-pine file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
              </label>
              {editForm.imageUrl ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 md:col-span-2">
                  <img
                    src={editForm.imageUrl}
                    alt="Listing preview"
                    className="h-52 w-full object-cover"
                  />
                </div>
              ) : null}

              {editError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2">
                  {editError}
                </div>
              ) : null}

              <div className="mt-2 flex flex-wrap gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="rounded-xl bg-pine px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

        </div>
      ) : null}
    </main>
  );
}

function ProfileInfo({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-cream/45 p-5">
      <div className="flex items-center gap-3 text-pine">
        <Icon size={18} />
        <p className="text-xs font-semibold uppercase tracking-[0.25em]">{label}</p>
      </div>
      <p className="mt-4 break-words text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 px-5 py-8 text-sm text-slate-500">
      {text}
    </div>
  );
}
