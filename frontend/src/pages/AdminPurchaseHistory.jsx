
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Users,
  IndianRupee,
  Package,
  Search,
  RefreshCw,
  CalendarDays,
  ReceiptText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const API_URL =
  "http://localhost:3000/api_v1/admin/history";

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

const AdminPurchaseHistory = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrders, setExpandedOrders] = useState({});

  const fetchPurchaseHistory = async () => {
    const token = Cookies.get("accessToken");
    const userType = Cookies.get("type");

    if (!token) {
      navigate("/adminlogin", { replace: true });
      return;
    }

    if (userType !== "1") {
      setError("Access denied. Only administrators can view all purchases.");
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
        const result = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        setOrders(result);
      } else {
        setError(
          response.data.message ||
            "Unable to fetch purchase history."
        );
      }
    } catch (err) {
      console.error(
        "Admin purchase history error:",
        err.response?.data || err.message
      );

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("You are not authorized to view all purchases.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load purchase history."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseHistory();
  }, []);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return orders;

    return orders.filter((order) => {
      const customer = order.user || {};
      const items = Array.isArray(order.items) ? order.items : [];

      const customerText = [
        customer.name,
        customer.email,
        customer.id,
        order.user_id,
        order.id,
        order.total_amount,
      ]
        .filter((value) => value !== undefined && value !== null)
        .join(" ")
        .toLowerCase();

      const productText = items
        .map((item) =>
          [
            item.product_name,
            item.product_id,
            item.price,
            item.quantity,
          ].join(" ")
        )
        .join(" ")
        .toLowerCase();

      return (
        customerText.includes(term) ||
        productText.includes(term)
      );
    });
  }, [orders, search]);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0
  );

  const uniqueCustomers = new Set(
    orders.map((order) => order.user_id).filter(Boolean)
  ).size;

  const totalProducts = orders.reduce(
    (sum, order) =>
      sum +
      (Array.isArray(order.items)
        ? order.items.reduce(
            (itemSum, item) => itemSum + Number(item.quantity || 0),
            0
          )
        : 0),
    0
  );

  const toggleOrder = (orderId) => {
    setExpandedOrders((previous) => ({
      ...previous,
      [orderId]: !previous[orderId],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-700">
              <ShoppingBag size={17} />
              ADMINISTRATION
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Purchase History
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              View customer orders and their purchased products.
            </p>
          </div>

          <button
            onClick={fetchPurchaseHistory}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Orders"
            value={orders.length}
            icon={<ShoppingBag size={22} />}
          />

          <SummaryCard
            title="Customers"
            value={uniqueCustomers}
            icon={<Users size={22} />}
          />

          <SummaryCard
            title="Products Purchased"
            value={totalProducts}
            icon={<Package size={22} />}
          />

          <SummaryCard
            title="Order Total"
            value={formatPrice(totalRevenue)}
            icon={<IndianRupee size={22} />}
          />
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <label
            htmlFor="purchase-search"
            className="mb-3 block text-sm font-bold text-gray-800"
          >
            Search purchase history
          </label>

          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />

            <input
              id="purchase-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer, email, order ID, or product..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-gray-100 bg-white py-20 text-center">
            <RefreshCw
              className="mx-auto mb-4 animate-spin text-green-600"
              size={36}
            />
            <p className="font-medium text-gray-600">
              Loading all customer orders...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
            <AlertCircle
              className="mx-auto mb-3 text-red-500"
              size={40}
            />

            <p className="font-medium text-gray-700">{error}</p>

            <button
              onClick={() => {
                if (!Cookies.get("accessToken")) {
                  navigate("/adminlogin");
                } else {
                  fetchPurchaseHistory();
                }
              }}
              className="mt-5 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-16 text-center">
            <ShoppingBag
              className="mx-auto mb-4 text-gray-300"
              size={48}
            />

            <h2 className="text-lg font-bold text-gray-800">
              {search
                ? "No matching purchases found"
                : "No purchase history yet"}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {search
                ? "Try a different customer, order ID, or product name."
                : "Customer orders will appear here after they place orders."}
            </p>
          </div>
        )}

        {/* Orders */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800">
                All Customer Orders
              </h2>

              <span className="text-sm text-gray-500">
                {filteredOrders.length}{" "}
                {filteredOrders.length === 1 ? "order" : "orders"}
              </span>
            </div>

            {filteredOrders.map((order) => {
              const customer = order.user || {};
              const items = Array.isArray(order.items)
                ? order.items
                : [];

              const expanded = Boolean(expandedOrders[order.id]);

              return (
                <section
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                >
                  {/* Order header */}
                  <div className="flex flex-col gap-5 border-b border-gray-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="grid flex-1 grid-cols-2 gap-5 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Order ID
                        </p>
                        <p className="mt-1 text-lg font-extrabold text-gray-900">
                          #{order.id}
                        </p>
                      </div>

                      <div>
                        <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                          <CalendarDays size={14} />
                          Purchase Date
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Order Total
                        </p>
                        <p className="mt-1 text-xl font-extrabold text-green-700">
                          {formatPrice(order.total_amount)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleOrder(order.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      {expanded ? "Hide Details" : "View Details"}
                      {expanded ? (
                        <ChevronUp size={17} />
                      ) : (
                        <ChevronDown size={17} />
                      )}
                    </button>
                  </div>

                  {/* Customer */}
                  <div className="grid gap-4 bg-gray-50/70 px-5 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Customer
                      </p>
                      <p className="mt-1 font-bold text-gray-800">
                        {customer.name || "Unknown customer"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Email Address
                      </p>
                      <p className="mt-1 break-all text-sm text-gray-700">
                        {customer.email || "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Customer ID
                      </p>
                      <p className="mt-1 font-semibold text-gray-800">
                        {order.user_id ?? customer.id ?? "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Product details */}
                  {expanded && (
                    <div className="p-5 sm:p-6">
                      <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                        <ReceiptText
                          size={19}
                          className="text-green-600"
                        />
                        Purchased Products ({items.length})
                      </h3>

                      {items.length === 0 ? (
                        <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                          No product details are available for this order.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[560px] text-left text-sm">
                            <thead>
                              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                                <th className="px-3 py-3">Product</th>
                                <th className="px-3 py-3">Product ID</th>
                                <th className="px-3 py-3">Price</th>
                                <th className="px-3 py-3">Quantity</th>
                                <th className="px-3 py-3 text-right">
                                  Subtotal
                                </th>
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                              {items.map((item) => (
                                <tr key={item.id}>
                                  <td className="px-3 py-4 font-semibold text-gray-800">
                                    {item.product_name ||
                                      "Unnamed product"}
                                  </td>

                                  <td className="px-3 py-4 text-gray-500">
                                    #{item.product_id}
                                  </td>

                                  <td className="px-3 py-4 text-gray-700">
                                    {formatPrice(item.price)}
                                  </td>

                                  <td className="px-3 py-4 text-gray-700">
                                    {item.quantity}
                                  </td>

                                  <td className="px-3 py-4 text-right font-bold text-gray-900">
                                    {formatPrice(
                                      Number(item.price) *
                                        Number(item.quantity)
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
                        <span className="text-sm font-semibold text-gray-500">
                          Total Order Amount
                        </span>
                        <span className="text-xl font-extrabold text-green-700">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-gray-400">
          Showing purchase records returned by your admin history API.
        </p>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, icon }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-2 break-words text-xl font-extrabold text-gray-900 sm:text-2xl">
          {value}
        </p>
      </div>

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
        {icon}
      </div>
    </div>
  </div>
);

export default AdminPurchaseHistory;
