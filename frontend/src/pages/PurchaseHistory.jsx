import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/Navbar";

import {
  ShoppingBag,
  Package,
  CalendarDays,
  ReceiptText,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  PackageOpen,
  ShoppingCart,
} from "lucide-react";

const API_URL = "http://localhost:3000/api_v1/user/history";
const SERVER_URL = "http://localhost:3000";

const formatPrice = (amount) =>
  `₹${Number(amount ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getProductImage = (image) => {
  if (!image) return null;

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${SERVER_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

const PurchaseHistory = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPurchaseHistory = useCallback(async () => {
    const token = Cookies.get("accessToken");
    const userType = Cookies.get("type");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (userType !== "2") {
      setError("Purchase history is available to customer accounts only.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      

      if (response.data.status === 1) {
        const fetchedOrders = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        setOrders(fetchedOrders);
      } else {
        setError(
          response.data.message || "Could not load purchase history."
        );
      }
    } catch (err) {
      console.error(
        "Purchase history error:",
        err.response?.data || err.message
      );

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load your purchase history."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPurchaseHistory();
  }, [fetchPurchaseHistory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/products")}
          className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-gray-600 transition hover:text-green-700"
        >
          <ArrowLeft size={18} />
          Continue Shopping
        </button>

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              My Purchase History
            </h1>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              All your previous orders in one place.
            </p>
          </div>

          {!loading && !error && (
            <div className="inline-flex items-center gap-2 self-start rounded-xl bg-green-50 px-4 py-3 font-semibold text-green-800">
              <ShoppingBag size={19} />
              {orders.length} {orders.length === 1 ? "Order" : "Orders"}
            </div>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white py-20 text-center shadow-sm">
            <RefreshCw
              size={36}
              className="mx-auto mb-4 animate-spin text-green-600"
            />
            <p className="font-medium text-gray-600">
              Loading your purchase history...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm">
            <AlertCircle
              size={42}
              className="mx-auto mb-4 text-red-500"
            />
            <p className="text-gray-700">{error}</p>

            <button
              onClick={() => {
                if (!Cookies.get("accessToken")) {
                  navigate("/login");
                } else {
                  fetchPurchaseHistory();
                }
              }}
              className="mt-5 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <PackageOpen size={36} className="text-green-600" />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              No purchases yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              Your purchase history will appear here after you place your
              first order.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              <ShoppingCart size={18} />
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : [];

              return (
                <section
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="border-b border-gray-100 bg-gray-50/80 p-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                          Order ID
                        </p>
                        <p className="mt-1 text-base font-bold text-gray-900">
                          #{order.id}
                        </p>
                      </div>

                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
                          <CalendarDays size={14} />
                          Order Date
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                          Total Amount
                        </p>
                        <p className="mt-1 text-xl font-extrabold text-green-700">
                          {formatPrice(order.total_amount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                      <Package size={19} className="text-green-600" />
                      Purchased Products
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                        {items.length}
                      </span>
                    </h3>

                    {items.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {items.map((item, index) => {
                          const image = getProductImage(item.image);

                          return (
                            <div
                              key={item.id ?? `${order.id}-${index}`}
                              className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                            >
                              {image ? (
                                <img
                                  src={image}
                                  alt={item.product_name || "Purchased product"}
                                  onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                  }}
                                  className="h-20 w-20 shrink-0 rounded-xl border border-gray-100 bg-white object-contain p-2 sm:h-24 sm:w-24"
                                />
                              ) : (
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-50 sm:h-24 sm:w-24">
                                  <PackageOpen
                                    size={28}
                                    className="text-gray-400"
                                  />
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <h4 className="break-words font-semibold text-gray-900">
                                  {item.product_name ||
                                    item.product?.name ||
                                    "Product"}
                                </h4>

                                <p className="mt-1 text-sm text-gray-500">
                                  {formatPrice(item.price)} ×{" "}
                                  {Number(item.quantity || 0)}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  Quantity: {Number(item.quantity || 0)}
                                </p>
                              </div>

                              <div className="shrink-0 text-right">
                                <p className="font-bold text-gray-900">
                                  {formatPrice(
                                    Number(item.price || 0) *
                                      Number(item.quantity || 0)
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl bg-gray-50 px-4 py-5 text-sm text-gray-500">
                        Product details are not available for this order.
                      </div>
                    )}

                    {/* Order total */}
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-5">
                      <span className="flex items-center gap-2 text-sm font-medium text-gray-500">
                        <ReceiptText size={18} />
                        Order Total
                      </span>

                      <span className="text-lg font-extrabold text-green-700">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default PurchaseHistory;
