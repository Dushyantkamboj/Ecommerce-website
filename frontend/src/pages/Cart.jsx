import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { userContext } from "../context/userContext";
import Navbar from "../component/Navbar";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Truck,
  ShieldCheck,
  PackageCheck,
  CreditCard,
  ShoppingCart,
  AlertCircle,
  TicketPercent,
  CheckCircle2,
} from "lucide-react";

const API_URL = "http://localhost:3000/api_v1/user/list";
const COUPON_API_URL = "http://localhost:3000/api_v1/user/listcoupon";
const BUYING_API_URL = "http://localhost:3000/api_v1/product/buying";
const SERVER_URL = "http://localhost:3000";

const Cart = () => {
  const navigate = useNavigate();

  const { cart, setCart, setCount, setproductIds } =
    useContext(userContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  const type = Number(Cookies.get("type"));

  useEffect(() => {
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
        console.error(
          "Failed to load cart products:",
          err.response?.data || err.message
        );

        setError("Unable to load your cart products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setCouponLoading(true);
        setCouponError("");

        const token = Cookies.get("accessToken");

        if (!token) {
          throw new Error("Please log in to load available coupons.");
        }

        const response = await axios.get(COUPON_API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Coupon API response:", response.data);

        const data = response.data;

        // Support common API response formats.
        const couponList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.data?.coupons)
          ? data.data.coupons
          : Array.isArray(data?.coupons)
          ? data.coupons
          : [];

        setCoupons(couponList);
      } catch (err) {
        console.error(
          "Failed to load coupons:",
          err.response?.data || err.message
        );

        setCouponError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load coupons. Please try again."
        );
      } finally {
        setCouponLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  // Convert image path into a usable URL
  const getImageUrl = (image) => {
    if (!image) return "";

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    const path = String(image).replace(/^\/+/, "");

    return `${SERVER_URL}/${
      path.startsWith("uploads/") ? path : `uploads/${path}`
    }`;
  };

  // Get products currently in cart
  const cartProducts = useMemo(() => {
    return Object.entries(cart || {})
      .map(([id, quantity]) => {
        const product = products.find(
          (item) => String(item.id) === String(id)
        );

        if (!product || Number(quantity) <= 0) {
          return null;
        }

        return {
          ...product,
          cartQuantity: Number(quantity),
        };
      })
      .filter(Boolean);
  }, [cart, products]);

  // Calculate product price after product-level discount
  const getProductPrice = (product) => {
    const price = Number(product.price || 0);

    const percentage = Math.min(
      100,
      Math.max(0, Number(product.discountPercentage || 0))
    );

    return price * (1 - percentage / 100);
  };

  // Subtotal includes product discounts
  const subtotal = cartProducts.reduce(
    (sum, product) =>
      sum + getProductPrice(product) * product.cartQuantity,
    0
  );

  // Delivery is free for orders of ₹999 or more
  const delivery = subtotal === 0 || subtotal >= 999 ? 0 : 49;

  const totalBeforeCoupon = subtotal + delivery;

  // Check coupon minimum order amount
  const couponEligible = selectedCoupon
    ? subtotal >= Number(selectedCoupon.minimumOrderAmount || 0)
    : false;

  // Calculate coupon discount
  const couponDiscount = couponEligible
    ? Math.min(
        subtotal,
        (subtotal *
          Math.min(
            100,
            Math.max(
              0,
              Number(selectedCoupon?.discountPercentage || 0)
            )
          )) /
          100
      )
    : 0;

  const finalTotal = Math.max(
    0,
    totalBeforeCoupon - couponDiscount
  );

  const totalItems = Object.values(cart || {}).reduce(
    (sum, quantity) => sum + Number(quantity || 0),
    0
  );

  // Apply coupon
  const applyCoupon = (coupon) => {
    const minimum = Number(coupon.minimumOrderAmount || 0);

    if (subtotal < minimum) {
      setCouponMessage(
        `Add ₹${(minimum - subtotal).toLocaleString("en-IN", {
          maximumFractionDigits: 2,
        })} more to use this coupon.`
      );
      return;
    }

    setSelectedCoupon(coupon);
    setCouponError("");
    setCouponMessage(`${coupon.code} applied successfully!`);
  };

  // Remove coupon
  const removeCoupon = () => {
    setSelectedCoupon(null);
    setCouponMessage("Coupon removed.");
  };

  // Update quantity
  const updateQuantity = (product, change) => {
    const id = product.id;
    const stock = Number(product.stock ?? 0);
    const current = Number(cart?.[id] || 0);
    const next = current + change;

    if (next > stock) {
      setCouponMessage("");
      alert("You have reached the available stock limit.");
      return;
    }

    setCart((previous) => {
      const updated = { ...previous };

      if (next <= 0) {
        delete updated[id];
      } else {
        updated[id] = next;
      }

      return updated;
    });
  };

  // Remove product from cart
  const removeItem = (id) => {
    setCart((previous) => {
      const updated = { ...previous };
      delete updated[id];
      return updated;
    });

    if (selectedCoupon) {
      setCouponMessage(
        "Your cart changed. Check the coupon's minimum order requirement."
      );
    }
  };

  // Keep cart context values updated
  useEffect(() => {
    setCount(totalItems);
    setproductIds(Object.keys(cart || {}).map(Number));
  }, [cart, totalItems, setCount, setproductIds]);

  // Checkout
  const handleCheckout = async () => {
    const token = Cookies.get("accessToken");
    const currentType = Cookies.get("type");

    if (!token) {
      alert("Please log in before checkout.");
      navigate("/login");
      return;
    }

    if (String(currentType) !== "2") {
      alert("Please log in with a customer account to checkout.");
      return;
    }

    if (cartProducts.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const invalidProduct = cartProducts.find((product) => {
      const stock = Number(product.stock ?? 0);

      return (
        product.cartQuantity > stock ||
        product.cartQuantity < 1
      );
    });

    if (invalidProduct) {
      alert(
        `${invalidProduct.name} has insufficient stock. Please update your cart.`
      );
      return;
    }

    if (selectedCoupon && !couponEligible) {
      alert(
        "Your order no longer meets this coupon's minimum amount. Please remove or reapply the coupon."
      );
      return;
    }

    setProcessing(true);

    try {
const checkoutData = {
  items: cartProducts.map((product) => ({
    product_id: Number(product.id),
    quantity: Number(product.cartQuantity),
  })),

  coupon_code: selectedCoupon?.code || null,

  // Coupon discount amount
  discount_amount: Number(couponDiscount.toFixed(2)),

  // Final amount after applying coupon and delivery charges
  total_amount: Number(finalTotal.toFixed(2)),
};

      const response = await axios.post(
        BUYING_API_URL,
        checkoutData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.status === 1) {
        navigate("/paymentsuccessful", {
          replace: true,
          state: {
            order: response.data.data,
          },
        });
      } else {
        alert(
          response.data?.message ||
            "Unable to complete your order."
        );
      }
    } catch (err) {
      console.error(
        "Checkout error:",
        err.response?.data || err.message
      );

      alert(
        err.response?.data?.message ||
          "Checkout failed. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft size={17} />
            Continue shopping
          </button>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-indigo-600">
                Your shopping bag
              </p>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Shopping Cart
              </h1>

              <p className="mt-2 text-slate-500">
                Review your items and confirm your order.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <ShoppingBag className="text-indigo-600" size={22} />
              <div>
                <p className="text-xs text-slate-500">Items in cart</p>
                <p className="font-extrabold">{totalItems}</p>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
            <p className="mt-4 font-semibold text-slate-600">
              Loading your cart...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center">
            <AlertCircle
              className="mx-auto text-rose-500"
              size={36}
            />
            <p className="mt-3 font-bold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && cartProducts.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
              <ShoppingCart size={38} />
            </div>

            <h2 className="mt-6 text-2xl font-black">
              Your cart is empty
            </h2>

            <p className="mt-3 text-slate-500">
              Looks like you haven't added anything to your cart yet.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700"
            >
              Start shopping
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {!loading && !error && cartProducts.length > 0 && (
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
            <section className="space-y-4">
              {cartProducts.map((product) => {
                const image = getImageUrl(
                  product.image ||
                    product.image_url ||
                    product.product_image
                );

                const originalPrice = Number(product.price || 0);

                const productDiscount = Math.min(
                  100,
                  Math.max(
                    0,
                    Number(product.discountPercentage || 0)
                  )
                );

                const discountedPrice = getProductPrice(product);
                const itemTotal =
                  discountedPrice * product.cartQuantity;
                const stock = Number(product.stock ?? 0);

                return (
                  <article
                    key={product.id}
                    className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row">
                      <div className="flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-4 sm:h-36 sm:w-36">
                        {image ? (
                          <img
                            src={image}
                            alt={product.name || product.title}
                            className="h-full w-full object-contain"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <ShoppingBag
                            size={40}
                            className="text-slate-300"
                          />
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-extrabold">
                              {product.name || product.title}
                            </h2>

                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                              {product.description ||
                                "Quality product selected for you."}
                            </p>

                            <p
                              className={`mt-2 text-xs font-semibold ${
                                stock > 0
                                  ? "text-emerald-700"
                                  : "text-rose-600"
                              }`}
                            >
                              {stock > 0
                                ? "Available for purchase"
                                : "Currently out of stock"}
                            </p>
                          </div>

                          <button
                            onClick={() => removeItem(product.id)}
                            aria-label={`Remove ${
                              product.name || "product"
                            } from cart`}
                            className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 size={19} />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-end justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-400">
                              Price per item
                            </p>

                            {productDiscount > 0 ? (
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-slate-400 line-through">
                                  ₹{formatPrice(originalPrice)}
                                </span>

                                <span className="text-lg font-black">
                                  ₹{formatPrice(discountedPrice)}
                                </span>

                                <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                                  {productDiscount}% OFF
                                </span>
                              </div>
                            ) : (
                              <p className="mt-1 text-lg font-black">
                                ₹{formatPrice(originalPrice)}
                              </p>
                            )}
                          </div>

                          <div className="flex h-10 items-center overflow-hidden rounded-xl border border-slate-200">
                            <button
                              onClick={() => updateQuantity(product, -1)}
                              aria-label="Decrease quantity"
                              className="flex h-full w-10 items-center justify-center text-slate-600 hover:bg-slate-100"
                            >
                              <Minus size={15} />
                            </button>

                            <span className="min-w-10 text-center text-sm font-extrabold">
                              {product.cartQuantity}
                            </span>

                            <button
                              onClick={() => updateQuantity(product, 1)}
                              disabled={product.cartQuantity >= stock}
                              aria-label="Increase quantity"
                              className="flex h-full w-10 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus size={15} />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-semibold text-slate-400">
                              Item total
                            </p>

                            <p className="mt-1 text-lg font-black text-indigo-700">
                              ₹{formatPrice(itemTotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <Truck
                  className="mt-0.5 shrink-0 text-emerald-700"
                  size={22}
                />
                <div>
                  <p className="font-bold text-emerald-900">
                    {subtotal >= 999
                      ? "You've unlocked free delivery!"
                      : `Add ₹${formatPrice(
                          Math.max(0, 999 - subtotal)
                        )} more for free delivery`}
                  </p>

                  <p className="mt-1 text-sm text-emerald-800">
                    Delivery is free on orders of ₹999 or more.
                  </p>
                </div>
              </div>
            </section>

            <aside className="lg:sticky lg:top-6">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-gradient-to-r from-indigo-700 to-violet-700 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <PackageCheck size={25} />
                    <h2 className="text-xl font-black">
                      Order Summary
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-indigo-100">
                    Check your total and apply a coupon.
                  </p>
                </div>

                <div className="space-y-4 p-6">
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <TicketPercent
                        className="text-indigo-600"
                        size={24}
                      />

                      <div>
                        <h3 className="font-extrabold text-slate-900">
                          Available Coupons
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Apply a coupon to save on your order.
                        </p>
                      </div>
                    </div>

                    {couponLoading && (
                      <p className="text-sm text-slate-500">
                        Loading coupons...
                      </p>
                    )}

                    {couponError && (
                      <div className="text-sm text-rose-600">
                        <p>{couponError}</p>
                        <button
                          type="button"
                          onClick={() => window.location.reload()}
                          className="mt-2 font-bold underline"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {!couponLoading &&
                      !couponError &&
                      coupons.length === 0 && (
                        <p className="text-sm text-slate-500">
                          No coupons are available right now.
                        </p>
                      )}

                    <div className="space-y-3">
                      {coupons.map((coupon) => {
                        const isApplied =
                          selectedCoupon?.id === coupon.id;

                        const minimum = Number(
                          coupon.minimumOrderAmount || 0
                        );

                        const eligible = subtotal >= minimum;

                        return (
                          <div
                            key={coupon.id}
                            className={`rounded-xl border bg-white p-3 ${
                              isApplied
                                ? "border-emerald-400 ring-1 ring-emerald-200"
                                : "border-slate-200"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-black tracking-wide text-indigo-700">
                                  {coupon.code}
                                </p>

                                <p className="mt-1 text-sm font-bold text-slate-800">
                                  {Number(coupon.discountPercentage)}% off
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  Minimum order: ₹{formatPrice(minimum)}
                                </p>

                                {coupon.expiryDate && (
                                  <p className="mt-1 text-xs text-slate-400">
                                    Expires:{" "}
                                    {new Date(
                                      coupon.expiryDate
                                    ).toLocaleDateString("en-IN")}
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  isApplied
                                    ? removeCoupon()
                                    : applyCoupon(coupon)
                                }
                                disabled={!eligible && !isApplied}
                                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-extrabold transition ${
                                  isApplied
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    : eligible
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                                }`}
                              >
                                {isApplied
                                  ? "Remove"
                                  : eligible
                                  ? "Apply"
                                  : "Not Eligible"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {couponMessage && (
                      <p
                        className={`mt-3 flex items-start gap-2 text-sm font-semibold ${
                          couponMessage.includes("successfully")
                            ? "text-emerald-700"
                            : "text-slate-600"
                        }`}
                      >
                        {couponMessage.includes("successfully") && (
                          <CheckCircle2
                            size={17}
                            className="mt-0.5 shrink-0"
                          />
                        )}
                        {couponMessage}
                      </p>
                    )}

                    {selectedCoupon && !couponEligible && (
                      <p className="mt-2 text-sm font-semibold text-rose-600">
                        Your cart no longer meets this coupon's minimum
                        order amount.
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-500">
                      Subtotal ({totalItems} items)
                    </span>
                    <span className="font-bold">
                      ₹{formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-500">Delivery</span>
                    <span
                      className={`font-bold ${
                        delivery === 0 ? "text-emerald-600" : ""
                      }`}
                    >
                      {delivery === 0
                        ? "FREE"
                        : `₹${formatPrice(delivery)}`}
                    </span>
                  </div>

                  {selectedCoupon && couponEligible && (
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-emerald-700">
                        Coupon ({selectedCoupon.code})
                      </span>
                      <span className="font-bold text-emerald-700">
                        -₹{formatPrice(couponDiscount)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-dashed border-slate-200 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-slate-700">
                        Final amount
                      </span>
                      <span className="text-2xl font-black text-indigo-700">
                        ₹{formatPrice(finalTotal)}
                      </span>
                    </div>

                    {couponEligible && selectedCoupon && (
                      <p className="mt-2 text-xs font-semibold text-emerald-700">
                        You're saving ₹{formatPrice(couponDiscount)} with
                        this coupon!
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-400">
                      The server will verify the final price before
                      placing your order.
                    </p>
                  </div>

                  {type === 2 && (
                    <button
                      onClick={handleCheckout}
                      disabled={
                        processing ||
                        cartProducts.length === 0 ||
                        (Boolean(selectedCoupon) && !couponEligible)
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 font-extrabold text-white shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CreditCard size={20} />
                      {processing
                        ? "Please wait..."
                        : "Proceed to Checkout"}
                      {!processing && <ArrowRight size={18} />}
                    </button>
                  )}

                  <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
                    <ShieldCheck
                      size={16}
                      className="text-emerald-600"
                    />
                    Secure checkout experience
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                    <p className="font-bold text-slate-700">
                      Payment information
                    </p>
                    This demo does not collect payment details or charge
                    your account. A payment gateway must be connected to
                    accept real payments.
                  </div>

                  <button
                    onClick={() => navigate("/")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    <ArrowLeft size={16} />
                    Continue shopping
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;