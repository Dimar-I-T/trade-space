"use client";

import Link from "next/link";
import { ShoppingCart, Search, Bell } from "lucide-react";
import { useEffect, useState } from "react";

interface User {
  _id: string;
  username: string;
  email: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setUser(data.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);

  const initial = user?.username?.charAt(0).toUpperCase() ?? "";

  return (
    <header className="bg-[#1D2559] px-6 py-3 shadow-md">
      <div className="flex items-center justify-between">

        {/* LEFT */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-300">
            💻
          </div>
          <h1 className="text-2xl font-bold text-white">
            Trade<span className="text-blue-300">Space</span>
          </h1>
        </Link>

        {/* CENTER */}
        <div className="mx-10 flex w-full max-w-xl items-center rounded-2xl border border-blue-300 bg-[#22306B] px-4 py-2">
          <Search className="mr-2 text-gray-300 flex-shrink-0" size={18} />
          <input
            type="text"
            placeholder="Search for laptops, gadgets, and electronics"
            className="w-full bg-transparent text-white placeholder:text-gray-300 outline-none text-sm"
          />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 flex-shrink-0">

          {!authChecked ? (
            /* Loading placeholder — hindari flicker */
            <div className="w-32 h-9 rounded-xl bg-white/10 animate-pulse" />
          ) : user ? (
            /* ── LOGGED IN ── */
            <>
              <Link href="/cart">
                <button className="rounded-xl border border-blue-300 p-2.5 text-white transition hover:bg-blue-800">
                  <ShoppingCart size={20} />
                </button>
              </Link>

              <button className="rounded-xl border border-blue-300 p-2.5 text-white transition hover:bg-blue-800">
                <Bell size={20} />
              </button>

              <div className="h-7 w-[1px] bg-blue-300" />

              {/* Avatar inisial */}
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-[#1D2559] font-bold text-sm transition hover:bg-cyan-400 shadow-lg shadow-cyan-500/30">
                {initial}
              </button>
            </>
          ) : (
            /* ── GUEST ── */
            <>
              <div className="h-7 w-[1px] bg-blue-300" />

              <Link href="/login">
                <button className="rounded-xl border border-blue-300 px-6 py-2 text-white text-sm transition hover:bg-blue-800">
                  Sign in
                </button>
              </Link>

              <Link href="/register">
                <button className="rounded-xl bg-blue-300 px-6 py-2 text-[#1D2559] font-bold text-sm transition hover:bg-cyan-300">
                  Sign up
                </button>
              </Link>
            </>
          )}

        </div>
      </div>
    </header>
  );
}
