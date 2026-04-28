import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "../components/BrandLogo";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-cream px-6 py-10 sm:px-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[32px] bg-[linear-gradient(160deg,#6B8F71_0%,#85A98A_45%,#D8A47F_100%)] p-8 text-white shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
            Welcome Back
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight">
            Rejoin your campus marketplace and student network.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/85">
            Sign in to manage listings, answer messages, join events, and pick up
            where your student community left off.
          </p>
        </div>

        <div className="rounded-soft bg-white p-8 shadow-card sm:p-10">
          <BrandLogo to="/" size={54} className="mb-6" />
          <h2 className="mt-4 text-3xl font-semibold text-slate-900">Login</h2>
          <p className="mt-2 text-sm text-slate-500">
            Use your campus account credentials to continue.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@campus.edu"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-pine"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-pine"
                required
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-pine px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            New here?{" "}
            <Link to="/register" className="font-semibold text-clay">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
