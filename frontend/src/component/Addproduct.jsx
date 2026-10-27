
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  AlertCircle,
  Box,
  CheckCircle2,
  CircleCheck,
  CloudUpload,
  ImagePlus,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Package,
  Plus,
  ReceiptText,
  RotateCcw,
  ShoppingBag,
  Trash2,
  Users,
  X,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Tag,
  Boxes,
  IndianRupee,
  PackageCheck,
} from "lucide-react";

const AddProduct = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const adminName = Cookies.get("name");

  const [formData, setFormData] = useState({
    productname: "",
    category: "",
    description: "",
    price: "",
    stock: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(image);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const selectImage = (file) => {
    setError("");
    setSuccess("");

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    setImage(file);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    selectImage(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    selectImage(e.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    setImage(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setFormData({
      productname: "",
      category: "",
      description: "",
      price: "",
      stock: "",
    });

    setImage(null);
    setError("");
    setSuccess("");

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleLogout = () => {
    ["type", "name", "accessToken", "refreshToken", "email"].forEach((key) =>
      Cookies.remove(key),
    );
    navigate("/adminlogin", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.productname.trim().length < 2) {
      setError("Product name must contain at least 2 characters.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a product description.");
      return;
    }

    if (!image) {
      setError("Please select a product image.");
      return;
    }

    const price = Number(formData.price);
    const stock = Number(formData.stock);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Price must be greater than zero.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a whole number greater than or equal to zero.");
      return;
    }

    const token = Cookies.get("accessToken");

    if (!token) {
      setError("Please log in as an admin first.");
      return;
    }

    const data = new FormData();
    data.append("productname", formData.productname.trim());
    data.append("description", formData.description.trim());
    data.append("price", String(price));
    data.append("stock", String(stock));
    data.append("image", image);

    if (formData.category.trim()) {
      data.append("category", formData.category.trim());
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/api_v1/product/add",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data?.status === 0 || response.data?.status === false) {
        setError(response.data?.message || "Unable to add product.");
        return;
      }

      setSuccess("Product added successfully!");
      resetForm();

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (err) {
      console.error("Add product error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to add product. Please check your backend.",
      );
    } finally {
      setLoading(false);
    }
  };

  const priceValue = Number(formData.price);
  const stockValue = Number(formData.stock);

  const checklist = [
    { label: "Product name", done: formData.productname.trim().length >= 2 },
    { label: "Description", done: Boolean(formData.description.trim()) },
    {
      label: "Price and stock",
      done:
        formData.price !== "" &&
        priceValue > 0 &&
        formData.stock !== "" &&
        Number.isInteger(stockValue) &&
        stockValue >= 0,
    },
    { label: "Product image", done: Boolean(image) },
  ];

  const completed = checklist.filter((item) => item.done).length;

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";

  const labelClass =
    "mb-2 block text-sm font-semibold tracking-wide text-slate-700";

  const navLinkClass =
    "group flex items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition-all duration-300 hover:translate-x-1 hover:bg-white/10 hover:text-white 2xl:justify-start";

  return (
    <div className="min-h-screen bg-[#f5f7fc] text-slate-800 selection:bg-indigo-100 selection:text-indigo-700 lg:flex">
      {/* Sidebar */}
      <aside className="relative z-30 hidden w-[76px] shrink-0 flex-col overflow-hidden bg-[#10162b] shadow-2xl shadow-slate-900/10 lg:flex 2xl:w-[260px]">
        <div className="pointer-events-none absolute -right-20 top-20 h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />

        <Link
          to="/dashboard"
          className="relative flex h-[84px] items-center justify-center gap-3 border-b border-white/[0.08] px-4 2xl:justify-start 2xl:px-6"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 text-slate-950 shadow-lg shadow-orange-500/20 transition duration-300 hover:rotate-6 hover:scale-110">
            <ShoppingBag size={22} strokeWidth={2.5} />
          </span>
          <div className="hidden leading-tight 2xl:block">
            <strong className="block text-lg font-extrabold tracking-tight text-white">
              Store<span className="text-amber-300">Admin</span>
            </strong>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Seller workspace
            </span>
          </div>
        </Link>

        <div className="relative px-3 pb-2 pt-7 2xl:px-5">
          <p className="mb-3 hidden px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 2xl:block">
            Workspace
          </p>

          <nav className="space-y-2" aria-label="Admin navigation">
            <Link to="/dashboard" title="Products" className={navLinkClass}>
              <LayoutDashboard
                size={19}
                className="shrink-0 transition group-hover:scale-110"
              />
              <span className="hidden 2xl:inline">Products</span>
            </Link>

            <div
              aria-current="page"
              title="Add product"
              className="relative flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 2xl:justify-start"
            >
              <span className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-amber-300" />
              <Plus size={19} className="shrink-0" />
              <span className="hidden 2xl:inline">Add product</span>
              <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-amber-300 2xl:block" />
            </div>

            <Link
              to="/adminpurchasehistory"
              title="Purchase history"
              className={navLinkClass}
            >
              <ReceiptText
                size={19}
                className="shrink-0 transition group-hover:scale-110"
              />
              <span className="hidden 2xl:inline">Purchase history</span>
            </Link>

            <Link to="/userdetails" title="Customers" className={navLinkClass}>
              <Users
                size={19}
                className="shrink-0 transition group-hover:scale-110"
              />
              <span className="hidden 2xl:inline">Customers</span>
            </Link>
          </nav>
        </div>

        <div className="relative mt-auto p-3 2xl:p-5">
          <div className="mb-4 hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 2xl:block">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={17} className="text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">
                Admin workspace
              </span>
            </div>
            <p className="text-xs leading-5 text-slate-500">
              Manage your products and keep your store up to date.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className={`${navLinkClass} w-full hover:bg-rose-500/10 hover:text-rose-300`}
          >
            <LogOut size={19} className="shrink-0" />
            <span className="hidden 2xl:inline">Sign out</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 shadow-sm shadow-slate-200/30 backdrop-blur-xl">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-7 xl:px-10">
            <div className="flex min-w-0 items-center gap-3 lg:gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 lg:hidden">
                <ShoppingBag size={22} />
              </div>
              <div className="min-w-0">
                <p className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">
                  Store management
                </p>
                <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900 sm:mt-0.5 sm:text-xl">
                  Add product
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 sm:flex">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-700">
                  Store workspace
                </span>
              </div>

              <div className="flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-extrabold uppercase text-white shadow-lg shadow-indigo-600/20">
                  {adminName?.charAt(0) || "A"}
                </div>
                <div className="hidden leading-tight sm:block">
                  <p className="max-w-36 truncate text-sm font-bold text-slate-800">
                    {adminName || "Admin"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Administrator</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Logout"
                  title="Logout"
                  className="ml-1 grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 lg:hidden"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile navigation */}
          <nav
            aria-label="Admin navigation"
            className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-3 lg:hidden"
          >
            <Link
              to="/dashboard"
              className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <LayoutDashboard size={16} />
              Products
            </Link>
            <span className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20">
              <Plus size={16} />
              Add product
            </span>
            <Link
              to="/adminpurchasehistory"
              className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <ReceiptText size={16} />
              Purchases
            </Link>
            <Link
              to="/userdetails"
              className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <Users size={16} />
              Customers
            </Link>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-[1550px] flex-1 px-4 py-6 sm:px-7 sm:py-8 xl:px-10">
          {/* Hero */}
          <section className="relative mb-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#171d3b] via-[#292c68] to-[#5145b8] p-6 text-white shadow-2xl shadow-indigo-900/15 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border-[36px] border-white/[0.06]" />
            <div className="pointer-events-none absolute -bottom-32 right-36 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
            <div className="pointer-events-none absolute right-[23%] top-8 h-16 w-16 rotate-12 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm" />
            <div className="pointer-events-none absolute bottom-8 right-12 h-10 w-10 -rotate-12 rounded-xl border border-white/10 bg-white/[0.06]" />

            <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.09] px-3 py-1.5 text-xs font-semibold text-indigo-100 backdrop-blur-md">
                  <Sparkles size={14} className="text-amber-300" />
                  PRODUCT MANAGEMENT
                </div>

                <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
                  Bring a new product
                  <br className="hidden sm:block" /> to your store.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-indigo-100/80 sm:text-base sm:leading-7">
                  Create a beautiful product listing with clear details, great
                  imagery, and accurate inventory information.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 backdrop-blur-md">
                    <ShieldCheck size={17} className="text-emerald-300" />
                    <span className="text-xs font-medium text-white/90">
                      Secure product creation
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 backdrop-blur-md">
                    <ImagePlus size={17} className="text-amber-300" />
                    <span className="text-xs font-medium text-white/90">
                      Live product preview
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative hidden shrink-0 md:block">
                <div className="absolute inset-0 rounded-[32px] bg-indigo-300/20 blur-2xl" />
                <div className="relative grid h-40 w-40 rotate-3 place-items-center rounded-[32px] border border-white/20 bg-gradient-to-br from-white/20 to-white/[0.04] shadow-2xl backdrop-blur-xl transition duration-500 hover:rotate-0 hover:scale-105 lg:h-48 lg:w-48">
                  <div className="grid h-24 w-24 place-items-center rounded-[28px] bg-gradient-to-br from-amber-300 to-orange-400 text-slate-900 shadow-xl shadow-orange-950/20 lg:h-28 lg:w-28">
                    <Package size={54} strokeWidth={1.5} />
                  </div>
                  <span className="absolute -right-3 top-5 grid h-10 w-10 place-items-center rounded-2xl bg-emerald-400 text-white shadow-lg">
                    <CheckCircle2 size={21} />
                  </span>
                  <span className="absolute -bottom-3 -left-3 grid h-11 w-11 place-items-center rounded-2xl border border-white/20 bg-white/15 text-white backdrop-blur-xl">
                    <Plus size={23} />
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Breadcrumb and progress */}
          <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <nav
                aria-label="Breadcrumb"
                className="mb-3 flex items-center gap-2 text-sm text-slate-400"
              >
                <Link
                  to="/dashboard"
                  className="font-medium transition hover:text-indigo-600"
                >
                  Products
                </Link>
                <span>/</span>
                <span className="font-semibold text-indigo-600">
                  Add product
                </span>
              </nav>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Product details
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Complete the required fields to publish your new listing.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm sm:min-w-60">
              <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                <span className="text-sm font-extrabold">
                  {completed}/{checklist.length}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800">
                  Listing progress
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                    style={{
                      width: `${(completed / checklist.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 shadow-sm"
            >
              <span className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-rose-100">
                  <AlertCircle size={18} />
                </span>
                <span className="pt-1 leading-6">{error}</span>
              </span>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
                className="rounded-lg p-1.5 transition hover:bg-rose-100"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-sm"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-100">
                <CheckCircle2 size={20} />
              </span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 items-start gap-7 xl:grid-cols-[minmax(0,1fr)_370px]">
              {/* Main form */}
              <div className="min-w-0 space-y-6">
                {/* Basic information */}
                <section className="group overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-900/[0.05]">
                  <div className="flex items-center gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-indigo-50/50 px-5 py-5 sm:px-7">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-100 text-indigo-600 transition duration-300 group-hover:rotate-3 group-hover:scale-105">
                      <Package size={23} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Basic information
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                        Give your product a name and tell customers about it.
                      </p>
                    </div>
                    <span className="ml-auto hidden rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 sm:inline-flex">
                      Step 01
                    </span>
                  </div>

                  <div className="space-y-6 p-5 sm:p-7">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <label htmlFor="productname" className={labelClass}>
                          Product name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="productname"
                          type="text"
                          name="productname"
                          value={formData.productname}
                          onChange={handleChange}
                          placeholder="e.g. Wireless headphones"
                          minLength={2}
                          maxLength={150}
                          required
                          className={inputClass}
                        />
                        <div className="mt-2 flex justify-between gap-2 text-xs">
                          <span className="text-slate-400">
                            Choose a clear, specific name.
                          </span>
                          <span className="shrink-0 font-medium tabular-nums text-slate-400">
                            {formData.productname.length}/150
                          </span>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="category" className={labelClass}>
                          Category{" "}
                          <span className="font-normal text-slate-400">
                            (optional)
                          </span>
                        </label>
                        <div className="relative">
                          <Tag
                            size={17}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            id="category"
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="e.g. Electronics"
                            maxLength={60}
                            className={`${inputClass} pl-11`}
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-400">
                          Helps customers discover similar products.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className={labelClass}>
                        Product description{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the key features, materials, dimensions and what is included with this product..."
                        rows={5}
                        maxLength={1000}
                        required
                        className={`${inputClass} min-h-36 resize-y leading-6`}
                      />
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-400">
                          Keep it clear and useful for your customers.
                        </span>
                        <span className="shrink-0 text-xs font-medium tabular-nums text-slate-400">
                          {formData.description.length}/1000
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Price and stock */}
                <section className="group overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-900/[0.05]">
                  <div className="flex items-center gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-emerald-50/50 px-5 py-5 sm:px-7">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 transition duration-300 group-hover:rotate-3 group-hover:scale-105">
                      <IndianRupee size={23} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Pricing and inventory
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                        Set your selling price and available quantity.
                      </p>
                    </div>
                    <span className="ml-auto hidden rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 sm:inline-flex">
                      Step 02
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-6 p-5 sm:p-7 md:grid-cols-2">
                    <div>
                      <label htmlFor="price" className={labelClass}>
                        Selling price <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                          ₹
                        </span>
                        <input
                          id="price"
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="0.00"
                          min="0.01"
                          step="0.01"
                          required
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                        <Sparkles size={13} className="text-amber-500" />
                        You can apply a discount later.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="stock" className={labelClass}>
                        Stock quantity{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Boxes
                          size={17}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          id="stock"
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleChange}
                          placeholder="e.g. 25"
                          min="0"
                          step="1"
                          required
                          className={`${inputClass} pl-11`}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        Enter the number of units available to sell.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Image upload */}
                <section className="group overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40 transition-all duration-300 hover:-translate-y-1 hover:border-violet-100 hover:shadow-xl hover:shadow-violet-900/[0.05]">
                  <div className="flex items-center gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-violet-50/50 px-5 py-5 sm:px-7">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700 transition duration-300 group-hover:rotate-3 group-hover:scale-105">
                      <ImagePlus size={23} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Product image{" "}
                        <span className="text-rose-500">*</span>
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                        Add a clear image to make your listing stand out.
                      </p>
                    </div>
                    <span className="ml-auto hidden rounded-full bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700 sm:inline-flex">
                      Step 03
                    </span>
                  </div>

                  <div className="p-5 sm:p-7">
                    <input
                      ref={fileInputRef}
                      id="image"
                      type="file"
                      name="image"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    {preview ? (
                      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-5">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                          <div className="relative grid h-48 w-full shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-inner sm:h-36 sm:w-36">
                            <img
                              src={preview}
                              alt="Selected product"
                              className="h-full w-full object-contain p-3"
                            />
                            <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-white shadow-lg">
                              <CheckCircle2 size={16} />
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                              <PackageCheck
                                size={19}
                                className="shrink-0 text-emerald-600"
                              />
                              Image ready to upload
                            </p>
                            <p className="mt-2 break-all text-sm text-slate-500">
                              {image?.name}
                            </p>
                            <div className="mt-2 inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              {image
                                ? `${(image.size / (1024 * 1024)).toFixed(2)} MB`
                                : ""}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                              >
                                <ImagePlus size={16} />
                                Change image
                              </button>
                              <button
                                type="button"
                                onClick={removeImage}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-100"
                              >
                                <Trash2 size={16} />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        className={`group/upload relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-5 py-12 text-center transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                          dragging
                            ? "scale-[1.01] border-indigo-500 bg-indigo-50"
                            : "border-slate-200 bg-gradient-to-b from-slate-50/80 to-white hover:border-indigo-400 hover:bg-indigo-50/40"
                        }`}
                      >
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06),transparent_65%)] opacity-0 transition group-hover/upload:opacity-100" />
                        <span className="relative grid h-16 w-16 place-items-center rounded-[22px] bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/25 transition duration-300 group-hover/upload:-translate-y-1 group-hover/upload:rotate-3 group-hover/upload:scale-110">
                          <CloudUpload size={30} />
                        </span>
                        <p className="relative mt-5 text-base font-bold text-slate-800">
                          {dragging
                            ? "Drop your image here"
                            : "Drag and drop your image"}
                        </p>
                        <p className="relative mt-2 text-sm text-slate-500">
                          or{" "}
                          <span className="font-bold text-indigo-600 underline decoration-indigo-300 underline-offset-4">
                            browse files
                          </span>{" "}
                          from your computer
                        </p>
                        <div className="relative mt-5 flex flex-wrap justify-center gap-2">
                          {["JPG", "PNG", "WebP"].map((type) => (
                            <span
                              key={type}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-500 shadow-sm"
                            >
                              {type}
                            </span>
                          ))}
                          <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-500 shadow-sm">
                            MAX 5 MB
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Actions */}
                <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={loading}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                    >
                      <RotateCcw size={17} />
                      Clear form
                    </button>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        disabled={loading}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                      >
                        <ArrowLeft size={16} />
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="group/submit relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition duration-300 hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500 hover:shadow-xl hover:shadow-indigo-600/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                      >
                        <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover/submit:translate-x-[120%]" />
                        <span className="relative inline-flex items-center gap-2">
                          {loading ? (
                            <>
                              <LoaderCircle
                                size={18}
                                className="animate-spin"
                              />
                              Adding product...
                            </>
                          ) : (
                            <>
                              <Plus size={19} strokeWidth={2.5} />
                              Add product
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <aside className="space-y-6 xl:sticky xl:top-24">
                {/* Live preview */}
                <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-lg shadow-slate-200/30 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-900/[0.06]">
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#171d3b] via-[#292c68] to-[#5145b8] px-5 py-5 text-white">
                    <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full border-[18px] border-white/[0.07]" />
                    <div className="relative flex items-center justify-between gap-3">
                      <div>
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-100">
                          <Sparkles size={12} />
                          Live preview
                        </div>
                        <h3 className="text-lg font-extrabold">
                          Your product card
                        </h3>
                        <p className="mt-1 text-xs text-indigo-100/75">
                          Updates as you type.
                        </p>
                      </div>
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md">
                        <ShoppingBag size={21} />
                      </div>
                    </div>
                  </div>

                  <article className="p-4 sm:p-5">
                    <div className="group/image relative grid h-56 place-items-center overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.07),transparent_70%)]" />
                      {preview ? (
                        <img
                          src={preview}
                          alt="Product preview"
                          className="relative h-full w-full object-contain p-5 transition duration-500 group-hover/image:scale-105"
                        />
                      ) : (
                        <div className="relative flex flex-col items-center gap-3 text-slate-300">
                          <div className="grid h-20 w-20 place-items-center rounded-[26px] bg-white shadow-lg shadow-slate-200/70">
                            <Box size={42} strokeWidth={1.2} />
                          </div>
                          <span className="text-xs font-medium text-slate-400">
                            Product image preview
                          </span>
                        </div>
                      )}
                      {formData.category.trim() && (
                        <span className="absolute left-3 top-3 max-w-[75%] truncate rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 shadow-sm backdrop-blur">
                          {formData.category.trim()}
                        </span>
                      )}
                    </div>

                    <div className="pt-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                            {formData.category.trim() || "Your category"}
                          </p>
                          <h4 className="mt-2 min-h-12 break-words text-base font-extrabold leading-6 text-slate-900">
                            {formData.productname.trim() ||
                              "Your product name"}
                          </h4>
                        </div>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-400">
                          <ShoppingBag size={17} />
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-3 min-h-[54px] text-xs leading-5 text-slate-500">
                        {formData.description.trim() ||
                          "Your product description will appear here to help customers understand your product."}
                      </p>

                      <div className="my-4 border-t border-dashed border-slate-200" />

                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Selling price
                          </p>
                          <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                            ₹
                            {formData.price !== "" &&
                            Number.isFinite(priceValue)
                              ? priceValue.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : "0.00"}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${
                            formData.stock === ""
                              ? "bg-slate-100 text-slate-500"
                              : stockValue <= 0
                                ? "bg-rose-50 text-rose-600"
                                : stockValue <= 5
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              formData.stock === ""
                                ? "bg-slate-400"
                                : stockValue <= 0
                                  ? "bg-rose-500"
                                  : stockValue <= 5
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                            }`}
                          />
                          {formData.stock === ""
                            ? "Stock unset"
                            : stockValue <= 0
                              ? "Out of stock"
                              : stockValue <= 5
                                ? `${stockValue} left`
                                : "In stock"}
                        </span>
                      </div>

                      <div className="mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-600/20">
                        <ShoppingBag size={17} />
                        Add to cart
                      </div>
                      <p className="mt-3 text-center text-[10px] text-slate-400">
                        Preview only — not visible to customers yet
                      </p>
                    </div>
                  </article>
                </section>

                {/* Checklist */}
                <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Publishing checklist
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Get your listing ready.
                      </p>
                    </div>
                    <span
                      className={`rounded-xl px-3 py-2 text-xs font-extrabold ${
                        completed === checklist.length
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-indigo-50 text-indigo-700"
                      }`}
                    >
                      {completed}/{checklist.length}
                    </span>
                  </div>

                  <div
                    className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={checklist.length}
                    aria-valuenow={completed}
                    aria-label="Required fields completed"
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        completed === checklist.length
                          ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                          : "bg-gradient-to-r from-indigo-500 to-violet-500"
                      }`}
                      style={{
                        width: `${(completed / checklist.length) * 100}%`,
                      }}
                    />
                  </div>

                  <ul className="mt-5 space-y-3">
                    {checklist.map((item, index) => (
                      <li
                        key={item.label}
                        className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-300 ${
                          item.done
                            ? "border-emerald-100 bg-emerald-50/60"
                            : "border-slate-100 bg-slate-50/70"
                        }`}
                      >
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
                            item.done
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-white text-slate-400 shadow-sm"
                          }`}
                        >
                          {item.done ? (
                            <CircleCheck size={18} />
                          ) : (
                            <span className="text-xs font-bold">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          )}
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            item.done ? "text-emerald-800" : "text-slate-600"
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.done && (
                          <CheckCircle2
                            size={16}
                            className="ml-auto shrink-0 text-emerald-600"
                          />
                        )}
                      </li>
                    ))}
                  </ul>

                  {completed === checklist.length && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={16} />
                      Everything is ready to submit!
                    </div>
                  )}
                </section>

                {/* Listing tips */}
                <section className="relative overflow-hidden rounded-[24px] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-200/30 blur-2xl" />
                  <div className="relative flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 text-white shadow-lg shadow-amber-500/20">
                      <Sparkles size={21} />
                    </span>
                    <div>
                      <h3 className="font-extrabold text-slate-900">
                        Tips for a great listing
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Small details make a difference.
                      </p>
                    </div>
                  </div>

                  <ul className="relative mt-5 space-y-3">
                    {[
                      "Use a specific and easy-to-understand product name.",
                      "Choose a clear image with a simple background.",
                      "Mention important features and what is included.",
                    ].map((tip, index) => (
                      <li key={tip} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-100 text-[10px] font-extrabold text-amber-700">
                          {index + 1}
                        </span>
                        <span className="text-xs leading-5 text-slate-600">
                          {tip}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              </aside>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-2 border-t border-slate-200/80 py-6 text-center">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <ShieldCheck size={15} className="text-emerald-600" />
                Your product information is submitted securely.
              </div>
              <p className="text-[11px] text-slate-400">
                Fields marked with{" "}
                <span className="font-bold text-rose-500">*</span> are required.
              </p>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddProduct;
