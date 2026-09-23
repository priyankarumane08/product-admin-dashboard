import api from "@/lib/axios";

export async function loginUser(username, password) {
  const response = await api.post("/auth/login", {
    username,
    password,
    expiresInMins: 30
  });

  return response.data;
}