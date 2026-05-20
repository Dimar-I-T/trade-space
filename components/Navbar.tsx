"use client";

import Link from "next/link";
import { ShoppingCart, Search, Bell, ChevronDown, LayoutDashboard, ClipboardList, LogOut, Plus, ShoppingBag, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  username: string;
  email: string;
  balance: number;
}

interface Transaction {
  _id: string;
  buyer_id: string;
  seller_id: string;
  item_snapshot: { name: string; price_paid: number };
  total_amount: number;
  status: string;
  createdAt?: string;
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastSeenId, setLastSeenId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

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

  // Mount + load last seen ID from localStorage
  useEffect(() => {
    setMounted(true);
    setLastSeenId(localStorage.getItem("notif_last_seen"));
  }, []);

  // Fetch transactions for notifications (only when logged in)
  useEffect(() => {
    if (!user) return;
    fetch("/api/transactions")
      .then((r) => r.json())
      .then((d) => setTransactions((d.data ?? []).slice(0, 10)))
      .catch(() => {});
  }, [user]);

  // Close both dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
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
      setNotifOpen(false);
      setLoggingOut(false);
      router.push("/");
      router.refresh();
    }
  };

  const handleBellClick = () => {
    setNotifOpen((v) => !v);
    setDropdownOpen(false);
    // Mark all as seen by saving the latest transaction ID
    if (transactions.length > 0) {
      const latestId = transactions[0]._id;
      localStorage.setItem("notif_last_seen", latestId);
      setLastSeenId(latestId);
    }
  };

  const handleAvatarClick = () => {
    setDropdownOpen((v) => !v);
    setNotifOpen(false);
  };

  const initial = user?.username?.charAt(0).toUpperCase() ?? "";
  // Dot muncul kalau sudah mounted, ada transaksi, dan belum pernah dilihat
  const unread = mounted && transactions.length > 0 && transactions[0]._id !== lastSeenId;

  // Format each transaction as a notification message
  const notifications = transactions.map((tx) => {
    const isBuyer = tx.buyer_id === user?._id;
    return {
      _id: tx._id,
      icon: isBuyer ? "purchase" : "sale",
      title: isBuyer
        ? `Order confirmed`
        : `Item sold`,
      body: isBuyer
        ? `Your purchase of "${tx.item_snapshot?.name}" is complete.`
        : `Someone bought your "${tx.item_snapshot?.name}".`,
      amount: tx.total_amount,
      isBuyer,
      createdAt: tx.createdAt,
    };
  });

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
            <>
              <Link href="/cart">
                <button className="rounded-xl border border-blue-300 p-2.5 text-white transition hover:bg-blue-800">
                  <ShoppingCart size={20} />
                </button>
              </Link>

              {/* ── BELL + NOTIF DROPDOWN ── */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={handleBellClick}
                  className="relative rounded-xl border border-blue-300 p-2.5 text-white transition hover:bg-blue-800"
                >
                  <Bell size={20} />
                  {unread && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#1D2559]" />
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#1A2244] border border-[#2D3A6B] shadow-2xl shadow-black/40 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-[#2D3A6B] flex items-center justify-between">
                      <p className="text-white font-bold text-sm">Notifications</p>
                      {notifications.length > 0 && (
                        <Link href="/transactions" onClick={() => setNotifOpen(false)}>
                          <span className="text-xs text-cyan-400 hover:text-cyan-300 transition">View all</span>
                        </Link>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-[#2D3A6B]">
                      {notifications.length === 0 ? (
                        <div className="px-5 py-8 text-center">
                          <Bell size={24} className="text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n._id}
                            href="/transactions"
                            onClick={() => setNotifOpen(false)}
                          >
                            <div className="flex items-start gap-3 px-4 py-3.5 hover:bg-white/5 transition cursor-pointer">
                              <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                                n.isBuyer
                                  ? "bg-rose-500/10 border border-rose-500/20"
                                  : "bg-emerald-500/10 border border-emerald-500/20"
                              }`}>
                                {n.isBuyer
                                  ? <ShoppingBag size={14} className="text-rose-400" />
                                  : <TrendingUp size={14} className="text-emerald-400" />
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-bold leading-tight">{n.title}</p>
                                <p className="text-gray-400 text-xs mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className={`text-xs font-bold ${n.isBuyer ? "text-rose-400" : "text-emerald-400"}`}>
                                    {n.isBuyer ? "−" : "+"} Rp {n.amount.toLocaleString("id-ID")}
                                  </span>
                                  {n.createdAt && (
                                    <span className="text-gray-600 text-xs">{timeAgo(n.createdAt)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-7 w-[1px] bg-blue-300" />

              {/* Avatar + dropdown trigger */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleAvatarClick}
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

                {/* ── PROFILE DROPDOWN ── */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#1A2244] border border-[#2D3A6B] shadow-2xl shadow-black/40 overflow-hidden">

                    <div className="px-5 py-4 border-b border-[#2D3A6B]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-[#1D2559] font-bold text-lg flex-shrink-0 shadow-lg shadow-cyan-500/20">
                          {initial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-bold text-sm truncate leading-tight">{user.username}</p>
                          <p className="text-gray-500 text-xs truncate mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </div>

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

                    <div className="py-2">
                      <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition text-sm">
                        <LayoutDashboard size={16} className="text-blue-300" />
                        Dashboard
                      </Link>
                      <Link href="/transactions" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition text-sm">
                        <ClipboardList size={16} className="text-blue-300" />
                        Transaction History
                      </Link>
                    </div>

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
