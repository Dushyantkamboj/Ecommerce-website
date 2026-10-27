import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  Package,
  Boxes,
  CircleAlert,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  LayoutDashboard,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  IndianRupee,
  SlidersHorizontal,
  PackageSearch,
  LoaderCircle,
  TrendingUp,
  Users,
  ReceiptText,
  LogOut,
  ArrowUpRight,
  Sparkles,
  Tag,
  ChevronDown,
  BarChart3,
  Layers3,
  ShieldCheck,
  Activity,
} from "lucide-react";

const BASE_URL = "http://localhost:3000";
const PRODUCT_URL = `${BASE_URL}/api_v1/product/list`;

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return `${BASE_URL}/${imagePath.replace(/^\/+/, "")}`;
};

const Thumb = ({ product }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [product.image]);

  return (
    <div className="group/thumb relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-100 shadow-sm transition duration-500 group-hover:shadow-md">
      {product.image && !failed ? (
        <img
          src={getImageUrl(product.image)}
          alt={product.name || "Product"}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-110"
        />
      ) : (
        <Package size={27} className="text-slate-300" />
      )}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const token = Cookies.get("accessToken");
  const adminName = Cookies.get("name") || "Admin";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [savingDiscountId, setSavingDiscountId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [discountValues, setDiscountValues] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!token) {
      setError("Please log in to access the admin dashboard.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(PRODUCT_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      const productList =
        data?.data?.products ??
        data?.data ??
        data?.products ??
        [];

      setProducts(Array.isArray(productList) ? productList : []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(
        err.response?.data?.message || "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleLogout = () => {
    ["type", "name", "accessToken", "refreshToken", "email"].forEach(
      (key) => Cookies.remove(key)
    );
    navigate("/adminlogin", { replace: true });
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setNotice("");

      await axios.delete(
        `${BASE_URL}/api_v1/product/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts((previous) =>
        previous.filter((product) => product.id !== id)
      );

      setNotice("Product deleted successfully.");
    } catch (err) {
      console.error("Delete error:", err);
      setError(
        err.response?.data?.message || "Unable to delete product."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdate = (id) => navigate(`/updateproduct/${id}`);

  const categories = useMemo(
    () => [
      ...new Set(
        products.map((product) => product.category).filter(Boolean)
      ),
    ],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const text = `${product.name || ""} ${
        product.description || ""
      } ${product.id || ""} ${product.category || ""}`.toLowerCase();

      const stock = Number(product.stock) || 0;

      const matchesSearch = text.includes(query);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && stock > 5) ||
        (stockFilter === "low-stock" && stock > 0 && stock <= 5) ||
        (stockFilter === "out-of-stock" && stock <= 0);

      const matchesCategory =
        categoryFilter === "all" ||
        product.category === categoryFilter;

      return matchesSearch && matchesStock && matchesCategory;
    });
  }, [products, search, stockFilter, categoryFilter]);

  const totalStock = products.reduce(
    (sum, product) => sum + (Number(product.stock) || 0),
    0
  );

  const outOfStock = products.filter(
    (product) => Number(product.stock) <= 0
  ).length;

  const lowStock = products.filter((product) => {
    const stock = Number(product.stock) || 0;
    return stock > 0 && stock <= 5;
  }).length;

  const totalValue = products.reduce(
    (sum, product) =>
      sum +
      (Number(product.price) || 0) *
        (Number(product.stock) || 0),
    0
  );

  const activeDiscounts = products.filter(
    (product) => Number(product.discountPercentage || 0) > 0
  ).length;

  const handleDiscountChange = (id, value) => {
    setDiscountValues((previous) => ({
      ...previous,
      [id]: value,
    }));
  };

  const handleApplyDiscount = async (product) => {
    const inputValue =
      discountValues[product.id] ??
      String(product.discountPercentage ?? 0);

    if (inputValue.trim() === "") {
      setError("Please enter a discount percentage.");
      setNotice("");
      return;
    }

    const discount = Number(inputValue);

    if (
      !Number.isFinite(discount) ||
      discount < 0 ||
      discount > 100
    ) {
      setError("Discount must be between 0 and 100.");
      setNotice("");
      return;
    }

    if (!token) {
      setError("Please log in again.");
      return;
    }

    try {
      setSavingDiscountId(product.id);
      setError("");
      setNotice("");

      const response = await axios.patch(
        `${BASE_URL}/api_v1/admin/discount/${product.id}`,
        { discountPercentage: discount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedProduct = response.data?.data;

      setProducts((previous) =>
        previous.map((item) =>
          item.id === product.id
            ? {
                ...item,
                ...(updatedProduct &&
                typeof updatedProduct === "object"
                  ? updatedProduct
                  : {}),
                discountPercentage: discount,
              }
            : item
        )
      );

      setDiscountValues((previous) => ({
        ...previous,
        [product.id]: String(discount),
      }));

      setNotice("Product discount updated successfully.");
    } catch (err) {
      console.error("Discount update error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to update product discount."
      );
    } finally {
      setSavingDiscountId(null);
    }
  };

  const handleRemoveDiscount = async (product) => {
    if (Number(product.discountPercentage || 0) === 0) {
      setNotice("This product has no active discount.");
      setError("");
      return;
    }

    if (
      !window.confirm(
        `Remove the discount from "${product.name}"?`
      )
    ) {
      return;
    }

    try {
      setSavingDiscountId(product.id);
      setError("");
      setNotice("");

      await axios.delete(
        `${BASE_URL}/api_v1/admin/discount/${product.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts((previous) =>
        previous.map((item) =>
          item.id === product.id
            ? { ...item, discountPercentage: 0 }
            : item
        )
      );

      setDiscountValues((previous) => ({
        ...previous,
        [product.id]: "0",
      }));

      setNotice("Product discount removed successfully.");
    } catch (err) {
      console.error("Remove discount error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to remove product discount."
      );
    } finally {
      setSavingDiscountId(null);
    }
  };

  const hasFilters =
    search !== "" ||
    stockFilter !== "all" ||
    categoryFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setStockFilter("all");
    setCategoryFilter("all");
  };

  const stats = [
    {
      title: "Total products",
      value: products.length.toLocaleString("en-IN"),
      subtitle: "Products in your catalog",
      icon: Package,
      color: "blue",
      accent: "from-blue-600 to-indigo-600",
      iconStyle: "bg-blue-100 text-blue-700",
    },
    {
      title: "Inventory units",
      value: totalStock.toLocaleString("en-IN"),
      subtitle: "Units across all products",
      icon: Boxes,
      color: "violet",
      accent: "from-violet-600 to-purple-600",
      iconStyle: "bg-violet-100 text-violet-700",
    },
    {
      title: "Low stock",
      value: lowStock.toLocaleString("en-IN"),
      subtitle: "Products with 1–5 units",
      icon: TrendingUp,
      color: "amber",
      accent: "from-amber-500 to-orange-500",
      iconStyle: "bg-amber-100 text-amber-700",
    },
    {
      title: "Out of stock",
      value: outOfStock.toLocaleString("en-IN"),
      subtitle: "Products to restock",
      icon: CircleAlert,
      color: "rose",
      accent: "from-rose-500 to-pink-600",
      iconStyle: "bg-rose-100 text-rose-700",
    },
    {
      title: "Inventory value",
      value: `₹${money(totalValue)}`,
      subtitle: "Price multiplied by stock",
      icon: IndianRupee,
      color: "emerald",
      accent: "from-emerald-500 to-teal-600",
      iconStyle: "bg-emerald-100 text-emerald-700",
    },
  ];

  const navLinks = [
    {
      label: "Dashboard",
      to: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Products",
      to: null,
      icon: Package,
      active: true,
    },
    {
      label: "Add product",
      to: "/addproduct",
      icon: Plus,
    },
    {
      label: "Purchase history",
      to: "/adminpurchasehistory",
      icon: ReceiptText,
    },
    {
      label: "Customers",
      to: "/userdetails",
      icon: Users,
    },
  ];

  const sidebarLink =
    "group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-300 hover:translate-x-1 hover:bg-white/10 hover:text-white";

  const navigation = (
    <nav className="space-y-1.5" aria-label="Admin navigation">
      {navLinks.map((item) => {
        const Icon = item.icon;

        if (item.active) {
          return (
            <div
              key={item.label}
              aria-current="page"
              className="relative flex items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30"
            >
              <span className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-cyan-300" />
              <Icon size={19} />
              {item.label}
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300" />
            </div>
          );
        }

        if (item.label === "Dashboard") {
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate("/dashboard")}
              className={`${sidebarLink} w-full text-left text-slate-300`}
            >
              <Icon size={19} />
              {item.label}
              <ArrowUpRight
                size={15}
                className="ml-auto opacity-0 transition group-hover:opacity-100"
              />
            </button>
          );
        }

        return (
          <Link
            key={item.label}
            to={item.to}
            className={`${sidebarLink} text-slate-300`}
          >
            <Icon size={19} />
            {item.label}
            <ArrowUpRight
              size={15}
              className="ml-auto opacity-0 transition group-hover:opacity-100"
            />
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fc] font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      <style>{`
        @keyframes dashboardFade {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dashboardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes dashboardGlow {
          0%, 100% { opacity: .35; }
          50% { opacity: .7; }
        }
        .dashboard-fade {
          animation: dashboardFade .55s ease-out both;
        }
        .dashboard-delay-1 { animation-delay: .07s; }
        .dashboard-delay-2 { animation-delay: .14s; }
        .dashboard-delay-3 { animation-delay: .21s; }
        .dashboard-delay-4 { animation-delay: .28s; }
        .dashboard-card {
          transform-style: preserve-3d;
          transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease;
        }
        .dashboard-card:hover {
          transform: perspective(1000px) translateY(-5px) rotateX(1deg);
          box-shadow: 0 18px 38px -20px rgba(30, 64, 175, .25);
        }
        .dashboard-icon {
          transition: transform .35s ease;
        }
        .dashboard-card:hover .dashboard-icon {
          transform: perspective(500px) rotateY(12deg) rotateX(-8deg) scale(1.06);
        }
        .dashboard-row {
          transition: background-color .2s ease;
        }
        @media (prefers-reduced-motion: reduce) {
          .dashboard-fade, .dashboard-card, .dashboard-icon {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <aside className="relative flex h-full w-[285px] max-w-[85vw] flex-col bg-[#10182b] p-5 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-900/40">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <h2 className="font-extrabold tracking-tight text-white">
                    StoreAdmin
                  </h2>
                  <p className="text-xs text-slate-400">Control center</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">
              Workspace
            </p>
            {navigation}

            <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/20 font-bold text-blue-300">
                  {adminName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {adminName}
                  </p>
                  <p className="text-xs text-slate-400">Administrator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-rose-500/15 hover:text-rose-300"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[258px] flex-col overflow-y-auto bg-[#10182b] text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 top-32 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-24 h-56 w-56 rounded-full bg-violet-600/10 blur-3xl" />

        <div className="relative flex h-[82px] shrink-0 items-center gap-3 border-b border-white/[0.08] px-6">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-lg shadow-blue-950/50 transition duration-300 hover:rotate-6 hover:scale-105">
            <ShoppingBag size={23} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">
              Store<span className="text-blue-400">Admin</span>
            </h2>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">
              Commerce studio
            </p>
          </div>
        </div>

        <div className="relative flex-1 px-4 py-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">
            Main workspace
          </p>
          {navigation}

          <div className="mt-9 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/15 text-amber-300">
                <Sparkles size={16} />
              </span>
              <span className="text-xs font-bold text-white">
                Store overview
              </span>
            </div>
            <p className="text-xs leading-5 text-slate-400">
              Your products, pricing, discounts and inventory in one place.
            </p>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
              <span className="text-xs text-slate-400">Catalog size</span>
              <span className="text-sm font-bold text-blue-300">
                {products.length}
              </span>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/[0.08] p-4">
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-extrabold shadow-lg">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{adminName}</p>
              <p className="mt-0.5 text-xs text-slate-400">Administrator</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.6)]" />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut size={18} className="transition group-hover:-translate-x-0.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main workspace */}
      <div className="min-h-screen min-w-0 lg:ml-[258px]">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="flex h-[76px] items-center justify-between gap-3 px-4 sm:px-6 xl:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 lg:hidden"
              >
                <LayoutDashboard size={19} />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <span className="hidden sm:inline">Workspace</span>
                  <span className="hidden sm:inline">/</span>
                  <span className="truncate text-blue-600">Products</span>
                </div>
                <h1 className="mt-1 truncate text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                  Product management
                </h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 sm:flex">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  Admin workspace
                </span>
              </div>

              <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3 sm:pl-4">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-extrabold uppercase text-white shadow-lg shadow-blue-200 transition duration-300 hover:rotate-3 hover:scale-105">
                  {adminName.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <p className="max-w-32 truncate text-sm font-bold text-slate-800">
                    {adminName}
                  </p>
                  <p className="text-xs text-slate-400">Store administrator</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  aria-label="Sign out"
                  className="ml-1 hidden h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 sm:grid"
                >
                  <LogOut size={17} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1700px] px-4 py-6 sm:px-6 sm:py-8 xl:px-9">
          {/* Welcome hero */}
          <section className="dashboard-fade relative mb-7 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#15264a] via-[#1c3974] to-[#334ed0] p-6 text-white shadow-xl shadow-blue-950/10 sm:p-8 xl:p-9">
            <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full border-[40px] border-white/[0.05]" />
            <div className="pointer-events-none absolute right-20 top-20 h-44 w-44 rounded-full bg-blue-300/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-indigo-300/15 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-7 xl:flex-row xl:items-center">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.09] px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur">
                  <Sparkles size={14} className="text-amber-300" />
                  Your commerce control center
                </div>
                <h2 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl xl:text-[38px]">
                  Welcome back, {adminName}
                  <span className="ml-2 inline-block">✦</span>
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/80 sm:text-base sm:leading-7">
                  Manage your product catalog, monitor stock levels, fine-tune
                  discounts and keep your store running smoothly.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/addproduct")}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-800 shadow-lg shadow-blue-950/20 transition duration-300 hover:-translate-y-1 hover:bg-blue-50 hover:shadow-xl"
                  >
                    <Plus size={18} className="transition group-hover:rotate-90" />
                    Add new product
                    <ArrowUpRight size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={fetchProducts}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.08] px-5 py-3 text-sm font-semibold text-white backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/[0.15] disabled:opacity-60"
                  >
                    <RefreshCw
                      size={16}
                      className={loading ? "animate-spin" : ""}
                    />
                    Refresh inventory
                  </button>
                </div>
              </div>

              <div className="relative hidden w-full max-w-[290px] shrink-0 xl:block">
                <div className="absolute inset-4 rounded-full bg-blue-300/20 blur-2xl" />
                <div className="relative rounded-[26px] border border-white/15 bg-white/[0.08] p-5 shadow-2xl backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:rotate-1">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                      <BarChart3 size={25} className="text-cyan-200" />
                    </div>
                    <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-bold text-emerald-200">
                      Live overview
                    </span>
                  </div>
                  <p className="text-sm font-medium text-blue-100/80">
                    Products in catalog
                  </p>
                  <p className="mt-1 text-4xl font-extrabold tracking-tight">
                    {products.length.toLocaleString("en-IN")}
                  </p>
                  <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-blue-100/70">
                    <ShieldCheck size={15} className="text-emerald-300" />
                    Your inventory at a glance
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats heading */}
          <div className="dashboard-fade dashboard-delay-1 mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                Inventory overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                A snapshot of your store's performance.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm">
              <Activity size={15} className="text-blue-600" />
              {loading ? "Updating data..." : "Current inventory"}
            </div>
          </div>

          {/* Stats cards */}
          <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.title}
                  className={`dashboard-card dashboard-fade dashboard-delay-${Math.min(
                    index + 1,
                    4
                  )} group relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm`}
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-slate-50 transition duration-500 group-hover:scale-150 group-hover:bg-blue-50/80" />
                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">
                        {stat.title}
                      </p>
                      <p className="mt-3 break-words text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[27px]">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`dashboard-icon grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${stat.iconStyle} shadow-sm`}
                    >
                      <Icon size={23} strokeWidth={1.9} />
                    </div>
                  </div>
                  <p className="relative mt-3 text-xs font-medium text-slate-400">
                    {stat.subtitle}
                  </p>
                  <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${stat.accent} transition-all duration-700 group-hover:w-full`}
                      style={{
                        width:
                          stat.title === "Total products"
                            ? `${Math.min(products.length * 5, 100)}%`
                            : stat.title === "Inventory units"
                              ? `${Math.min(totalStock, 100)}%`
                              : stat.title === "Low stock"
                                ? `${Math.min(lowStock * 15, 100)}%`
                                : stat.title === "Out of stock"
                                  ? `${Math.min(outOfStock * 15, 100)}%`
                                  : `${Math.min(
                                      (totalValue / 100000) * 100,
                                      100
                                    )}%`,
                      }}
                    />
                  </div>
                </article>
              );
            })}
          </section>

          {/* Additional summary cards */}
          <section className="dashboard-fade dashboard-delay-2 mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-50 text-violet-600">
                <Tag size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">
                  Discounted products
                </p>
                <p className="mt-1 text-xl font-extrabold text-slate-900">
                  {activeDiscounts}
                </p>
              </div>
              <div className="ml-auto text-xs font-semibold text-violet-600">
                Active deals
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Layers3 size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">
                  Product categories
                </p>
                <p className="mt-1 text-xl font-extrabold text-slate-900">
                  {categories.length}
                </p>
              </div>
              <div className="ml-auto text-xs font-semibold text-emerald-600">
                Collections
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <ShieldCheck size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">
                  Inventory health
                </p>
                <p className="mt-1 text-xl font-extrabold text-slate-900">
                  {products.length === 0
                    ? "—"
                    : outOfStock === 0 && lowStock === 0
                      ? "Healthy"
                      : "Attention"}
                </p>
              </div>
              <div
                className={`ml-auto rounded-full px-2.5 py-1 text-xs font-bold ${
                  products.length > 0 && outOfStock === 0 && lowStock === 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {products.length === 0
                  ? "No data"
                  : outOfStock === 0 && lowStock === 0
                    ? "Good"
                    : "Review"}
              </div>
            </div>
          </section>

          {/* Alerts */}
          {!loading && !error && (outOfStock > 0 || lowStock > 0) && (
            <div
              role="alert"
              className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-amber-950">
                    Inventory needs your attention
                  </p>
                  <p className="mt-1 text-sm leading-5 text-amber-800/80">
                    {outOfStock > 0 &&
                      `${outOfStock} product${outOfStock !== 1 ? "s are" : " is"} out of stock`}
                    {outOfStock > 0 && lowStock > 0 && " · "}
                    {lowStock > 0 &&
                      `${lowStock} product${lowStock !== 1 ? "s are" : " is"} running low`}
                    .
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:shrink-0">
                {outOfStock > 0 && (
                  <button
                    type="button"
                    onClick={() => setStockFilter("out-of-stock")}
                    className="rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-xs font-bold text-amber-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-100"
                  >
                    View unavailable
                  </button>
                )}
                {lowStock > 0 && (
                  <button
                    type="button"
                    onClick={() => setStockFilter("low-stock")}
                    className="rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-xs font-bold text-amber-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-100"
                  >
                    View low stock
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Success notification */}
          {notice && (
            <div
              role="status"
              className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-sm"
            >
              <span className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-100">
                  <CheckCircle2 size={19} />
                </span>
                {notice}
              </span>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
                className="rounded-lg p-2 transition hover:bg-emerald-100"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* Error notification */}
          {error && products.length > 0 && (
            <div
              role="alert"
              className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800"
            >
              <span className="flex items-center gap-3">
                <AlertCircle size={19} className="shrink-0" />
                {error}
              </span>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
                className="rounded-lg p-2 hover:bg-rose-100"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* Products workspace */}
          <section className="dashboard-fade dashboard-delay-3 overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:p-6 xl:flex-row xl:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <PackageSearch size={21} />
                  </div>
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                    Product catalog
                  </h2>
                  <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                    {products.length} total
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Search your products, update discounts and manage stock.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/addproduct")}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/25"
              >
                <Plus size={18} className="transition group-hover:rotate-90" />
                Create product
              </button>
            </div>

            {/* Filters */}
            <div className="border-b border-slate-100 bg-slate-50/60 p-4 sm:p-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                <div className="group/search relative min-w-0 flex-1">
                  <Search
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within/search:text-blue-600"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search product name, ID, category..."
                    aria-label="Search products"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex">
                  <div className="relative">
                    <SlidersHorizontal
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      aria-label="Filter by stock"
                      className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:w-48"
                    >
                      <option value="all">All stock statuses</option>
                      <option value="in-stock">In stock</option>
                      <option value="low-stock">Low stock</option>
                      <option value="out-of-stock">Out of stock</option>
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      aria-label="Filter by category"
                      className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:w-48"
                    >
                      <option value="all">All categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={fetchProducts}
                    disabled={loading}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw
                      size={16}
                      className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>
                    Showing{" "}
                    <strong className="text-slate-800">
                      {filteredProducts.length}
                    </strong>{" "}
                    of{" "}
                    <strong className="text-slate-800">
                      {products.length}
                    </strong>{" "}
                    products
                  </span>
                  {hasFilters && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                      Filters active
                    </span>
                  )}
                </div>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition hover:text-blue-800"
                  >
                    <X size={14} />
                    Clear all filters
                  </button>
                )}
              </div>
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="flex flex-col items-center justify-center px-6 py-24">
                <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-blue-50">
                  <div className="absolute inset-0 animate-ping rounded-2xl bg-blue-100/60" />
                  <LoaderCircle
                    size={30}
                    className="relative animate-spin text-blue-600"
                  />
                </div>
                <p className="mt-5 text-base font-extrabold text-slate-800">
                  Loading your inventory
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Getting your latest product details...
                </p>
              </div>
            ) : error && products.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                  <AlertCircle size={29} />
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                  Unable to load products
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={fetchProducts}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  <RefreshCw size={16} />
                  Try again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                  <PackageSearch size={30} />
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                  {hasFilters
                    ? "No matching products found"
                    : "Your catalog is empty"}
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  {hasFilters
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "Add your first product to start building your store catalog."}
                </p>
                {hasFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    Clear filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate("/addproduct")}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Add your first product
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Product table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1120px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-[#fafbff] text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-500">
                        <th className="px-5 py-4">Product details</th>
                        <th className="px-4 py-4">Category</th>
                        <th className="px-4 py-4">Pricing</th>
                        <th className="px-4 py-4">Inventory</th>
                        <th className="px-4 py-4">Availability</th>
                        <th className="px-4 py-4">Discount manager</th>
                        <th className="sticky right-0 z-10 bg-[#fafbff] px-5 py-4 text-right shadow-[-8px_0_12px_-12px_rgba(15,23,42,.35)]">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((product) => {
                        const stock = Number(product.stock) || 0;
                        const discount = Number(
                          product.discountPercentage || 0
                        );
                        const price = Number(product.price) || 0;
                        const discountedPrice =
                          price * (1 - discount / 100);
                        const isSaving =
                          savingDiscountId === product.id;
                        const isDeleting =
                          deletingId === product.id;
                        const discountInput =
                          discountValues[product.id] ??
                          String(product.discountPercentage ?? 0);

                        return (
                          <tr
                            key={product.id}
                            className="dashboard-row group align-middle hover:bg-blue-50/40"
                          >
                            {/* Product details */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3.5">
                                <Thumb product={product} />
                                <div className="min-w-0">
                                  <p className="max-w-[220px] truncate text-sm font-extrabold text-slate-800 transition group-hover:text-blue-700">
                                    {product.name || "Unnamed product"}
                                  </p>
                                  <p className="mt-1 max-w-[220px] truncate text-xs text-slate-400">
                                    {product.description ||
                                      "No description added"}
                                  </p>
                                  <span className="mt-2 inline-flex rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                                    ID #{product.id}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="px-4 py-4">
                              {product.category ? (
                                <span className="inline-flex max-w-[140px] items-center gap-1.5 truncate rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-1.5 text-xs font-bold text-violet-700">
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                                  {product.category}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-300">
                                  Uncategorised
                                </span>
                              )}
                            </td>

                            {/* Pricing */}
                            <td className="whitespace-nowrap px-4 py-4">
                              {discount > 0 ? (
                                <div>
                                  <p className="text-sm font-extrabold text-emerald-700">
                                    ₹{money(discountedPrice)}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-400 line-through">
                                    ₹{money(price)}
                                  </p>
                                  <span className="mt-1 inline-block text-[10px] font-bold text-emerald-600">
                                    You save ₹{money(price - discountedPrice)}
                                  </span>
                                </div>
                              ) : (
                                <p className="text-sm font-extrabold text-slate-800">
                                  ₹{money(price)}
                                </p>
                              )}
                            </td>

                            {/* Stock */}
                            <td className="whitespace-nowrap px-4 py-4">
                              <p className="text-sm font-extrabold text-slate-800">
                                {stock.toLocaleString("en-IN")}
                                <span className="ml-1 text-[10px] font-medium text-slate-400">
                                  units
                                </span>
                              </p>
                              <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    stock <= 0
                                      ? "bg-rose-500"
                                      : stock <= 5
                                        ? "bg-amber-400"
                                        : "bg-gradient-to-r from-emerald-400 to-teal-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(stock, 100)}%`,
                                  }}
                                />
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[11px] font-bold ${
                                  stock <= 0
                                    ? "border-rose-100 bg-rose-50 text-rose-700"
                                    : stock <= 5
                                      ? "border-amber-100 bg-amber-50 text-amber-700"
                                      : "border-emerald-100 bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    stock <= 0
                                      ? "bg-rose-500"
                                      : stock <= 5
                                        ? "bg-amber-500"
                                        : "bg-emerald-500"
                                  }`}
                                />
                                {stock <= 0
                                  ? "Out of stock"
                                  : stock <= 5
                                    ? "Low stock"
                                    : "In stock"}
                              </span>
                            </td>

                            {/* Discount manager */}
                            <td className="min-w-[270px] px-4 py-4">
                              <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-500/5">
                                <label className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  <Tag size={12} />
                                  Discount percentage
                                </label>
                                <div className="flex items-center gap-2">
                                  <div className="relative min-w-0 flex-1">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.01"
                                      value={discountInput}
                                      onChange={(e) =>
                                        handleDiscountChange(
                                          product.id,
                                          e.target.value
                                        )
                                      }
                                      aria-label={`Discount percentage for ${product.name}`}
                                      className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pr-8 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                      %
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleApplyDiscount(product)
                                    }
                                    disabled={isSaving}
                                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {isSaving ? (
                                      <LoaderCircle
                                        size={13}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <CheckCircle2 size={13} />
                                    )}
                                    Apply
                                  </button>
                                </div>

                                {discount > 0 ? (
                                  <div className="mt-2 flex items-center justify-between gap-2">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                                      <CheckCircle2 size={12} />
                                      {discount}% discount active
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveDiscount(product)
                                      }
                                      disabled={isSaving}
                                      className="text-[10px] font-bold text-rose-500 transition hover:text-rose-700 hover:underline disabled:opacity-40"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ) : (
                                  <p className="mt-2 text-[10px] text-slate-400">
                                    No discount currently applied
                                  </p>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="sticky right-0 z-10 bg-white px-5 py-4 shadow-[-8px_0_12px_-12px_rgba(15,23,42,.35)] transition-colors group-hover:bg-[#f6f9ff]">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdate(product.id)
                                  }
                                  title="Edit product"
                                  aria-label={`Edit ${product.name}`}
                                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 text-xs font-bold text-blue-700 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/20"
                                >
                                  <Pencil size={14} />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(product.id)
                                  }
                                  disabled={isDeleting}
                                  title="Delete product"
                                  aria-label={`Delete ${product.name}`}
                                  className="grid h-9 w-9 place-items-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition duration-200 hover:-translate-y-0.5 hover:border-rose-500 hover:bg-rose-600 hover:text-white hover:shadow-lg hover:shadow-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isDeleting ? (
                                    <LoaderCircle
                                      size={15}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2 size={15} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table footer */}
                <div className="flex flex-col justify-between gap-2 border-t border-slate-100 bg-[#fafbff] px-5 py-4 text-xs sm:flex-row sm:items-center sm:px-6">
                  <p className="text-slate-500">
                    Displaying{" "}
                    <strong className="text-slate-800">
                      {filteredProducts.length}
                    </strong>{" "}
                    of{" "}
                    <strong className="text-slate-800">
                      {products.length}
                    </strong>{" "}
                    products
                  </p>
                  <p className="flex items-center gap-1.5 font-semibold text-slate-400">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    Inventory management
                  </p>
                </div>
              </>
            )}
          </section>

          {/* Bottom summary */}
          {!loading && products.length > 0 && (
            <section className="dashboard-fade dashboard-delay-4 mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <IndianRupee size={23} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Total inventory value
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">
                    ₹{money(totalValue)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Calculated using listed price and available stock.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:shadow-md">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <Tag size={23} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Active product discounts
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">
                    {activeDiscounts}{" "}
                    <span className="text-sm font-medium text-slate-400">
                      / {products.length} products
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Update any discount from the catalog table above.
                  </p>
                </div>
              </div>
            </section>
          )}
        </main>

        <footer className="mt-3 border-t border-slate-200/80 bg-white/70 px-4 py-5 sm:px-8">
          <div className="mx-auto flex max-w-[1700px] flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()}{" "}
              <span className="font-bold text-slate-600">StoreAdmin</span>.
              Built for smarter product management.
            </p>
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Admin workspace
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;