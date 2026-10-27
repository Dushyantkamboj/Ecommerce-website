
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const CreateCoupon = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
    minimumOrderAmount: "",
    expiryDate: "",
    usageLimit: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase().trim() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const token = Cookies.get("accessToken");
    const userType = Number(Cookies.get("type"));

    if (!token) {
      setError("Please log in before creating a coupon.");
      return;
    }

    if (userType !== 1) {
      setError("Only admins can create coupons.");
      return;
    }

    const discount = Number(formData.discountPercentage);
    const minimumAmount = Number(formData.minimumOrderAmount);
    const usageLimit = Number(formData.usageLimit);
    const expiry = new Date(formData.expiryDate);

    if (!/^[A-Z0-9_-]{3,50}$/.test(formData.code)) {
      setError(
        "Coupon code must be 3–50 characters using letters, numbers, underscores, or hyphens."
      );
      return;
    }

    if (!Number.isFinite(discount) || discount <= 0 || discount > 100) {
      setError("Discount must be greater than 0 and no more than 100%.");
      return;
    }

    if (!Number.isFinite(minimumAmount) || minimumAmount < 0) {
      setError("Minimum order amount cannot be negative.");
      return;
    }

    if (!Number.isInteger(usageLimit) || usageLimit < 1) {
      setError("Usage limit must be a positive whole number.");
      return;
    }

    if (
      !formData.expiryDate ||
      Number.isNaN(expiry.getTime()) ||
      expiry.getTime() <= Date.now()
    ) {
      setError("Please select a future expiry date and time.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/api_v1/admin/coupon",
        {
          code: formData.code,
          discountPercentage: discount,
          minimumOrderAmount: minimumAmount,
          expiryDate: expiry.toISOString(),
          usageLimit,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.status === 1) {
        setMessage(
          response.data.message || "Coupon created successfully!"
        );

        setFormData({
          code: "",
          discountPercentage: "",
          minimumOrderAmount: "",
          expiryDate: "",
          usageLimit: "",
        });

        // Redirect after displaying the success message briefly.
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        setError(
          response.data?.message || "Could not create coupon."
        );
      }
    } catch (err) {
      console.error(
        "Create coupon error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Something went wrong while creating the coupon."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Admin Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Coupon Management
          </h1>

          <p className="mt-2 text-slate-500">
            Create promotional coupons for your customers.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8"
        >
          <h2 className="mb-6 text-xl font-bold text-slate-800">
            Create New Coupon
          </h2>

          {message && (
            <div
              role="status"
              className="mb-5 rounded-lg bg-green-50 p-3 text-green-700"
            >
              {message}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg bg-red-50 p-3 text-red-700"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="code"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Coupon Code
              </label>

              <input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. SAVE10"
                minLength={3}
                maxLength={50}
                pattern="[A-Za-z0-9_-]+"
                title="Use letters, numbers, underscores, or hyphens."
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="discountPercentage"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Discount Percentage (%)
              </label>

              <input
                id="discountPercentage"
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                placeholder="10"
                min="0.01"
                max="100"
                step="0.01"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="minimumOrderAmount"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Minimum Order Amount (₹)
              </label>

              <input
                id="minimumOrderAmount"
                type="number"
                name="minimumOrderAmount"
                value={formData.minimumOrderAmount}
                onChange={handleChange}
                placeholder="1000"
                min="0"
                step="0.01"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="expiryDate"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Expiry Date and Time
              </label>

              <input
                id="expiryDate"
                type="datetime-local"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                min={new Date(
                  Date.now() - new Date().getTimezoneOffset() * 60000
                )
                  .toISOString()
                  .slice(0, 16)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="usageLimit"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Usage Limit
              </label>

              <input
                id="usageLimit"
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
                placeholder="100"
                min="1"
                step="1"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {formData.code && (
            <div className="mt-6 rounded-xl border border-dashed border-blue-300 bg-blue-50 p-5">
              <p className="mb-2 text-sm text-blue-700">
                Coupon Preview
              </p>

              <div className="flex items-center justify-between gap-3">
                <span className="break-all text-xl font-bold text-slate-900">
                  {formData.code}
                </span>

                <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                  {formData.discountPercentage || 0}% OFF
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600">
                Minimum purchase: ₹
                {Number(formData.minimumOrderAmount || 0).toLocaleString(
                  "en-IN",
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          >
            {loading ? "Creating Coupon..." : "Create Coupon"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCoupon;