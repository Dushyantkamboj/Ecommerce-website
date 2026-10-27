
import React, { useState } from "react";
import axios from "axios";

const Adminregister = () => {
  const [adminSecretKey, setAdminSecretKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!adminSecretKey.trim()) {
      setError("Please enter the admin secret key");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/api_v1/admin/register",
        {
          admin_secret_key: adminSecretKey,
        }
      );

      if (response.data.status === 1) {
        setMessage(response.data.message || "Admin registered successfully");
        setAdminSecretKey("");
      } else {
        setError(response.data.message || "Admin registration failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to connect to the server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
          Admin Registration
        </h1>

        <p className="mb-8 text-center text-sm text-gray-500">
          Enter your admin secret key to register.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="admin_secret_key"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Admin Secret Key
            </label>

            <input
              id="admin_secret_key"
              type="password"
              value={adminSecretKey}
              onChange={(e) => setAdminSecretKey(e.target.value)}
              placeholder="Enter admin secret key"
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          {message && (
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Adminregister;
