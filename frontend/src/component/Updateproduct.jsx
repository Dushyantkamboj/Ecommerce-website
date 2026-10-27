import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import {
  ArrowLeft,
  Package,
  ImagePlus,
  Upload,
  Tag,
  Boxes,
  FileText,
  IndianRupee,
  Save,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  LayoutDashboard,
} from "lucide-react";

const Updateproduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get("accessToken");

  const [formData, setFormData] = useState({
    productname: "",
    description: "",
    price: "",
    stock: "",
  });

  const [currentImage, setCurrentImage] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch existing product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `http://localhost:3000/api_v1/product/details/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Product API response:", response.data);

        const product =
          response.data?.data?.product ??
          response.data?.data?.products ??
          response.data?.data;

        if (!product || product.id == null) {
          throw new Error(
            "Product not found. Please check the API response."
          );
        }

        // IMPORTANT: Use productname, not name.
        setFormData({
          productname: product.name ?? "",
          description: product.description ?? "",
          price: product.price ?? "",
          stock: product.stock ?? "",
        });

        setCurrentImage(product.image ?? "");
      } catch (err) {
        console.error("Fetch product error:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load product details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (!id) {
      setError("Product ID is missing.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Your session has expired. Please log in again.");
      setLoading(false);
      return;
    }

    fetchProduct();
  }, [id, token]);

  // Create the image URL for displaying uploaded images
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";

    if (imagePath.startsWith("http://") ||
        imagePath.startsWith("https://")) {
      return imagePath;
    }

    const cleanPath = imagePath
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

    return `http://localhost:3000/${cleanPath}`;
  };

  // Update image preview when the selected image changes
  useEffect(() => {
    if (!newImage) {
      setImagePreview(getImageUrl(currentImage));
      return;
    }

    const previewUrl = URL.createObjectURL(newImage);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [newImage, currentImage]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, or WebP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    setNewImage(file);
    setError("");
    setSuccess("");
  };

  // Submit product update
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (formData.productname.trim().length < 2) {
      setError("Product name must contain at least 2 characters.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Product description is required.");
      return;
    }

    const price = Number(formData.price);
    const stock = Number(formData.stock);

    if (
      formData.price === "" ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setError("Price must be greater than zero.");
      return;
    }

    if (
      formData.stock === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError(
        "Stock must be a whole number greater than or equal to zero."
      );
      return;
    }

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();

      data.append("productname", formData.productname.trim());
      data.append("description", formData.description.trim());
      data.append("price", String(price));
      data.append("stock", String(stock));

      // Only upload an image if the admin selects a replacement.
      if (newImage) {
        data.append("image", newImage);
      }

      const response = await axios.patch(
        `http://localhost:3000/api_v1/product/update/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.data?.status === 0 ||
        response.data?.status === false
      ) {
        setError(
          response.data?.message || "Unable to update product."
        );
        return;
      }

      setSuccess(
        response.data?.message || "Product updated successfully!"
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 900);
    } catch (err) {
      console.error("Update product error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-10 shadow-sm">
          <LoaderCircle className="h-10 w-10 animate-spin text-blue-600" />
          <p className="font-medium text-slate-600">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Package size={22} />
            </div>

            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                Admin Panel
              </h2>
              <p className="text-xs text-slate-500">
                Product management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <LayoutDashboard size={17} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Breadcrumbs */}
        <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="transition hover:text-blue-600"
          >
            Products
          </button>

          <span>/</span>

          <span className="font-medium text-slate-800">
            Edit product
          </span>
        </div>

        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <RefreshCw size={14} />
              EDIT INVENTORY
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Update product
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Update product information, pricing, inventory, and product
              images from one place.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 sm:self-auto">
            <CheckCircle2 size={17} className="text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">
              Editing product #{id}
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <div className="flex-1">{error}</div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700"
          >
            <CheckCircle2 size={20} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            {/* Main form */}
            <div className="space-y-6 lg:col-span-2">
              {/* General information */}
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      General information
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Name and description of your product
                    </p>
                  </div>
                </div>

                <div className="space-y-5 p-5 sm:p-7">
                  <div>
                    <label
                      htmlFor="productname"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Product name <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Tag
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="productname"
                        name="productname"
                        type="text"
                        value={formData.productname}
                        onChange={handleChange}
                        placeholder="Enter product name"
                        required
                        minLength={2}
                        maxLength={150}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Product description{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the product and its key features..."
                      required
                      rows={5}
                      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />

                    <p className="mt-2 text-right text-xs text-slate-400">
                      {formData.description.length} characters
                    </p>
                  </div>
                </div>
              </section>

              {/* Pricing and inventory */}
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Boxes size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Pricing & inventory
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Manage your selling price and available quantity
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-7">
                  <div>
                    <label
                      htmlFor="price"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Selling price <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <IndianRupee
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="price"
                        name="price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        required
                        className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Enter the price in Indian rupees.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="stock"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Stock quantity <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Boxes
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="stock"
                        name="stock"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.stock}
                        onChange={handleChange}
                        placeholder="Enter quantity"
                        required
                        className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Use 0 if the product is out of stock.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Product image panel */}
            <aside className="space-y-6">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <ImagePlus size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Product image
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Preview and replace image
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex min-h-56 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt={formData.productname || "Product preview"}
                        className="max-h-64 w-full rounded-lg object-contain"
                        onError={(e) => {
                          console.error(
                            "Product image failed to load:",
                            e.currentTarget.src
                          );
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-10 text-slate-400">
                        <ImagePlus size={42} strokeWidth={1.4} />
                        <p className="text-sm">No image available</p>
                      </div>
                    )}
                  </div>

                  <label
                    htmlFor="image"
                    className="mt-4 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-slate-200 px-4 py-6 text-center transition hover:border-blue-400 hover:bg-blue-50/50"
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Upload size={20} />
                    </div>

                    <span className="text-sm font-semibold text-slate-700">
                      {newImage ? "Choose another image" : "Upload new image"}
                    </span>

                    <span className="mt-1 text-xs text-slate-400">
                      JPG, PNG, or WebP · Maximum 5 MB
                    </span>

                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>

                  {newImage && (
                    <div className="mt-3 flex items-start justify-between gap-3 rounded-lg bg-blue-50 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-blue-800">
                          {newImage.name}
                        </p>

                        <p className="mt-1 text-xs text-blue-600">
                          {(newImage.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setNewImage(null);
                          setError("");
                        }}
                        aria-label="Remove selected image"
                        className="rounded-lg p-1 text-blue-600 hover:bg-blue-100"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  )}

                  <p className="mt-4 text-xs leading-5 text-slate-400">
                    Leave this field empty to keep the current product image.
                  </p>
                </div>
              </section>

              {/* Inventory overview */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-bold text-slate-800">
                  Inventory overview
                </h3>

                <div className="flex items-center justify-between border-b border-slate-100 py-3">
                  <span className="text-sm text-slate-500">Product ID</span>

                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    #{id}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 py-3">
                  <span className="text-sm text-slate-500">Stock status</span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      Number(formData.stock) > 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {Number(formData.stock) > 0
                      ? "In stock"
                      : "Out of stock"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-sm text-slate-500">Selling price</span>

                  <span className="text-lg font-bold text-slate-900">
                    ₹
                    {Number(formData.price || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </section>
            </aside>
          </div>

          {/* Form actions */}
          <div className="mt-6 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
            >
              <ArrowLeft size={17} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || Boolean(success)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Saving changes...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={18} />
                  Updated successfully
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Product Management · Admin Panel
        </p>
      </main>
    </div>
  );
};

export default Updateproduct;
