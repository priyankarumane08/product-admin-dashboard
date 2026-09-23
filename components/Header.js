"use client";

import { useRouter } from "next/navigation";
import { clearAuth, getUser } from "@/lib/auth";

export default function Header() {
  const router = useRouter();
  const user = getUser();

  function handleLogout() {
    clearAuth();
    router.replace("/login");
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div>
          <h1 className="text-xl font-bold">Product Admin Dashboard</h1>
          <p className="text-sm text-slate-500">
            {user?.firstName || user?.username || "Admin"}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}