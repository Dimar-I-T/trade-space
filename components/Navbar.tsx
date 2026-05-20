"use client";

import Link from "next/link";
import { ShoppingCart, Search, Bell, ChevronDown, LayoutDashboard, ClipboardList, LogOut, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  username: string;
  email: string;
  balance: number;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    router.push(q ? `/items/search?q=${encodeURIComponent(q)}` : "/items/search");
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setUser(data.data))
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setDropdownOpen(false);
      setLoggingOut(false);
      router.push("/");
      router.refresh();
    }
  };

  const initial = user?.username?.charAt(0).toUpperCase() ?? "";

  return (
    <header className="bg-[#1D2559] px-6 py-3 shadow-md relative z-50">
      <div className="flex items-center justify-between">

        {/* LEFT */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <h1 className="text-2xl font-bold text-white">
            Trade<span className="text-blue-300">Space</span>
          </h1>
        </Link>

        {/* CENTER */}
        <form onSubmit={handleSearch} className="mx-10 flex w-full max-w-xl items-center rounded-2xl border border-blue-300 bg-[#22306B] px-4 py-2 focus-within:border-cyan-400 transition">
          <button type="submit" className="mr-2 text-gray-300 hover:text-cyan-400 transition flex-shrink-0">
            <Search size={18} />
          </button>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for laptops, gadgets, and electronics"
            className="w-full bg-transparent text-white placeholder:text-gray-300 outline-none text-sm"
          />
        </form>

        {/* RIGHT */}
        <div className="flex items-center gap-3 flex-shrink-0">

          {!authChecked ? (
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

              {/* Avatar + dropdown trigger */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-blue-800 group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-[#1D2559] font-bold text-sm shadow-lg shadow-cyan-500/30 group-hover:bg-cyan-400 transition">
                    {initial}
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-blue-300 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* ── DROPDOWN ── */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#1A2244] border border-[#2D3A6B] shadow-2xl shadow-black/40 overflow-hidden">

                    {/* Header — avatar, username, email */}
                    <div className="px-5 py-4 border-b border-[#2D3A6B]">
                      <div className="flex items-center gap-3">
                        {/* Large avatar */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-[#1D2559] font-bold text-lg flex-shrink-0 shadow-lg shadow-cyan-500/20">
                          {initial}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          {/* Username */}
                          <p className="text-white font-bold text-sm truncate leading-tight">
                            {user.username}
                          </p>
                          {/* Email */}
                          <p className="text-gray-500 text-xs truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="px-5 py-3 border-b border-[#2D3A6B] flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Balance</p>
                        <p className="text-cyan-400 font-bold text-sm">
                          Rp {(user.balance ?? 0).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <Link href="/top-up">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-xs font-bold transition">
                          <Plus size={13} />
                          Top Up
                        </button>
                      </Link>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition text-sm"
                      >
                        <LayoutDashboard size={16} className="text-blue-300" />
                        Dashboard
                      </Link>

                      <Link
                        href="/transactions"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition text-sm"
                      >
                        <ClipboardList size={16} className="text-blue-300" />
                        Transaction History
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-[#2D3A6B] py-2">
                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 px-5 py-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition text-sm disabled:opacity-50"
                      >
                        <LogOut size={16} />
                        {loggingOut ? "Signing out..." : "Logout"}
                      </button>
                    </div>

                  </div>
                )}
              </div>
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
