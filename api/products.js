import api from "@/lib/axios";

export async function getProducts({
  page = 1,
  limit = 10,
  search = "",
  category = "",
  sortBy = "",
  order = "asc",
  signal
}) {
  const skip = (page - 1) * limit;

  const params = {
    limit,
    skip
  };

  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order;
  }

  let url = "/products";

  if (search.trim()) {
    url = "/products/search";
    params.q = search.trim();
  } else if (category) {
    url = `/products/category/${encodeURIComponent(category)}`;
  }

  const response = await api.get(url, { params, signal });
  return response.data;
}

export async function getCategories() {
  const response = await api.get("/products/categories");
  return response.data;
}

export async function getProductById(id, signal) {
  const response = await api.get(`/products/${id}`, { signal });
  return response.data;
}

export async function addProduct(product) {
  const response = await api.post("/products/add", product);
  return response.data;
}

export async function updateProduct(id, product) {
  const response = await api.put(`/products/${id}`, product);
  return response.data;
}

export async function deleteProduct(id) {
  const response = await api.delete(`/products/${id}`);
  return response.data;
}