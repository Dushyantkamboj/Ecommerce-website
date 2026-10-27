
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  UserRound,
  Sparkles,
  ArrowUpRight,
  Trash2,
} from "lucide-react";

const API_URL = "http://localhost:3000/api_v1/admin";

const UserDetails = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const token = Cookies.get("accessToken");
  const type = Number(Cookies.get("type"));

  // Fetch customers
  const fetchUsers = useCallback(async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(`${API_URL}/list`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
      });

      const data = response.data;

      const userList = Array.isArray(data)
        ? data
        : data.users || data.data?.users || data.data || [];

      setUsers(
        (Array.isArray(userList) ? userList : []).filter(
          (user) => Number(user.type) === 2
        )
      );
    } catch (err) {
      console.error("Error fetching users:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load customers. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (token && type === 1) {
      fetchUsers();
    }
  }, [fetchUsers, token, type]);

  // Delete customer: send ID in the request BODY
  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name || "this customer"}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(user.id);
      setError("");

      const response = await axios.delete(`${API_URL}/delete`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        data: {
          id: user.id,
        },
      });

      if (
        response.data?.status === 0 ||
        response.data?.success === false
      ) {
        setError(
          response.data.message || "Unable to delete this customer."
        );
        return;
      }

      // Remove the customer from the UI after successful deletion
      setUsers((previousUsers) =>
        previousUsers.filter(
          (item) => String(item.id) !== String(user.id)
        )
      );
    } catch (err) {
      console.error("Error deleting customer:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete customer. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Search customers
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) =>
      [user.name, user.email, user.phone, user.age, user.id].some(
        (value) => String(value ?? "").toLowerCase().includes(query)
      )
    );
  }, [users, search]);

  // Only admins can access this page
  if (!token || type !== 1) {
    return <Navigate to="/adminlogin" replace />;
  }

  const stats = [
    {
      title: "Total Customers",
      value: users.length,
      description: "Registered customer accounts",
      icon: Users,
      light: "bg-indigo-50",
      iconColor: "text-indigo-600",
      gradient: "from-indigo-600 to-violet-600",
    },
    {
      title: "Active Customers",
      value: users.filter((user) => !user.is_deleted).length,
      description: "Currently active accounts",
      icon: UserCheck,
      light: "bg-emerald-50",
      iconColor: "text-emerald-600",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: "Search Results",
      value: filteredUsers.length,
      description: "Customers matching your search",
      icon: Search,
      light: "bg-orange-50",
      iconColor: "text-orange-600",
      gradient: "from-orange-500 to-rose-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Heading */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm">
              <Sparkles size={14} />
              ADMINISTRATION
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Customer Management
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
              View, search, and manage your registered customers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchUsers(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                style={{ animationDelay: `${index * 120}ms` }}
                className="group relative animate-[fadeIn_0.6s_ease-out_both] overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-indigo-200 hover:shadow-xl"
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-50/70 transition-transform duration-500 group-hover:scale-150" />

                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>

                    <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600">
                      {loading ? "—" : stat.value}
                    </h2>

                    <p className="mt-3 text-xs text-slate-500">
                      {stat.description}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.light} ${stat.iconColor} transition-all duration-300 group-hover:rotate-6 group-hover:scale-110`}
                  >
                    <Icon size={23} strokeWidth={2} />
                  </div>
                </div>

                <div
                  className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${stat.gradient} transition-all duration-500 group-hover:w-full`}
                />
              </div>
            );
          })}
        </div>

        {/* Customer Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
          {/* Table Header */}
          <div className="border-b border-slate-100 px-5 py-6 sm:px-7">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Users size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Registered Customers
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Customer account directory
                  </p>
                </div>
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, phone..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="m-5 flex flex-col gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
              <p>{error}</p>

              <button
                type="button"
                onClick={() => fetchUsers(true)}
                className="font-semibold underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-7 py-4 font-semibold">
                        Customer
                      </th>
                      <th className="px-6 py-4 font-semibold">
                        Contact
                      </th>
                      <th className="px-6 py-4 font-semibold">Age</th>
                      <th className="px-6 py-4 font-semibold">
                        Account Type
                      </th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <tr
                          key={user.id}
                          style={{
                            animationDelay: `${index * 40}ms`,
                          }}
                          className="group animate-[fadeIn_0.4s_ease-out_both] transition-colors hover:bg-indigo-50/40"
                        >
                          {/* Customer */}
                          <td className="px-7 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm transition-transform group-hover:scale-110">
                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 group-hover:text-indigo-700">
                                  {user.name || "Unnamed User"}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  ID: #{user.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail
                                size={15}
                                className="shrink-0 text-slate-400"
                              />
                              <span className="break-all">
                                {user.email || "—"}
                              </span>
                            </div>

                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                              <Phone
                                size={14}
                                className="shrink-0 text-slate-400"
                              />
                              {user.phone || "—"}
                            </div>
                          </td>

                          {/* Age */}
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                              <Calendar
                                size={14}
                                className="text-slate-400"
                              />
                              {user.age ?? "—"}
                            </span>
                          </td>

                          {/* Account Type */}
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                              <ShieldCheck size={14} />
                              Customer
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-5 text-right">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                user.is_deleted
                                  ? "bg-red-50 text-red-600"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  user.is_deleted
                                    ? "bg-red-500"
                                    : "bg-emerald-500"
                                }`}
                              />
                              {user.is_deleted ? "Inactive" : "Active"}
                            </span>
                          </td>

                          {/* Delete Action */}
                          <td className="px-6 py-5 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              disabled={deletingId === user.id}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-all hover:border-red-300 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                              {deletingId === user.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <UserRound size={30} />
                          </div>

                          <h3 className="mt-4 font-semibold text-slate-800">
                            {search
                              ? "No matching customers"
                              : "No customers yet"}
                          </h3>

                          <p className="mt-2 text-sm text-slate-500">
                            {search
                              ? "Try searching with a different name or email."
                              : "Registered customer accounts will appear here."}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Customer Cards */}
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:hidden">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <div
                      key={user.id}
                      style={{
                        animationDelay: `${index * 70}ms`,
                      }}
                      className="group animate-[fadeIn_0.4s_ease-out_both] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
                    >
                      {/* Customer Heading */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-bold text-slate-800">
                              {user.name || "Unnamed User"}
                            </h3>
                            <p className="text-xs text-slate-400">
                              Customer #{user.id}
                            </p>
                          </div>
                        </div>

                        <ArrowUpRight
                          size={18}
                          className="shrink-0 text-slate-300 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-indigo-600"
                        />
                      </div>

                      {/* Customer Details */}
                      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                        <p className="flex items-start gap-3 break-all text-sm text-slate-600">
                          <Mail
                            size={16}
                            className="mt-0.5 shrink-0 text-indigo-500"
                          />
                          {user.email || "—"}
                        </p>

                        <p className="flex items-center gap-3 text-sm text-slate-600">
                          <Phone
                            size={16}
                            className="shrink-0 text-indigo-500"
                          />
                          {user.phone || "—"}
                        </p>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <span className="text-sm text-slate-500">
                            Age: {user.age ?? "—"}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              user.is_deleted
                                ? "bg-red-50 text-red-600"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {user.is_deleted ? "Inactive" : "Active"}
                          </span>
                        </div>
                      </div>

                      {/* Mobile Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user)}
                        disabled={deletingId === user.id}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        {deletingId === user.id
                          ? "Deleting..."
                          : "Delete Customer"}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-14 text-center">
                    <UserRound
                      size={36}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-3 font-semibold text-slate-700">
                      No customers found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try another search term.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer */}
          {!loading && !error && (
            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <p>
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {filteredUsers.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-800">
                  {users.length}
                </span>{" "}
                customers
              </p>

              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Customer directory
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Page Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default UserDetails;
