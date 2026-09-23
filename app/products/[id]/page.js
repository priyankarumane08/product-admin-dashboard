"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import Loader from "@/components/Loader";
import { getProductById } from "@/api/products";

export default function ProductDetailsPage() {
  return (
    <ProtectedRoute>
      <ProductDetails />
    </ProtectedRoute>
  );
}

function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const data = await getProductById(id, controller.signal);
        setProduct(data);
      } catch (err) {
        if (err.code === "ERR_CANCELED") return;

        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(err.userMessage || "Failed to load product.");
        }
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <Loader />
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h2 className="text-2xl font-bold">Product not found</h2>
          <p className="mt-2 text-slate-500">
            The requested product ID does not exist.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-white"
          >
            Back to Products
          </button>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white"
          >
            Retry
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <button
          onClick={() => router.push("/products")}
          className="mb-6 rounded-md border bg-white px-4 py-2"
        >
          ← Back
        </button>

        <div className="grid gap-8 rounded-xl border bg-white p-6 shadow-sm md:grid-cols-2">
          <div>
            <img
              src={product.thumbnail}
              alt={product.title}
              className="h-80 w-full rounded-lg object-contain bg-slate-50"
            />

            <div className="mt-4 grid grid-cols-4 gap-2">
              {(product.images || []).slice(0, 4).map((image) => (
                <img
                  key={image}
                  src={image}
                  alt={product.title}
                  className="h-20 w-full rounded border object-cover"
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold">{product.title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {product.category}
            </p>

            <p className="mt-6 text-2xl font-bold">${product.price}</p>
            <p className="mt-2">Rating: {product.rating}</p>
            <p className="mt-1">Stock: {product.stock}</p>

            <p className="mt-6 leading-7 text-slate-700">
              {product.description}
            </p>

            <div className="mt-8">
              <h3 className="text-xl font-semibold">Reviews</h3>

              {product.reviews?.length ? (
                <div className="mt-4 space-y-4">
                  {product.reviews.map((review, index) => (
                    <div key={`${review.reviewerEmail}-${index}`} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <strong>{review.reviewerName}</strong>
                        <span>Rating: {review.rating}</span>
                      </div>
                      <p className="mt-2 text-slate-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-slate-500">No reviews found.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}