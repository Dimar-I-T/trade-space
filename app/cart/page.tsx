"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Trash2, Package, ShoppingCart } from "lucide-react";

interface CartItem {
    _id: string;
    qty: number;
    price_snap: number;
    item_id?: {
        _id: string;
        name?: string;
        title?: string;
        price: number;
        picture_url?: string;
        image?: string;
    };
    itemId?: {
        _id: string;
        name?: string;
        title?: string;
        price: number;
        picture_url?: string;
        image?: string;
    };
}

export default function CartPage() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const fetchCart = async () => {
        try {
            const res = await fetch("/api/users/cart");

            if (res.status === 401 || res.status === 403) {
                setIsGuest(true);
                setLoading(false);
                return;
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                const msg: string = errData?.message ?? "";
                if (
                    msg.toLowerCase().includes("unauthorized") ||
                    msg.toLowerCase().includes("must login") ||
                    msg.toLowerCase().includes("jwt")
                ) {
                    setIsGuest(true);
                    setLoading(false);
                    return;
                }
                throw new Error(msg || "server error");
            }

            const data = await res.json();
            let extracted: CartItem[] = [];
            if (Array.isArray(data)) extracted = data;
            else if (Array.isArray(data.data)) extracted = data.data;
            else if (Array.isArray(data.cart)) extracted = data.cart;
            else if (data.data && Array.isArray(data.data.cart)) extracted = data.data.cart;
            else if (data.user && Array.isArray(data.user.cart)) extracted = data.user.cart;

            setCartItems(extracted);
            // auto-select all on first load
            setSelected(new Set(extracted.map((e) => getProductId(e))));
        } catch {
            setError("Failed to load cart.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCart(); }, []);

    const getProductId = (entry: CartItem) =>
        entry.item_id?._id || entry.itemId?._id || entry._id;

    const handleDelete = async (targetId: string) => {
        if (!confirm("Remove this item from your cart?")) return;
        setActionLoading(targetId);
        try {
            const res = await fetch(`/api/users/cart/${targetId}`, { method: "DELETE" });
            if (res.status === 401 || res.status === 403) { router.push("/login"); return; }
            if (res.ok) {
                setCartItems((prev) => prev.filter((e) => getProductId(e) !== targetId));
                setSelected((prev) => { const s = new Set(prev); s.delete(targetId); return s; });
            }
        } catch {
            setError("Failed to remove item.");
        } finally {
            setActionLoading(null);
        }
    };

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    };

    const allIds = cartItems.map(getProductId);
    const allChecked = allIds.length > 0 && allIds.every((id) => selected.has(id));
    const someChecked = allIds.some((id) => selected.has(id));

    const toggleAll = () => {
        if (allChecked) setSelected(new Set());
        else setSelected(new Set(allIds));
    };

    const selectedItems = cartItems.filter((e) => selected.has(getProductId(e)));
    const selectedTotal = selectedItems.reduce((sum, e) => sum + e.price_snap * e.qty, 0);

    const handleCheckout = () => {
        if (selected.size === 0) return;
        // Save selected item IDs to sessionStorage for checkout page
        const payload = selectedItems.map((e) => ({
            item_id: getProductId(e),
            name: e.item_id?.name || e.itemId?.name || "Unknown product",
            picture_url: e.item_id?.picture_url || e.itemId?.picture_url || null,
            price_snap: e.price_snap,
            qty: e.qty,
        }));
        sessionStorage.setItem("checkout_items", JSON.stringify(payload));
        router.push("/checkout");
    };

    // ── LOADING ──────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D1229] flex items-center justify-center">
                <p className="text-cyan-400 text-lg font-medium animate-pulse">Loading your cart...</p>
            </div>
        );
    }

    // ── GUEST ────────────────────────────────────────────────────
    if (isGuest) {
        return (
            <div className="min-h-screen bg-[#0D1229] text-white">
                <Navbar />
                <main className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-[#1A2244] border border-cyan-500/30 flex items-center justify-center mb-6">
                        <ShoppingCart size={36} className="text-cyan-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-3">Your Cart</h1>
                    <p className="text-gray-400 mb-2">You are not logged in.</p>
                    <p className="text-gray-500 text-sm mb-8">Sign in to view and manage your shopping cart.</p>
                    <div className="flex gap-3">
                        <Link href="/login">
                            <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-[#0D1229] font-bold rounded-xl transition shadow-lg shadow-cyan-500/20">
                                Sign In
                            </button>
                        </Link>
                        <Link href="/register">
                            <button className="px-6 py-3 border border-cyan-500/50 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300 font-bold rounded-xl transition">
                                Register
                            </button>
                        </Link>
                    </div>
                    <div className="mt-10 text-sm text-gray-600">
                        or{" "}
                        <Link href="/" className="text-cyan-500 hover:text-cyan-400 underline underline-offset-2 transition">
                            continue browsing
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    // ── LOGGED IN ────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0D1229] text-white">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>

                {error && (
                    <div className="mb-6 p-4 bg-rose-900/30 border border-rose-500/40 rounded-xl text-rose-400 text-sm">
                        {error}
                    </div>
                )}

                {cartItems.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-[#2D3A6B] rounded-2xl bg-[#111827]">
                        <Package size={40} className="text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium mb-2">Your cart is empty.</p>
                        <p className="text-gray-600 text-sm mb-6">Browse products and add them to your cart.</p>
                        <button
                            onClick={() => router.push("/")}
                            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-[#0D1229] rounded-xl text-sm font-bold transition shadow-lg shadow-cyan-500/20"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">

                        {/* Select All bar */}
                        <div className="flex items-center justify-between px-5 py-3.5 bg-[#111827] border border-[#1E3A5F] rounded-xl">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={allChecked}
                                    ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                                    onChange={toggleAll}
                                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                                />
                                <span className="text-sm font-semibold text-gray-300">
                                    Select All ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
                                </span>
                            </label>
                            {selected.size > 0 && (
                                <span className="text-xs text-cyan-400 font-semibold">
                                    {selected.size} selected
                                </span>
                            )}
                        </div>

                        {/* Items */}
                        <div className="border border-[#1E3A5F] rounded-2xl overflow-hidden divide-y divide-[#1E3A5F] shadow-xl">
                            {cartItems.map((entry) => {
                                const product = entry.item_id || entry.itemId;
                                const productId = getProductId(entry);
                                const productName = product?.name || product?.title || "Unknown product";
                                const productImg = product?.picture_url || product?.image;
                                const price = entry.price_snap ?? 0;
                                const subtotal = price * entry.qty;
                                const isSelected = selected.has(productId);

                                return (
                                    <div
                                        key={entry._id}
                                        className={`flex items-center gap-4 px-5 py-4 bg-[#111827] hover:bg-[#141c30] transition ${isSelected ? "" : "opacity-50"}`}
                                    >
                                        {/* Checkbox */}
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(productId)}
                                            className="w-4 h-4 accent-cyan-500 cursor-pointer flex-shrink-0"
                                        />

                                        {/* Image */}
                                        <div className="w-16 h-16 bg-[#1A2244] border border-[#2D3A6B] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            {productImg ? (
                                                <img src={productImg} alt={productName} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package size={20} className="text-gray-600" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">
                                                {productName}
                                            </h3>
                                            <p className="text-gray-400 text-xs mt-0.5">
                                                Rp {price.toLocaleString("id-ID")} / item · qty: {entry.qty}
                                            </p>
                                        </div>

                                        {/* Subtotal */}
                                        <p className="text-cyan-400 font-bold text-sm flex-shrink-0">
                                            Rp {subtotal.toLocaleString("id-ID")}
                                        </p>

                                        {/* Delete */}
                                        <button
                                            onClick={() => handleDelete(productId)}
                                            disabled={actionLoading === productId}
                                            className="p-2 rounded-lg border border-[#2D3A6B] hover:border-rose-400/50 hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 transition disabled:opacity-40 flex-shrink-0"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary & checkout */}
                        <div className="bg-[#111827] border border-[#1E3A5F] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                    Total ({selected.size} item{selected.size !== 1 ? "s" : ""} selected)
                                </p>
                                <p className="text-2xl font-bold text-cyan-400">
                                    Rp {selectedTotal.toLocaleString("id-ID")}
                                </p>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={selected.size === 0}
                                className="w-full sm:w-auto px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-[#0D1229] font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20"
                            >
                                Checkout ({selected.size})
                            </button>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
