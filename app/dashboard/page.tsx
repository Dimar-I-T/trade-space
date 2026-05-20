"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Plus, Pencil, Trash2, Package, ShoppingBag, Wallet, Star } from "lucide-react";

interface User {
    _id: string;
    username: string;
    email: string;
    balance: number;
    createdAt?: string;
}

interface Item {
    _id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    condition: string;
    picture_url?: string;
    average_rating?: number;
    createdAt?: string;
}

interface Transaction {
    _id: string;
    seller_id: string;
    buyer_id: string;
    total_amount: number;
    item_snapshot: { name: string; price_paid: number };
    status: string;
    createdAt?: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAll() {
            try {
                // Auth check
                const meRes = await fetch("/api/auth/me");
                if (!meRes.ok) {
                    router.push("/login");
                    return;
                }
                const meData = await meRes.json();
                const me: User = meData.data;
                setUser(me);

                // Fetch user's listings
                const itemsRes = await fetch(`/api/items?user_id=${me._id}`);
                if (itemsRes.ok) {
                    const itemsData = await itemsRes.json();
                    setItems(itemsData.data ?? []);
                }
                // 500 with "Item not found for that user" = user has no listings yet, treat as empty

                // Fetch transactions for stats
                const txRes = await fetch("/api/transactions");
                if (txRes.ok) {
                    const txData = await txRes.json();
                    setTransactions(txData.data ?? []);
                }
            } catch {
                router.push("/login");
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, []);

    const handleDelete = async (itemId: string, itemName: string) => {
        if (!confirm(`Delete "${itemName}"? This cannot be undone.`)) return;
        setDeletingId(itemId);
        try {
            const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
            if (res.ok) {
                setItems((prev) => prev.filter((i) => i._id !== itemId));
            } else {
                alert("Failed to delete item. Please try again.");
            }
        } catch {
            alert("Something went wrong.");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D1229] flex items-center justify-center">
                <p className="text-cyan-400 text-lg font-medium animate-pulse">Loading dashboard...</p>
            </div>
        );
    }

    if (!user) return null;

    const salesTransactions = transactions.filter((tx) => tx.seller_id === user._id);
    const totalRevenue = salesTransactions.reduce((sum, tx) => sum + tx.total_amount, 0);
    const initial = user.username.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-[#0D1229] text-white">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-10">

                {/* ── PAGE HEADER ── */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-gray-400 text-sm mt-1">Manage your profile and listings</p>
                    </div>
                    <Link href="/sell">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-[#0D1229] font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20">
                            <Plus size={17} />
                            Sell New Product
                        </button>
                    </Link>
                </div>

                {/* ── PROFILE + STATS ── */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-10">

                    {/* Profile card — spans 1 col */}
                    <div className="bg-[#111827] border border-[#1E3A5F] rounded-2xl p-6 flex flex-col items-center text-center shadow-xl">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500 text-[#0D1229] font-bold text-2xl shadow-lg shadow-cyan-500/30 mb-4">
                            {initial}
                        </div>
                        <p className="text-white font-bold text-lg leading-tight">{user.username}</p>
                        <p className="text-gray-400 text-xs mt-1 truncate max-w-full">{user.email}</p>
                        {user.createdAt && (
                            <p className="text-gray-600 text-xs mt-2">
                                Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            </p>
                        )}
                    </div>

                    {/* Stats — spans 3 cols */}
                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">

                        <div className="bg-[#111827] border border-[#1E3A5F] rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                    <Wallet size={18} className="text-cyan-400" />
                                </div>
                                <span className="text-gray-400 text-sm">Balance</span>
                            </div>
                            <p className="text-2xl font-bold text-cyan-400">
                                Rp {(user.balance ?? 0).toLocaleString("id-ID")}
                            </p>
                            <Link href="/top-up" className="mt-3 inline-block">
                                <button className="px-3 py-1.5 rounded-lg border border-cyan-500/40 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300 text-xs font-bold transition">
                                    + Top Up
                                </button>
                            </Link>
                        </div>

                        <div className="bg-[#111827] border border-[#1E3A5F] rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                    <Package size={18} className="text-blue-400" />
                                </div>
                                <span className="text-gray-400 text-sm">Active Listings</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{items.length}</p>
                        </div>

                        <div className="bg-[#111827] border border-[#1E3A5F] rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <ShoppingBag size={18} className="text-emerald-400" />
                                </div>
                                <span className="text-gray-400 text-sm">Total Sales</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{salesTransactions.length}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Rp {totalRevenue.toLocaleString("id-ID")} earned
                            </p>
                        </div>

                    </div>
                </div>

                {/* ── MY LISTINGS ── */}
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-white">My Listings</h2>
                        <span className="text-xs text-gray-500 bg-[#111827] border border-[#1E3A5F] px-3 py-1 rounded-full">
                            {items.length} {items.length === 1 ? "product" : "products"}
                        </span>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-[#2D3A6B] rounded-2xl bg-[#111827]">
                            <Package size={40} className="text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium mb-2">No listings yet</p>
                            <p className="text-gray-600 text-sm mb-6">Start selling by listing your first product.</p>
                            <Link href="/sell">
                                <button className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-[#0D1229] rounded-xl text-sm font-bold transition shadow-lg shadow-cyan-500/20">
                                    + Sell New Product
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((item) => (
                                <div
                                    key={item._id}
                                    className="bg-[#111827] border border-[#1E3A5F] rounded-2xl overflow-hidden shadow-xl hover:border-cyan-500/30 transition group"
                                >
                                    {/* Image */}
                                    <div className="h-44 bg-[#1A2244] overflow-hidden flex items-center justify-center relative">
                                        {item.picture_url ? (
                                            <img
                                                src={item.picture_url}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                            />
                                        ) : (
                                            <Package size={32} className="text-gray-600" />
                                        )}
                                        {/* Condition badge */}
                                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-bold bg-[#0D1229]/80 border border-[#2D3A6B] text-gray-300">
                                            {item.condition}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 flex-1">
                                                {item.name}
                                            </h3>
                                            {item.average_rating != null && item.average_rating > 0 && (
                                                <div className="flex items-center gap-1 text-amber-400 text-xs flex-shrink-0">
                                                    <Star size={11} fill="currentColor" />
                                                    <span>{item.average_rating.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <span className="inline-block px-2 py-0.5 rounded-full bg-[#1A2244] border border-[#2D3A6B] text-gray-400 text-xs mb-3">
                                            {item.category}
                                        </span>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-cyan-400 font-bold text-base">
                                                    Rp {item.price.toLocaleString("id-ID")}
                                                </p>
                                                <p className="text-gray-500 text-xs mt-0.5">
                                                    {item.stock} in stock
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <Link href={`/sell/edit/${item._id}`}>
                                                    <button className="p-2 rounded-lg border border-[#2D3A6B] hover:border-blue-400/50 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition">
                                                        <Pencil size={14} />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item._id, item.name)}
                                                    disabled={deletingId === item._id}
                                                    className="p-2 rounded-lg border border-[#2D3A6B] hover:border-rose-400/50 hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 transition disabled:opacity-50"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
