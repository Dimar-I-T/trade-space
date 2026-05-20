"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Package, CheckCircle, Loader2, Wallet } from "lucide-react";

interface CheckoutItem {
    item_id: string;
    name: string;
    picture_url: string | null;
    price_snap: number;
    qty: number;
}

export default function CheckoutPage() {
    const router = useRouter();
    const [items, setItems] = useState<CheckoutItem[]>([]);
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [failedItems, setFailedItems] = useState<string[]>([]);

    useEffect(() => {
        async function init() {
            try {
                // Auth check
                const meRes = await fetch("/api/auth/me");
                if (!meRes.ok) { router.push("/login"); return; }
                const meData = await meRes.json();
                setBalance(meData.data?.balance ?? 0);

                // Read items from sessionStorage
                const raw = sessionStorage.getItem("checkout_items");
                if (!raw) { router.push("/cart"); return; }
                const parsed: CheckoutItem[] = JSON.parse(raw);
                if (!parsed.length) { router.push("/cart"); return; }
                setItems(parsed);
            } catch {
                router.push("/cart");
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    const grandTotal = items.reduce((sum, i) => sum + i.price_snap * i.qty, 0);
    const canAfford = balance >= grandTotal;

    const handlePlaceOrder = async () => {
        setError("");
        setSubmitting(true);
        const failed: string[] = [];

        for (const item of items) {
            try {
                const res = await fetch("/api/transactions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ item_id: item.item_id }),
                });
                if (!res.ok) {
                    const d = await res.json().catch(() => ({}));
                    failed.push(`${item.name}: ${d.message || "failed"}`);
                }
            } catch {
                failed.push(`${item.name}: network error`);
            }
        }

        setSubmitting(false);

        if (failed.length === 0) {
            sessionStorage.removeItem("checkout_items");
            setSuccess(true);
        } else if (failed.length < items.length) {
            // Partial success
            setFailedItems(failed);
            sessionStorage.removeItem("checkout_items");
            setSuccess(true);
        } else {
            setFailedItems(failed);
            setError("All transactions failed. Please check your balance or try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D1229] flex items-center justify-center">
                <p className="text-cyan-400 text-lg font-medium animate-pulse">Loading checkout...</p>
            </div>
        );
    }

    // ── SUCCESS ──────────────────────────────────────────────────
    if (success) {
        return (
            <div className="min-h-screen bg-[#0D1229] text-white">
                <Navbar />
                <main className="max-w-md mx-auto px-4 py-20 text-center">
                    <div className="flex items-center justify-center mb-6">
                        <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                            <CheckCircle size={40} className="text-emerald-400" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Order Placed!</h1>
                    <p className="text-gray-400 text-sm mb-2">
                        Your purchase was successful.
                    </p>

                    {failedItems.length > 0 && (
                        <div className="my-4 p-4 bg-amber-900/30 border border-amber-500/40 rounded-xl text-amber-400 text-xs text-left space-y-1">
                            <p className="font-bold mb-1">Some items could not be processed:</p>
                            {failedItems.map((f, i) => <p key={i}>• {f}</p>)}
                        </div>
                    )}

                    <div className="flex gap-3 justify-center mt-8">
                        <Link href="/transactions">
                            <button className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-[#0D1229] font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20">
                                View Transactions
                            </button>
                        </Link>
                        <Link href="/">
                            <button className="px-6 py-2.5 border border-[#2D3A6B] hover:border-cyan-500/50 text-gray-400 hover:text-cyan-400 font-bold text-sm rounded-xl transition">
                                Continue Shopping
                            </button>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    // ── CHECKOUT FORM ────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0D1229] text-white">
            <Navbar />

            <main className="max-w-2xl mx-auto px-4 py-10">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/cart">
                        <button className="p-2 rounded-xl border border-[#2D3A6B] hover:border-cyan-500/50 hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition">
                            <ArrowLeft size={18} />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Checkout</h1>
                        <p className="text-gray-400 text-sm mt-0.5">Review your order before placing it</p>
                    </div>
                </div>

                {/* Order items */}
                <div className="bg-[#111827] border border-[#1E3A5F] rounded-2xl overflow-hidden mb-5 shadow-xl">
                    <div className="px-5 py-4 border-b border-[#1E3A5F]">
                        <h2 className="text-sm font-bold text-white">
                            Order Summary <span className="text-gray-500 font-normal">({items.length} item{items.length !== 1 ? "s" : ""})</span>
                        </h2>
                    </div>
                    <div className="divide-y divide-[#1E3A5F]">
                        {items.map((item) => (
                            <div key={item.item_id} className="flex items-center gap-4 px-5 py-4">
                                <div className="w-14 h-14 bg-[#1A2244] border border-[#2D3A6B] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    {item.picture_url ? (
                                        <img src={item.picture_url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package size={18} className="text-gray-600" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold text-sm leading-snug line-clamp-2">{item.name}</p>
                                    <p className="text-gray-400 text-xs mt-0.5">
                                        Rp {item.price_snap.toLocaleString("id-ID")} × {item.qty}
                                    </p>
                                </div>
                                <p className="text-cyan-400 font-bold text-sm flex-shrink-0">
                                    Rp {(item.price_snap * item.qty).toLocaleString("id-ID")}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment summary */}
                <div className="bg-[#111827] border border-[#1E3A5F] rounded-2xl p-5 mb-5 shadow-xl space-y-3">
                    <h2 className="text-sm font-bold text-white mb-4">Payment Details</h2>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-white font-semibold">Rp {grandTotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Platform fee</span>
                        <span className="text-emerald-400 font-semibold">Free</span>
                    </div>
                    <div className="border-t border-[#1E3A5F] pt-3 flex justify-between">
                        <span className="text-white font-bold">Total</span>
                        <span className="text-cyan-400 font-bold text-lg">Rp {grandTotal.toLocaleString("id-ID")}</span>
                    </div>
                </div>

                {/* Balance */}
                <div className={`flex items-center justify-between px-5 py-4 rounded-2xl border mb-6 ${
                    canAfford
                        ? "bg-[#111827] border-[#1E3A5F]"
                        : "bg-rose-900/20 border-rose-500/40"
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${canAfford ? "bg-cyan-500/10 border-cyan-500/20" : "bg-rose-500/10 border-rose-500/20"}`}>
                            <Wallet size={16} className={canAfford ? "text-cyan-400" : "text-rose-400"} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Your Balance</p>
                            <p className={`font-bold text-base ${canAfford ? "text-cyan-400" : "text-rose-400"}`}>
                                Rp {balance.toLocaleString("id-ID")}
                            </p>
                        </div>
                    </div>
                    {!canAfford && (
                        <Link href="/top-up">
                            <button className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 hover:text-rose-200 text-xs font-bold rounded-lg transition">
                                Top Up
                            </button>
                        </Link>
                    )}
                    {canAfford && (
                        <p className="text-xs text-gray-500">
                            After: <span className="text-white font-semibold">Rp {(balance - grandTotal).toLocaleString("id-ID")}</span>
                        </p>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 p-4 bg-rose-900/30 border border-rose-500/40 rounded-xl text-rose-400 text-sm space-y-1">
                        <p className="font-bold">Order failed</p>
                        {failedItems.map((f, i) => <p key={i} className="text-xs">• {f}</p>)}
                    </div>
                )}

                {/* Place order */}
                <button
                    onClick={handlePlaceOrder}
                    disabled={submitting || !canAfford}
                    className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-[#0D1229] font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Placing Order...
                        </>
                    ) : !canAfford ? (
                        "Insufficient Balance"
                    ) : (
                        `Place Order — Rp ${grandTotal.toLocaleString("id-ID")}`
                    )}
                </button>

                {!canAfford && (
                    <p className="text-center text-xs text-gray-500 mt-3">
                        You need{" "}
                        <span className="text-rose-400 font-semibold">
                            Rp {(grandTotal - balance).toLocaleString("id-ID")}
                        </span>{" "}
                        more to complete this order.
                    </p>
                )}

            </main>
        </div>
    );
}
