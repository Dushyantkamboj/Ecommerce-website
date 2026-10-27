import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from 'js-cookie';

const AdminLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
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

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/api_v1/admin/login",
        formData,
      );

      const result = response.data;

      console.log('result:',result);

      if(result.status){
        Cookies.set('accessToken',result.accessToken);
        Cookies.set('refreshToken',result.refreshToken);
        Cookies.set('name',result.name);
        Cookies.set('email',result.email);
        Cookies.set('type',result.type)

        navigate('/dashboard')

      }
    } catch (error) {
        console.log(error.message);
        
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 font-sans text-slate-800">

    
      <div className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12">
        <div className="w-full max-w-md">

      
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-indigo-600 text-white text-2xl font-extrabold shadow-lg shadow-indigo-200">
              S
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Shop<span className="text-indigo-600">Sphere</span>
            </h2>
          </div>

          <div className="mb-8">
            <p className="text-xs font-extrabold tracking-[0.2em] text-indigo-600 mb-3">
              ADMINISTRATOR PORTAL
            </p>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
              Welcome back
            </h1>

            <p className="text-sm leading-6 text-slate-500">
              Sign in to manage your e-commerce store.
            </p>
          </div>

        
          <form onSubmit={handleSubmit} className="space-y-6">

         
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="username"
                required
                className="w-full h-12 px-4 rounded-lg border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400"
              />
            </div>

          
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  className="w-full h-12 px-4 pr-16 rounded-lg border border-slate-200 bg-white text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

        
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in "}
              {!loading && <span className="text-lg">→</span>}
            </button>
          </form>

        
          <div className="mt-7 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
            <span>🔒</span>
            <span>Secure access for authorized administrators only</span>
          </div>

          <p className="mt-12 text-center text-xs text-slate-400">
            © 2026 ShopSphere. All rights reserved.
          </p>
        </div>
      </div>


      <div className="relative hidden lg:flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-indigo-600 px-12 py-16 text-white">

        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full border border-white/10" />

        <div className="pointer-events-none absolute -bottom-48 -right-40 h-[530px] w-[530px] rounded-full border border-white/10" />

     
        <div className="relative z-10 w-full max-w-md">

          <span className="inline-block rounded-md border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold tracking-[0.18em]">
            YOUR STORE. YOUR CONTROL.
          </span>

          <h2 className="mt-8 text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
            Everything you need to run your store.
          </h2>

          <p className="mt-5 mb-10 text-sm leading-7 text-indigo-100">
            Manage products, update inventory, and keep your e-commerce
            business running smoothly from one place.
          </p>

         
          <div className="flex items-center gap-4 mb-7">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-2xl">
              ↗
            </div>

            <div>
              <h3 className="text-sm font-bold">Product Management</h3>
              <p className="mt-1 text-xs leading-5 text-indigo-200">
                Add, edit, and organize your products.
              </p>
            </div>
          </div>

         
          <div className="flex items-center gap-4 mb-7">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-2xl">
              ✓
            </div>

            <div>
              <h3 className="text-sm font-bold">Inventory Control</h3>
              <p className="mt-1 text-xs leading-5 text-indigo-200">
                Keep track of your available stock.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-2xl">
              ⌘
            </div>

            <div>
              <h3 className="text-sm font-bold">One Central Dashboard</h3>
              <p className="mt-1 text-xs leading-5 text-indigo-200">
                Keep your store operations organized.
              </p>
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

export default AdminLogin;
