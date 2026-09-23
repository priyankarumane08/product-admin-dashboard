"use client";

import { useEffect, useState } from "react";

const emptyProduct = {
  title: "",
  description: "",
  category: "",
  price: "",
  stock: "",
  rating: "",
  thumbnail: ""
};

export default function ProductForm({ product, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(emptyProduct);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || "",
        description: product.description || "",
        category: product.category || "",
        price: product.price ?? "",
        stock: product.stock ?? "",
        rating: product.rating ?? "",
        thumbnail: product.thumbnail || ""
      });
    } else {
      setForm(emptyProduct);
    }

    setErrors({});
  }, [product]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.description.trim()) {
      nextErrors.description = "Description is required.";
    }
    if (!form.category.trim()) nextErrors.category = "Category is required.";
    if (form.price === "" || Number(form.price) < 0) {
      nextErrors.price = "Valid price is required.";
    }
    if (form.stock === "" || Number(form.stock) < 0) {
      nextErrors.stock = "Valid stock is required.";
    }
    if (form.rating !== "" && (Number(form.rating) < 0 || Number(form.rating) > 5)) {
      nextErrors.rating = "Rating must be between 0 and 5.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      rating: form.rating === "" ? 0 : Number(form.rating),
      thumbnail: form.thumbnail.trim()
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-white p-6 shadow-sm"
    >
      <h2 className="mb-5 text-xl font-semibold">
        {product ? "Edit Product" : "Add Product"}
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
        />

        <Field
          label="Category"
          name="category"
          value={form.category}
          onChange={handleChange}
          error={errors.category}
        />

        <Field
          label="Price"
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          error={errors.price}
        />

        <Field
          label="Stock"
          name="stock"
          type="number"
          value={form.stock}
          onChange={handleChange}
          error={errors.stock}
        />

        <Field
          label="Rating"
          name="rating"
          type="number"
          step="0.1"
          value={form.rating}
          onChange={handleChange}
          error={errors.rating}
        />

        <Field
          label="Thumbnail URL"
          name="thumbnail"
          value={form.thumbnail}
          onChange={handleChange}
        />

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-md border px-3 py-2 outline-none focus:border-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          disabled={saving}
          className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border bg-white px-5 py-2 font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  step
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full rounded-md border px-3 py-2 outline-none focus:border-blue-500"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}