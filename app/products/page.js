"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";
import Pagination from "@/components/Pagination";
import ProductForm from "@/components/ProductForm";
import {
  addProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct
} from "@/api/products";

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <ProductsContent />
    </ProtectedRoute>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limitValue = Number(searchParams.get("limit"));
  const limit = [10, 20, 50].includes(limitValue) ? limitValue : 10;
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const order = searchParams.get("order") === "desc" ? "desc" : "asc";

  const [inputSearch, setInputSearch] = useState(search);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    setInputSearch(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputSearch === search) return;
      updateUrl({
        search: inputSearch,
        page: 1
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [inputSearch, search]);

  useEffect(() => {
    let active = true;

    getCategories()
      .then((data) => {
        if (!active) return;

        const values = Array.isArray(data)
          ? data.map((item) =>
              typeof item === "string" ? item : item.slug || item.name
            )
          : [];

        setCategories(values.filter(Boolean));
      })
      .catch(() => {
        if (active) setCategories([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const loadProducts = useCallback(async () => {
    const id = ++requestId.current;
    const controller = new AbortController();

    setLoading(true);
    setError("");

    try {
      const data = await getProducts({
        page,
        limit,
        search,
        category,
        sortBy,
        order,
        signal: controller.signal
      });

      if (id !== requestId.current) return;

      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) {
      if (err.code === "ERR_CANCELED" || err.name === "CanceledError") return;

      if (id === requestId.current) {
        setError(err.userMessage || "Failed to load products.");
      }
    } finally {
      if (id === requestId.current) {
        setLoading(false);
      }
    }

    return () => controller.abort();
  }, [page, limit, search, category, sortBy, order]);

  useEffect(() => {
    let cleanup;

    loadProducts().then((result) => {
      cleanup = result;
    });

    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, [loadProducts]);

  const queryNote = useMemo(() => {
    if (search && category) {
      return "Search is active. Category is ignored because DummyJSON does not support search and category filtering in the same API request.";
    }

    return "";
  }, [search, category]);

  function updateUrl(values) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(values).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    router.push(`/products?${params.toString()}`);
  }

  function handleLimitChange(value) {
    updateUrl({ limit: value, page: 1 });
  }

  function handleCategoryChange(value) {
    updateUrl({ category: value, page: 1 });
  }

  function handleSortChange(value) {
    if (!value) {
      updateUrl({ sortBy: "", order: "", page: 1 });
      return;
    }

    updateUrl({ sortBy: value, order, page: 1 });
  }

  function handleOrderChange(value) {
    updateUrl({ order: value, page: 1 });
  }

  function openAdd() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEdit(product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  async function handleSave(formData) {
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      if (editingProduct) {
        const result = await updateProduct(editingProduct.id, formData);

        setProducts((current) =>
          current.map((item) =>
            item.id === editingProduct.id ? { ...item, ...formData, ...result } : item
          )
        );
      } else {
        const result = await addProduct(formData);
        setProducts((current) => [{ ...result, ...formData }, ...current]);
        setTotal((current) => current + 1);
      }

      setFormOpen(false);
      setEditingProduct(null);
    } catch (err) {
      setError(err.userMessage || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"?`
    );

    if (!confirmed) return;

    try {
      await deleteProduct(product.id);
      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );
      setTotal((current) => Math.max(0, current - 1));
    } catch (err) {
      setError(err.userMessage || "Failed to delete product.");
    }
  }

  if (formOpen) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <ProductForm
            product={editingProduct}
            onSubmit={handleSave}
            onCancel={() => {
              setFormOpen(false);
              setEditingProduct(null);
            }}
            saving={saving}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Products</h2>
            <p className="text-sm text-slate-500">
              Manage products from the DummyJSON API.
            </p>
          </div>

          <button
            onClick={openAdd}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Add Product
          </button>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-4">
            <input
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              placeholder="Search products..."
              className="rounded-md border px-3 py-2 outline-none focus:border-blue-500 md:col-span-2"
            />

            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="rounded-md border bg-white px-3 py-2"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="rounded-md border bg-white px-3 py-2"
            >
              <option value="">Sort by</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="title">Title</option>
            </select>
          </div>

          {sortBy && (
            <div className="mt-3">
              <select
                value={order}
                onChange={(e) => handleOrderChange(e.target.value)}
                className="rounded-md border bg-white px-3 py-2 text-sm"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          )}

          {queryNote && (
            <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              {queryNote}
            </p>
          )}
        </div>

        {error && (
          <div className="mt-6">
            <ErrorState message={error} onRetry={loadProducts} />
          </div>
        )}

        {loading ? (
          <Loader />
        ) : products.length === 0 ? (
          <div className="mt-6 rounded-lg border bg-white p-10 text-center text-slate-600">
            Nothing found.
          </div>
        ) : (
          <>
            <div className="mt-6 hidden overflow-x-auto rounded-xl border bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="p-4">Image</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b last:border-0">
                      <td className="p-4">
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="h-14 w-14 rounded-md object-cover"
                        />
                      </td>
                      <td className="p-4 font-medium">{product.title}</td>
                      <td className="p-4">{product.category}</td>
                      <td className="p-4">${product.price}</td>
                      <td className="p-4">{product.rating}</td>
                      <td className="p-4">{product.stock}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/products/${product.id}`)}
                            className="rounded border px-3 py-1"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEdit(product)}
                            className="rounded border px-3 py-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="rounded border border-red-200 px-3 py-1 text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-4 md:hidden">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="mb-4 h-48 w-full rounded-lg object-cover"
                  />
                  <h3 className="font-semibold">{product.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {product.category}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <p>Price: ${product.price}</p>
                    <p>Rating: {product.rating}</p>
                    <p>Stock: {product.stock}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => router.push(`/products/${product.id}`)}
                      className="rounded border px-3 py-1"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEdit(product)}
                      className="rounded border px-3 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="rounded border border-red-200 px-3 py-1 text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              total={total}
              limit={limit}
              onPageChange={(value) => updateUrl({ page: value })}
              onLimitChange={handleLimitChange}
            />
          </>
        )}
      </main>
    </>
  );
}