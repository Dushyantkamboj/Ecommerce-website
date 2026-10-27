
import { useEffect, useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { userContext } from "../context/userContext";
import {
  UserRound,
  Search,
  ShoppingCart,
  LogOut,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const Navbar = () => {
  const [search, setSearch] = useState("");
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const { count } = useContext(userContext);
  const navigate = useNavigate();
  const location = useLocation();

  const type = Number(Cookies.get("type"));
  const token = Cookies.get("accessToken");
  const adminName = Cookies.get("name");

  const suggestions = [
    "Mobiles",
    "Laptops",
    "Shoes",
    "Watches",
    "Headphones",
    "Clothing",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex((previous) => (previous + 1) % suggestions.length);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate("/products");
    }
  };

  const handleLogout = () => {
    const isAdmin = type === 1;

    [
      "type",
      "name",
      "accessToken",
      "refreshToken",
      "email",
    ].forEach((key) => Cookies.remove(key));

    navigate(isAdmin ? "/adminlogin" : "/", {
      replace: true,
    });
  };

  const iconClass =
    "h-[18px] w-[18px] shrink-0 transition-transform duration-300 group-hover:scale-110";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-2xl">
      {/* Top accent line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

      <nav className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6 lg:gap-8 lg:px-10">

        {/* Brand */}
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2.5"
        >
          <div className="relative flex h-11 w-11 items-center justify-center rounded-[15px] bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 shadow-lg shadow-indigo-200/70 transition-all duration-300 group-hover:-rotate-6 group-hover:scale-105 sm:h-12 sm:w-12">
            <span className="text-2xl font-black tracking-tighter text-white">
              S
            </span>
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
          </div>

          <div className="leading-tight">
            <span className="block text-lg font-black tracking-tight text-slate-900 sm:text-[23px]">
              Shop<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Sphere</span>
            </span>
            <span className="mt-1 hidden text-[9px] font-bold uppercase tracking-[0.23em] text-slate-400 sm:block">
              Everything you love
            </span>
          </div>
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="relative mx-auto flex h-11 min-w-0 max-w-[620px] flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50/90 transition-all duration-300 focus-within:border-indigo-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)] sm:h-[46px]"
        >
          <Search className="ml-3.5 h-[19px] w-[19px] shrink-0 text-slate-400 transition-colors focus-within:text-indigo-600" />

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
            placeholder=""
            className="h-full w-full min-w-0 bg-transparent px-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
          />

          {!search && (
            <div className="pointer-events-none absolute left-[43px] right-[85px] top-0 flex h-full items-center overflow-hidden text-sm text-slate-400">
              <span className="shrink-0">Find</span>
              <span className="relative ml-1.5 h-5 flex-1 overflow-hidden">
                <span
                  key={suggestionIndex}
                  className="animate-search-up absolute inset-0 truncate font-semibold text-indigo-600"
                >
                  {suggestions[suggestionIndex]}
                </span>
              </span>
            </div>
          )}

          <button
            type="submit"
            aria-label="Search products"
            className="mr-1 flex h-[34px] shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 text-sm font-bold text-white shadow-md shadow-indigo-200/60 transition-all duration-300 hover:from-indigo-700 hover:to-violet-700 active:scale-95 sm:mr-1.5 sm:h-[36px] sm:px-5"
          >
            <span className="hidden sm:inline">Search</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </form>

        {/* Customer and guest actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">

          {/* Login */}
          {!token && (
            <Link
              to="/login"
              className="group flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:h-11 sm:rounded-2xl sm:px-5"
            >
              <UserRound className={iconClass} />
              <span>Login</span>
            </Link>
          )}

          {/* Customer profile */}
          {token && type === 2 && (
            <Link
              to="/userprofile"
              title="My Profile"
              className="group flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:h-11 sm:rounded-2xl sm:px-4"
            >
              <UserRound className={iconClass} />
              <span className="hidden md:inline">Profile</span>
            </Link>
          )}

          {/* Cart */}
          {type !== 1 && (
            <Link
              to="/cart"
              aria-label={`Shopping cart, ${count || 0} items`}
              className="group relative flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-bold text-white shadow-md shadow-slate-300/50 transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200 sm:h-11 sm:rounded-2xl sm:px-4"
            >
              <span className="relative">
                <ShoppingCart className={`${iconClass} h-5 w-5`} />
                <span className="absolute -right-2 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-slate-900 bg-fuchsia-500 px-1 text-[9px] font-black text-white transition-colors group-hover:border-indigo-600">
                  {count || 0}
                </span>
              </span>
              <span className="hidden sm:inline">Cart</span>
            </Link>
          )}

          {/* Customer logout */}
          {token && type === 2 && (
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-500 transition-all duration-300 hover:border-rose-500 hover:bg-rose-500 hover:text-white sm:h-11 sm:w-11 sm:rounded-2xl"
            >
              <LogOut className={iconClass} />
            </button>
          )}

          {/* Admin account */}
          {token && type === 1 && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-1.5 pr-3 sm:gap-3 sm:pr-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-black uppercase text-white shadow-sm sm:h-9 sm:w-9">
                  {adminName?.charAt(0) || "A"}
                </div>

                <div className="hidden sm:block">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-indigo-400">
                    Administrator
                  </p>
                  <p className="max-w-28 truncate text-sm font-bold text-slate-800">
                    {adminName || "Admin"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="group flex h-10 items-center gap-2 rounded-xl bg-rose-500 px-3.5 text-sm font-bold text-white shadow-md shadow-rose-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-600 sm:h-11 sm:rounded-2xl sm:px-4"
              >
                <LogOut className={iconClass} />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="h-px bg-gradient-to-r from-transparent via-indigo-100 to-transparent" />
    </header>
  );
};

export default Navbar;
