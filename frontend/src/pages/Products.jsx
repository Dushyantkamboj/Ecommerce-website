
import { useEffect, useMemo, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Navbar from "../component/Navbar";
import { userContext } from "../context/userContext";

import {
  ShoppingBag,
  PackageSearch,
  RefreshCw,
  SlidersHorizontal,
  X,
  Plus,
  Minus,
  AlertCircle,
  Heart,
  ChevronDown,
  Truck,
  ShieldCheck,
  Box,
  Tag,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  RotateCcw,
  Star,
  Sliders,
} from "lucide-react";

const API_URL = "http://localhost:3000/api_v1/user/list";
const SERVER_URL = "http://localhost:3000";
const PAGE_SIZE = 12;

/* ---------------- HELPERS ---------------- */

const getProductId = (product) => product.id;

const getProductName = (product) =>
  product.name || product.title || "Unnamed Product";

const getProductPrice = (product) =>
  Number(product.price ?? product.selling_price ?? 0);

const getProductStock = (product) =>
  Number(product.stock ?? product.quantity ?? 0);

const getDiscountPercentage = (product) => {
  const discount = Number(product.discountPercentage ?? 0);

  return Number.isFinite(discount) && discount > 0 && discount <= 100
    ? discount
    : 0;
};

const getDiscountedPrice = (product) =>
  getProductPrice(product) *
  (1 - getDiscountPercentage(product) / 100);

const getImageUrl = (image) => {
  if (!image) return "";

  if (/^https?:\/\//i.test(image)) return image;

  const path = image.replace(/^\/+/, "");

  return `${SERVER_URL}/${path.startsWith("uploads/") ? path : `uploads/${path}`}`;
};

const money = (price) =>
  Number(price).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

/* ---------------- PRODUCT CARD ---------------- */

const ProductCard = ({
  product,
  quantity,
  isFavorite,
  onFavorite,
  onAdd,
  onIncrease,
  onDecrease,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const name = getProductName(product);
  const stock = getProductStock(product);
  const discount = getDiscountPercentage(product);
  const price = getProductPrice(product);
  const finalPrice = getDiscountedPrice(product);

  const imageUrl = getImageUrl(
    product.image || product.image_url || product.product_image,
  );

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)]">
      {/* Product image */}
      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/40 sm:h-56">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110 sm:p-6"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-300">
            <Box size={42} strokeWidth={1.2} />
            <span className="text-xs">Image unavailable</span>
          </div>
        )}

        {discount > 0 && stock > 0 && (
          <span className="absolute left-3 top-3 rounded-lg bg-rose-600 px-2.5 py-1.5 text-[10px] font-extrabold tracking-wide text-white shadow-sm sm:text-xs">
            {Math.round(discount)}% OFF
          </span>
        )}

        {stock > 0 && stock <= 5 && (
          <span className="absolute bottom-3 left-3 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-amber-100">
            Almost gone
          </span>
        )}

        <button
          type="button"
          onClick={onFavorite}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-slate-100 bg-white/95 shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md ${
            isFavorite
              ? "text-rose-500"
              : "text-slate-400 hover:text-rose-500"
          }`}
        >
          <Heart
            size={17}
            fill={isFavorite ? "currentColor" : "none"}
          />
        </button>

        {stock <= 0 && (
          <div className="absolute inset-0 grid place-items-center bg-white/75 backdrop-blur-[2px]">
            <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-lg">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* Product information */}
      <div className="flex flex-1 flex-col border-t border-slate-100 p-3.5 sm:p-4">
        <div className="mb-2 flex min-h-5 items-center justify-between gap-2">
          {product.category ? (
            <span className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[11px]">
              {product.category}
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              ShopSphere
            </span>
          )}

          {stock > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-emerald-600">
              <CheckCircle2 size={12} />
              Available
            </span>
          )}
        </div>

        <h3
          title={name}
          className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-800 transition-colors group-hover:text-blue-700 sm:text-[15px]"
        >
          {name}
        </h3>

        {/* Price */}
        <div className="mt-3 flex min-h-7 flex-wrap items-baseline gap-x-2 gap-y-1">
          <strong className="text-lg font-extrabold tracking-tight text-slate-950 sm:text-xl">
            ₹{money(finalPrice)}
          </strong>

          {discount > 0 && (
            <>
              <span className="text-xs text-slate-400 line-through sm:text-sm">
                ₹{money(price)}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 sm:text-xs">
                Save ₹{money(price - finalPrice)}
              </span>
            </>
          )}
        </div>

        <p
          className={`mt-2 text-[11px] font-medium sm:text-xs ${
            stock <= 0
              ? "text-rose-600"
              : stock <= 5
                ? "text-amber-600"
                : "text-slate-400"
          }`}
        >
          {stock <= 0
            ? "Currently unavailable"
            : stock <= 5
              ? `Only ${stock} left in stock`
              : "Ready to ship"}
        </p>

        {/* Cart controls */}
        <div className="mt-auto pt-4">
          {quantity > 0 ? (
            <div className="flex h-10 items-center justify-between overflow-hidden rounded-xl border border-blue-200 bg-blue-50/60">
              <button
                type="button"
                onClick={onDecrease}
                aria-label="Decrease quantity"
                className="grid h-full w-10 place-items-center text-blue-700 transition hover:bg-blue-100"
              >
                <Minus size={15} />
              </button>

              <span className="text-sm font-extrabold text-blue-800">
                {quantity}
              </span>

              <button
                type="button"
                onClick={onIncrease}
                disabled={quantity >= stock}
                aria-label="Increase quantity"
                className="grid h-full w-10 place-items-center text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus size={15} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              disabled={stock <= 0}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-2 text-xs font-bold text-white transition-all duration-200 hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:text-sm"
            >
              <ShoppingBag size={15} />
              {stock <= 0 ? "Unavailable" : "Add to cart"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

/* ---------------- MAIN PAGE ---------------- */

const Products = () => {
  const navigate = useNavigate();

  const {
    cart = {},
    setCart,
    setCount,
    setproductIds,
  } = useContext(userContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minDiscount, setMinDiscount] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* Fetch products */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);
      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.data?.products)
            ? data.data.products
            : Array.isArray(data?.products)
              ? data.products
              : [];

      setProducts(list);
    } catch (err) {
      console.error("Product fetch error:", err);
      setError("Unable to load products. Please check your backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* Keep cart context synchronized */
  useEffect(() => {
    setproductIds?.(Object.keys(cart).map(Number));
  }, [cart, setproductIds]);

  useEffect(() => {
    setCount?.(
      Object.values(cart).reduce(
        (sum, qty) => sum + Number(qty || 0),
        0,
      ),
    );
  }, [cart, setCount]);

  /* Reset pagination when filters change */
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    selectedCategory,
    sortBy,
    search,
    minPrice,
    maxPrice,
    minDiscount,
    inStockOnly,
  ]);

  /* Categories */
  const categories = useMemo(() => {
    const unique = [
      ...new Set(
        products.map((product) => product.category).filter(Boolean),
      ),
    ];

    return ["All", ...unique];
  }, [products]);

  const maxDiscount = useMemo(
    () =>
      Math.round(
        products.reduce(
          (max, product) =>
            Math.max(max, getDiscountPercentage(product)),
          0,
        ),
      ),
    [products],
  );

  const inStockCount = useMemo(
    () =>
      products.filter((product) => getProductStock(product) > 0).length,
    [products],
  );

  const discountedProductsCount = useMemo(
    () =>
      products.filter(
        (product) => getDiscountPercentage(product) > 0,
      ).length,
    [products],
  );

  /* Search, filter and sort */
  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();

    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    let result = products.filter((product) => {
      if (
        selectedCategory !== "All" &&
        product.category !== selectedCategory
      ) {
        return false;
      }

      const text = `
        ${getProductName(product)}
        ${product.description || ""}
        ${product.category || ""}
      `.toLowerCase();

      if (!text.includes(query)) return false;

      const price = getDiscountedPrice(product);

      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;

      if (getDiscountPercentage(product) < minDiscount) return false;

      if (inStockOnly && getProductStock(product) <= 0) return false;

      return true;
    });

    const sorters = {
      "price-low": (a, b) =>
        getDiscountedPrice(a) - getDiscountedPrice(b),

      "price-high": (a, b) =>
        getDiscountedPrice(b) - getDiscountedPrice(a),

      discount: (a, b) =>
        getDiscountPercentage(b) - getDiscountPercentage(a),

      name: (a, b) =>
        getProductName(a).localeCompare(getProductName(b)),
    };

    if (sorters[sortBy]) {
      result = [...result].sort(sorters[sortBy]);
    }

    return result;
  }, [
    products,
    selectedCategory,
    sortBy,
    search,
    minPrice,
    maxPrice,
    minDiscount,
    inStockOnly,
  ]);

  /* Cart actions */
  const handlePurchase = (product) => {
    const token = Cookies.get("accessToken");
    const type = Cookies.get("type");

    if (!token) {
      alert("Please login first!");
      // navigate("/login");
      return;
    }

    if (String(type) !== "2") {
      alert("Only customer accounts can purchase products.");
      return;
    }

    const id = getProductId(product);
    const stock = getProductStock(product);

    if (stock <= 0) {
      alert("This product is out of stock.");
      return;
    }

    setCart((previous) => {
      const current = Number(previous[id] || 0);

      if (current >= stock) {
        alert("Available stock limit reached.");
        return previous;
      }

      return { ...previous, [id]: current + 1 };
    });
  };

  const increaseQuantity = (product) => {
    const token = Cookies.get("accessToken");
    const type = Cookies.get("type");

    if (!token) {
      navigate("/login");
      return;
    }

    if (String(type) !== "2") {
      alert("Only customer accounts can purchase products.");
      return;
    }

    const id = getProductId(product);
    const stock = getProductStock(product);

    setCart((previous) => {
      const current = Number(previous[id] || 0);

      if (current >= stock) {
        alert("Available stock limit reached.");
        return previous;
      }

      return { ...previous, [id]: current + 1 };
    });
  };

  const decreaseQuantity = (product) => {
    const id = getProductId(product);

    setCart((previous) => {
      const current = Number(previous[id] || 0);

      if (current <= 1) {
        const updated = { ...previous };
        delete updated[id];
        return updated;
      }

      return { ...previous, [id]: current - 1 };
    });
  };

  const toggleFavorite = (id) => {
    setFavorites((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setSortBy("default");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setMinDiscount(0);
    setInStockOnly(false);
  };

  const totalItems = Object.values(cart).reduce(
    (sum, qty) => sum + Number(qty || 0),
    0,
  );

  const cartTotal = products.reduce(
    (sum, product) =>
      sum +
      getDiscountedPrice(product) *
        Number(cart[getProductId(product)] || 0),
    0,
  );

  const hasActiveFilters =
    selectedCategory !== "All" ||
    sortBy !== "default" ||
    Boolean(search) ||
    minPrice !== "" ||
    maxPrice !== "" ||
    minDiscount > 0 ||
    inStockOnly;

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  /* Shared filter panel */
  const filterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">
          Price range
        </h3>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min ₹"
            aria-label="Minimum price"
            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />

          <span className="text-xs text-slate-400">to</span>

          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max ₹"
            aria-label="Maximum price"
            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">
          Discount
        </h3>

        <div className="space-y-3">
          {[
            { label: "All discounts", value: 0 },
            { label: "10% off or more", value: 10 },
            { label: "25% off or more", value: 25 },
            { label: "50% off or more", value: 50 },
          ].map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3 text-sm text-slate-600 transition hover:text-blue-700"
            >
              <input
                type="radio"
                name="discount"
                checked={minDiscount === option.value}
                onChange={() => setMinDiscount(option.value)}
                className="h-4 w-4 accent-blue-600"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">
          Availability
        </h3>

        <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          In-stock products only
        </label>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        >
          <RotateCcw size={14} />
          Reset filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb] font-sans text-slate-900">
      <Navbar />

      {/* CATEGORY NAVIGATION */}
      <nav
        aria-label="Product categories"
        className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl"
      >
        <div className="mx-auto flex w-full max-w-[1440px] gap-1 overflow-x-auto px-4 scrollbar-hide sm:px-6 lg:px-8">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`relative shrink-0 px-4 py-4 text-xs font-bold transition sm:px-5 sm:text-sm ${
                selectedCategory === category
                  ? "text-blue-700"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {category === "All" ? "All products" : category}

              {selectedCategory === category && (
                <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* HERO BANNER */}
        <section className="relative isolate overflow-hidden rounded-3xl bg-slate-950 shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
          {/* Decorative background */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900" />

          <div className="absolute -right-16 -top-28 -z-10 h-80 w-80 rounded-full bg-blue-500/25 blur-3xl" />

          <div className="absolute -bottom-32 right-1/4 -z-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="grid min-h-[330px] items-center gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.3fr_0.7fr] lg:px-14 lg:py-14">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100 backdrop-blur-md sm:text-xs">
                <Sparkles size={14} className="text-amber-300" />
                Your everyday shopping destination
              </span>

              <h1 className="mt-6 text-3xl font-black leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[58px]">
                Find what you love.
                <span className="mt-1 block bg-gradient-to-r from-blue-300 via-sky-200 to-violet-300 bg-clip-text text-transparent">
                  Love what you save.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Discover products picked for your lifestyle, explore exciting
                offers, and enjoy a smoother way to shop.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("product-catalog")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 shadow-lg transition hover:bg-blue-50 active:scale-[0.98] sm:px-6"
                >
                  Explore collection
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSortBy("discount");
                    setMinDiscount(10);

                    document
                      .getElementById("product-catalog")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/15 active:scale-[0.98]"
                >
                  <Tag size={16} />
                  Shop deals
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  Carefully selected products
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-blue-300" />
                  Secure shopping experience
                </span>
              </div>
            </div>

            {/* Hero stats */}
            <div className="hidden lg:block">
              <div className="relative ml-auto max-w-sm rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-300">
                      Explore the collection
                    </p>
                    <p className="mt-1 text-3xl font-black text-white">
                      {products.length.toLocaleString("en-IN")}
                      <span className="ml-2 text-base font-semibold text-blue-300">
                        products
                      </span>
                    </p>
                  </div>

                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-400/15 text-blue-200">
                    <ShoppingBag size={25} />
                  </span>
                </div>

                <div className="my-6 h-px bg-white/10" />

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/[0.07] p-4">
                    <Tag size={20} className="text-amber-300" />
                    <p className="mt-3 text-2xl font-extrabold text-white">
                      {maxDiscount}%
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      Maximum discount
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.07] p-4">
                    <Box size={20} className="text-emerald-300" />
                    <p className="mt-3 text-2xl font-extrabold text-white">
                      {inStockCount}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      Products in stock
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-400/15 text-rose-300">
                    <Heart size={19} />
                  </span>

                  <div>
                    <p className="text-sm font-bold text-white">
                      Find your favorites
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      Discover products worth adding to your cart.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE STRIP */}
        <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-4 sm:gap-4">
          {[
            {
              icon: Truck,
              title: "Easy shopping",
              subtitle: "A smooth buying experience",
              color: "bg-blue-50 text-blue-600",
            },
            {
              icon: ShieldCheck,
              title: "Secure checkout",
              subtitle: "Protected purchase flow",
              color: "bg-emerald-50 text-emerald-600",
            },
            {
              icon: Tag,
              title: "Special deals",
              subtitle: `${discountedProductsCount} discounted products`,
              color: "bg-amber-50 text-amber-600",
            },
            {
              icon: RotateCcw,
              title: "Easy browsing",
              subtitle: "Search and filter products",
              color: "bg-violet-50 text-violet-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-4"
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl sm:h-11 sm:w-11 ${item.color}`}
                >
                  <Icon size={20} />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold text-slate-800 sm:text-sm">
                    {item.title}
                  </p>
                  <p className="mt-1 truncate text-[10px] text-slate-400 sm:text-xs">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* PRODUCT CATALOG */}
        <div
          id="product-catalog"
          className="mt-9 scroll-mt-24 sm:mt-12"
        >
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
                <span className="h-1.5 w-6 rounded-full bg-blue-600" />
                The collection
              </div>

              <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Discover your next favorite
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Browse the collection and find something just right for you.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm sm:self-auto">
              <PackageSearch size={16} className="text-blue-600" />
              {filteredProducts.length} products found
            </div>
          </div>

          <div className="flex items-start gap-5">
            {/* DESKTOP SIDEBAR */}
            <aside className="sticky top-[76px] hidden h-fit w-[250px] shrink-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:block">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders size={18} className="text-blue-600" />
                  <h3 className="text-base font-extrabold text-slate-900">
                    Filters
                  </h3>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Clear
                  </button>
                )}
              </div>

              {filterPanel}
            </aside>

            {/* PRODUCTS MAIN AREA */}
            <main className="min-w-0 flex-1">
              {/* SEARCH AND SORT */}
              <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
                    <Search
                      size={18}
                      className="shrink-0 text-slate-400"
                    />

                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search products, categories..."
                      aria-label="Search products"
                      className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                        className="shrink-0 text-slate-400 hover:text-slate-800"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFiltersOpen(true)}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 sm:px-4 lg:hidden"
                    >
                      <SlidersHorizontal size={16} />
                      Filters
                      {hasActiveFilters && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </button>

                    <div className="relative min-w-0 flex-1 sm:w-48 sm:flex-none">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        aria-label="Sort products"
                        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 sm:text-sm"
                      >
                        <option value="default">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="discount">Biggest discount</option>
                        <option value="name">Name: A to Z</option>
                      </select>

                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Active category and filters */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {selectedCategory !== "All" && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("All")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-700"
                    >
                      {selectedCategory}
                      <X size={12} />
                    </button>
                  )}

                  {minDiscount > 0 && (
                    <button
                      type="button"
                      onClick={() => setMinDiscount(0)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-700"
                    >
                      {minDiscount}% off or more
                      <X size={12} />
                    </button>
                  )}

                  {inStockOnly && (
                    <button
                      type="button"
                      onClick={() => setInStockOnly(false)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700"
                    >
                      In stock
                      <X size={12} />
                    </button>
                  )}

                  {(minPrice !== "" || maxPrice !== "") && (
                    <button
                      type="button"
                      onClick={() => {
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-700"
                    >
                      Price range
                      <X size={12} />
                    </button>
                  )}

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-[11px] font-bold text-slate-500 underline underline-offset-2 hover:text-rose-600"
                    >
                      Reset all
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500 sm:text-sm">
                  {loading
                    ? "Preparing your collection..."
                    : `Showing ${visibleProducts.length} of ${filteredProducts.length} products`}
                </p>

                <span className="text-[10px] font-medium text-slate-400 sm:text-xs">
                  Prices in INR
                </span>
              </div>

              {/* LOADING SKELETONS */}
              {loading && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white p-3"
                    >
                      <div className="h-40 rounded-xl bg-slate-100 sm:h-52" />
                      <div className="mt-4 h-3 w-2/5 rounded bg-slate-100" />
                      <div className="mt-3 h-4 w-4/5 rounded bg-slate-100" />
                      <div className="mt-3 h-5 w-2/5 rounded bg-slate-100" />
                      <div className="mt-5 h-10 rounded-xl bg-slate-100" />
                    </div>
                  ))}
                </div>
              )}

              {/* ERROR STATE */}
              {!loading && error && (
                <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-50 text-rose-500">
                    <AlertCircle size={30} />
                  </span>

                  <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                    Something went wrong
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={fetchProducts}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    <RefreshCw size={16} />
                    Try again
                  </button>
                </div>
              )}

              {/* EMPTY STATE */}
              {!loading && !error && filteredProducts.length === 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                    <PackageSearch size={30} />
                  </span>

                  <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                    No products found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    We couldn't find products matching your search or filters.
                    Try changing your search or resetting your filters.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Show all products
                  </button>
                </div>
              )}

              {/* PRODUCT GRID */}
              {!loading && !error && filteredProducts.length > 0 && (
                <>
                  <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                    {visibleProducts.map((product) => {
                      const id = getProductId(product);

                      return (
                        <ProductCard
                          key={id}
                          product={product}
                          quantity={Number(cart[id] || 0)}
                          isFavorite={favorites.includes(id)}
                          onFavorite={() => toggleFavorite(id)}
                          onAdd={() => handlePurchase(product)}
                          onIncrease={() => increaseQuantity(product)}
                          onDecrease={() => decreaseQuantity(product)}
                        />
                      );
                    })}
                  </div>

                  {/* LOAD MORE */}
                  {visibleCount < filteredProducts.length && (
                    <div className="mt-8 flex flex-col items-center gap-3">
                      <p className="text-xs text-slate-400">
                        Showing {visibleProducts.length} of{" "}
                        {filteredProducts.length} products
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setVisibleCount((count) => count + PAGE_SIZE)
                        }
                        className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Load more products
                        <ChevronDown
                          size={17}
                          className="transition-transform group-hover:translate-y-0.5"
                        />
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {filtersOpen && (
        <div
          className="fixed inset-0 z-[70] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Product filters"
        >
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
            className="absolute inset-0 h-full w-full bg-slate-950/50 backdrop-blur-sm"
          />

          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-md">
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200" />

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Refine your search
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Find exactly what you're looking for.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Close filters"
                  className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            <div className="p-5">
              {filterPanel}

              <div className="mt-7 flex gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-12 flex-1 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Reset all
                </button>

                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="h-12 flex-1 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  Show {filteredProducts.length} results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STICKY CART BAR */}
      {totalItems > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 shadow-[0_-12px_35px_rgba(15,23,42,0.10)] backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
                <ShoppingBag size={21} />

                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-extrabold text-white ring-2 ring-white">
                  {totalItems}
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-500">
                  {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
                </p>

                <p className="mt-0.5 truncate text-lg font-black tracking-tight text-slate-950">
                  ₹{money(cartTotal)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-extrabold text-white shadow-lg transition hover:bg-blue-700 active:scale-[0.98] sm:px-6 sm:text-sm"
            >
              View cart
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer
        className={`mt-12 bg-slate-950 text-slate-300 ${
          totalItems > 0 ? "pb-24" : ""
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2 sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  <ShoppingBag size={22} />
                </span>

                <div>
                  <h3 className="text-xl font-black tracking-tight text-white">
                    ShopSphere
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Your world of shopping.
                  </p>
                </div>
              </div>

              <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
                Discover products you love, explore great deals, and enjoy a
                simpler shopping experience.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <ShieldCheck size={17} className="text-blue-400" />
                Secure shopping experience
              </span>

              <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Truck size={17} className="text-blue-400" />
                Your next favorite is waiting
              </span>

              <button
                type="button"
                onClick={() =>
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
                className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-blue-300 transition hover:text-white"
              >
                Back to top
                <ArrowRight size={15} className="-rotate-90" />
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-5 text-center text-xs text-slate-500 sm:flex sm:items-center sm:justify-between sm:text-left">
            <p>
              © {new Date().getFullYear()} ShopSphere. All rights reserved.
            </p>
            <p className="mt-2 sm:mt-0">
              Made for a better shopping experience.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Products;
