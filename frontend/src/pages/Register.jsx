
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const UserRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    age: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Required field validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.phone.trim() ||
      !formData.age
    ) {
      setError("Please fill in all fields.");
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/api_v1/user/register",
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          age: Number(formData.age),
        }
      );

      const result = response.data;

      if (result.status !== 1) {
        setError(result.message || "Admin registration failed.");
        return;
      }

      setSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-12 px-4 rounded-lg border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400";

  const labelClass =
    "block text-sm font-semibold text-slate-700 mb-2";

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 font-sans text-slate-800">
      {/* REGISTER FORM */}
      <div className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12">
        <div className="w-full max-w-md">
          {/* BRAND */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-indigo-600 text-white text-2xl font-extrabold shadow-lg shadow-indigo-200">
              S
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Shop<span className="text-indigo-600">Sphere</span>
            </h2>
          </div>

          {/* HEADING */}
          <div className="mb-7">
            <p className="text-xs font-extrabold tracking-[0.2em] text-indigo-600 mb-3">
              ADMINISTRATOR PORTAL
            </p>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
              Create account
            </h1>

            <p className="text-sm leading-6 text-slate-500">
              Enter your details to register your administrator account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* NAME */}
            <div>
              <label htmlFor="name" className={labelClass}>
                Full name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
                className={inputClass}
              />
            </div>

            {/* EMAIL */}
            <div>
              <label htmlFor="email" className={labelClass}>
                Email address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>

            {/* PHONE */}
            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone number
              </label>

              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                required
                className={inputClass}
              />
            </div>

            {/* AGE */}
            <div>
              <label htmlFor="age" className={labelClass}>
                Age
              </label>

              <input
                id="age"
                type="number"
                name="age"
                placeholder="Enter your age"
                value={formData.age}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={6}
                  required
                  className={`${inputClass} pr-16`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div
                role="status"
                className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              >
                {success}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <span className="text-lg">→</span>}
            </button>
          </form>

          {/* LOGIN LINK */}
          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/admin/login"
              className="font-bold text-indigo-600 hover:text-indigo-800"
            >
              Sign in
            </Link>
          </p>

          {/* SECURITY NOTE */}
          <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
            <span>🔒</span>
            <span>Secure access for authorized administrators only</span>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            © 2026 ShopSphere. All rights reserved.
          </p>
        </div>
      </div>

      {/* RIGHT INFORMATION PANEL */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-indigo-600 px-12 py-16 text-white">
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full border border-white/10" />

        <div className="pointer-events-none absolute -bottom-48 -right-40 h-[530px] w-[530px] rounded-full border border-white/10" />

        <div className="relative z-10 w-full max-w-md">
          <span className="inline-block rounded-md border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold tracking-[0.18em]">
            MANAGE YOUR BUSINESS
          </span>

          <h2 className="mt-8 text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
            Your store starts here.
          </h2>

          <p className="mt-5 mb-10 text-sm leading-7 text-indigo-100">
            Manage products, monitor inventory, and organize your online
            store from one place.
          </p>

          <div className="space-y-7">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-2xl">
                +
              </div>

              <div>
                <h3 className="text-sm font-bold">Manage Products</h3>
                <p className="mt-1 text-xs leading-5 text-indigo-200">
                  Add, update, and remove products.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-2xl">
                ✓
              </div>

              <div>
                <h3 className="text-sm font-bold">Control Inventory</h3>
                <p className="mt-1 text-xs leading-5 text-indigo-200">
                  Keep product stock organized.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-2xl">
                ⌘
              </div>

              <div>
                <h3 className="text-sm font-bold">Centralized Dashboard</h3>
                <p className="mt-1 text-xs leading-5 text-indigo-200">
                  Manage your store from one place.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 w-full text-center text-[9px] tracking-[0.2em] text-indigo-200">
          BUILT FOR BETTER STORE MANAGEMENT
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
