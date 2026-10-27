import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ShoppingBag, Mail, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/api_v1/user/login",
        formData
      );

      const result = response.data;
      console.log('result:',result);

      if(result.status){
        Cookies.set('accessToken',result.accessToken);
        Cookies.set('refreshToken',result.refreshToken);
        Cookies.set('name',result.name)
        Cookies.set('email',result.email)
        Cookies.set('type',result.type)
        navigate('/')
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-slate-950 p-10 text-white md:flex">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500 p-3">
              <ShoppingBag size={26} />
            </div>
            <span className="text-xl font-bold">Your Store</span>
          </div>

          <div>
            <h1 className="text-4xl font-extrabold leading-tight">
              Welcome back.
              <span className="mt-2 block text-blue-400">
                Find what you love.
              </span>
            </h1>
            <p className="mt-5 leading-7 text-slate-300">
              Sign in to your account to add products to your cart
              and continue shopping.
            </p>
          </div>

          <p className="text-sm text-slate-400">
            Your next favorite product is waiting for you.
          </p>
        </div>

        <div className="p-7 sm:p-10">
          <div className="mb-8 md:hidden">
            <div className="mb-4 inline-flex rounded-xl bg-blue-600 p-3 text-white">
              <ShoppingBag size={26} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Your Store
            </h1>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900">
            Login
          </h2>
          <p className="mt-2 text-slate-500">
            Enter your account details to continue.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-12 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-blue-600 hover:text-blue-700"
            >
              Register here
            </Link>
          </p>

          <p className="mt-5 text-center">
            <Link
              to="/products"
              className="text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              Continue browsing products
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;