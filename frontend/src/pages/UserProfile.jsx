
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Navigate, useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  Phone,
  Calendar,
  LockKeyhole,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

const API_URL = "http://localhost:3000/api_v1/user";

// PasswordField must stay OUTSIDE UserProfile.
// This prevents the input from losing focus on each keystroke.
const PasswordField = ({
  label,
  name,
  value,
  show,
  setShow,
  placeholder,
  onChange,
  autoComplete,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
        />

        <button
          type="button"
          onClick={() => setShow((previous) => !previous)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const navigate = useNavigate();

  const token = Cookies.get("accessToken");
  const type = Cookies.get("type");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch logged-in user's profile.
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || type !== "2") {
        setLoading(false);
        return;
      }

      try {
        setError("");

        const response = await axios.get(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = response.data;

        if (result.status === 0) {
          throw new Error(result.message || "Unable to load your profile.");
        }

        const user =
          result.data?.user ??
          result.data ??
          result.user ??
          null;

        if (!user) {
          throw new Error("Profile data was not returned by the server.");
        }

        setProfile(user);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, type]);

  // Update password input state.
  const handlePasswordInput = (event) => {
    const { name, value } = event.target;

    setPasswords((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // Change password.
  const handleChangePassword = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("Your new password must be different from your current password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      setSaving(true);

      // IMPORTANT:
      // This URL must match your backend PATCH route.
      // If your backend route is /change-password, replace /update below.
      const response = await axios.patch(
        `${API_URL}/update`,
        {
          currentPassword,
          newPassword,
          confirmPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === 0) {
        throw new Error(response.data.message || "Unable to update password.");
      }

      setSuccess(response.data.message || "Password changed successfully.");

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      const result=response.data;

      if(result.status){
        navigate('/login')
      }

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while changing your password."
      );
    } finally {
      setSaving(false);
    }
  };

  // Redirect unauthenticated users and non-customer accounts.
  if (!token || type !== "2") {
    return <Navigate to="/login" replace />;
  }

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "Not available";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-sm">
          <RefreshCw className="animate-spin text-indigo-600" size={22} />
          <p className="font-medium text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Page header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
            >
              <ArrowLeft size={17} />
              Back to shopping
            </button>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Manage your account details and password.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            <ShieldCheck size={18} />
            Customer Account
          </div>
        </div>

        {/* Error and success messages */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* Profile details */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-1">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white text-indigo-700 shadow-lg">
                <UserRound size={38} />
              </div>

              <h2 className="mt-4 break-words text-xl font-bold text-white">
                {profile?.name || "Customer"}
              </h2>

              <p className="mt-1 break-all text-sm text-indigo-100">
                {profile?.email || "No email available"}
              </p>
            </div>

            <div className="space-y-5 p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Account Information
              </h3>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                  <UserRound size={19} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">Full name</p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                    {profile?.name || "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-sky-50 p-2.5 text-sky-600">
                  <Mail size={19} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">Email address</p>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                    {profile?.email || "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                  <Phone size={19} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">Phone number</p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                    {profile?.phone ?? "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
                  <Calendar size={19} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">Member since</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(profile?.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Change password */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
            <div className="mb-7 flex items-start gap-4">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <LockKeyhole size={25} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Change Password
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Enter your current password and choose a strong new password.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <PasswordField
                label="Current password"
                name="currentPassword"
                value={passwords.currentPassword}
                show={showCurrentPassword}
                setShow={setShowCurrentPassword}
                onChange={handlePasswordInput}
                autoComplete="current-password"
                placeholder="Enter your current password"
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <PasswordField
                  label="New password"
                  name="newPassword"
                  value={passwords.newPassword}
                  show={showNewPassword}
                  setShow={setShowNewPassword}
                  onChange={handlePasswordInput}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />

                <PasswordField
                  label="Confirm new password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  show={showConfirmPassword}
                  setShow={setShowConfirmPassword}
                  onChange={handlePasswordInput}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                />
              </div>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                <p className="text-sm font-semibold text-indigo-900">
                  Password requirements
                </p>
                <ul className="mt-2 space-y-1 text-sm text-indigo-800">
                  <li>• Use at least 8 characters.</li>
                  <li>• Your new password must differ from the current one.</li>
                  <li>• Both new-password fields must match.</li>
                </ul>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setPasswords({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setError("");
                    setSuccess("");
                  }}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear fields
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
