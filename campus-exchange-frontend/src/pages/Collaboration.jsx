import { useEffect, useState } from "react";
import { collaborationApi } from "../api/axios";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  title: "",
  description: "",
  type: "TEAM",
};

const typeClasses = {
  TEAM: "bg-pine text-white",
  HELP: "bg-clay text-white",
};

export default function Collaboration() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    collaborationApi
      .getAll()
      .then(({ data }) => {
        if (mounted) {
          setPosts(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setPosts([]);
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
      const { data } = await collaborationApi.create(form);
      setPosts((current) => [data, ...current]);
      setForm(initialForm);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId) => {
    await collaborationApi.remove(postId);
    setPosts((current) => current.filter((post) => post.id !== postId));
  };

  return (
    <main className="min-h-screen bg-cream px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <aside id="create-collab" className="rounded-soft bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine">
              Create Post
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900">
              Find teammates or ask for help
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Publish collaboration needs for projects, hackathons, clubs, or study groups.
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleCreate}>
              <input
                type="text"
                value={form.title}
                onChange={handleChange("title")}
                placeholder="Post title"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                required
              />
              <textarea
                value={form.description}
                onChange={handleChange("description")}
                placeholder="Describe what you need"
                rows={5}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                required
              />
              <select
                value={form.type}
                onChange={handleChange("type")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
              >
                <option value="TEAM">TEAM</option>
                <option value="HELP">HELP</option>
              </select>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-pine px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Publishing..." : "Create Post"}
              </button>
            </form>
          </aside>

          <div className="space-y-6">
            <div className="rounded-soft bg-white p-8 shadow-card">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine">
                Collaboration Feed
              </p>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Browse open collaboration requests from students across campus.
              </p>
              <a
                href="#create-collab"
                className="mt-6 inline-flex rounded-full bg-pine px-5 py-3 text-sm font-semibold text-white"
              >
                Add Collaboration Request
              </a>
            </div>

            {loading ? (
              <div className="rounded-soft bg-white px-6 py-10 text-sm text-slate-500 shadow-card">
                Loading collaboration posts...
              </div>
            ) : posts.length ? (
              posts.map((post) => {
                const isOwner = post.createdBy?.id === user?.id;

                return (
                  <article key={post.id} className="rounded-soft bg-white p-6 shadow-card">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            typeClasses[post.type] || "bg-slate-900 text-white"
                          }`}
                        >
                          {post.type}
                        </span>
                        <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                          {post.title}
                        </h2>
                      </div>
                      {isOwner ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(post.id)}
                          className="rounded-xl border border-clay px-4 py-2 text-sm font-semibold text-clay"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>

                    <p className="mt-4 text-sm leading-7 text-slate-600">{post.description}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span>{post.createdBy?.name || "Campus user"}</span>
                      <span>{new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-soft bg-white px-6 py-10 text-sm text-slate-500 shadow-card">
                No collaboration posts yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
