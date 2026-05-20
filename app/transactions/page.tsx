"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowLeft, ShoppingBag, TrendingUp, Package, Clock } from "lucide-react";

interface Transaction {
    _id: string;
    buyer_id: string;
    seller_id: string;
    item_snapshot: { name: string; price_paid: number };
    total_amount: number;
    status: string;
    createdAt?: string;
}

interface User {
    _id: string;
    username: string;
    balance: number;
}

type TabType = "all" | "purchases" | "sales";

const STATUS_STYLES: Record<string, string> = {
    completed: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    pending: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    cancelled: "bg-rose-500/10 border-rose-500/30 text-rose-400",
};

export default function TransactionsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<TabType>("all");

    useEffect(() => {
        async function fetchData() {
            try {
                const meRes = await fetch("/api/auth/me");
                if (!meRes.ok) { router.push("/login"); return; }
                const meData = await meRes.json();
                const me: User = meData.data;
                setUser(me);

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
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D1229] flex items-center justify-center">
                <p className="text-cyan-400 text-lg font-medium animate-pulse">Loading transactions...</p>
            </div>
        );
    }

    if (!user) return null;

    const purchases = transactions.filter((tx) => tx.buyer_id === user._id);
    const sales = transactions.filter((tx) => tx.seller_id === user._id);

    const displayed =
        tab === "purchases" ? purchases :
        tab === "sales" ? sales :
        transactions;

    const totalSpent = purchases.reduce((sum, tx) => sum + tx.total_amount, 0);
    const totalEarned = sales.reduce((sum, tx) => sum + tx.total_amount, 0);

    const tabs: { key: TabType; label: string; count: number }[] = [
        { key: "all", label: "All", count: transactions.length },
        { key: "purchases", label: "Purchases", count: purchases.length },
        { key: "sales", label: "Sales", count: sales.length },
    ];

    return (
        <div className="min-h-screen bg-[#0D1229] text-white">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-10">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/dashboard">
                        <button className="p-2 rounded-xl border border-[#2D3A6B] hover:border-cyan-500/50 hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition">
                            <ArrowLeft size={18} />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Transaction History</h1>
                        <p className="text-gray-400 text-sm mt-0.5">All your purchases and sales</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#111827] border border-[#1E3A5F] rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                <Clock size={16} className="text-cyan-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Total Transactions</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{transactions.length}</p>
                    </div>

                    <div className="bg-[#111827] border border-[#1E3A5F] rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                <ShoppingBag size={16} className="text-rose-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Total Spent</span>
                        </div>
                        <p className="text-2xl font-bold text-white">Rp {totalSpent.toLocaleString("id-ID")}</p>
                        <p className="text-xs text-gray-500 mt-1">{purchases.length} purchase{purchases.length !== 1 ? "s" : ""}</p>
                    </div>

                    <div className="bg-[#111827] border border-[#1E3A5F] rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <TrendingUp size={16} className="text-emerald-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Total Earned</span>
                        </div>
                        <p className="text-2xl font-bold text-white">Rp {totalEarned.toLocaleString("id-ID")}</p>
                        <p className="text-xs text-gray-500 mt-1">{sales.length} sale{sales.length !== 1 ? "s" : ""}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                                tab === t.key
                                    ? "bg-cyan-500 border-cyan-500 text-[#0D1229]"
                                    : "bg-[#111827] border-[#2D3A6B] text-gray-400 hover:border-cyan-500/50 hover:text-gray-200"
                            }`}
                        >
                            {t.label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                                tab === t.key ? "bg-[#0D1229]/30 text-[#0D1229]" : "bg-[#1A2244] text-gray-500"
                            }`}>
                                {t.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Transaction list */}
                {displayed.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-[#2D3A6B] rounded-2xl bg-[#111827]">
                        <Package size={40} className="text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium mb-1">No transactions yet</p>
                        <p className="text-gray-600 text-sm">
                            {tab === "purchases" ? "You haven't bought anything yet." :
                             tab === "sales" ? "You haven't sold anything yet." :
                             "Your transaction history will appear here."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayed.map((tx) => {
                            const isBuyer = tx.buyer_id === user._id;
                            const roleLabel = isBuyer ? "Purchase" : "Sale";
                            const roleColor = isBuyer
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
                            const amountColor = isBuyer ? "text-rose-400" : "text-emerald-400";
                            const amountPrefix = isBuyer ? "−" : "+";

                            const statusStyle = STATUS_STYLES[tx.status?.toLowerCase()] ?? "bg-gray-500/10 border-gray-500/30 text-gray-400";

                            const date = tx.createdAt
                                ? new Date(tx.createdAt).toLocaleDateString("en-US", {
                                    day: "numeric", month: "short", year: "numeric",
                                  })
                                : "—";

                            const time = tx.createdAt
                                ? new Date(tx.createdAt).toLocaleTimeString("en-US", {
                                    hour: "2-digit", minute: "2-digit",
                                  })
                                : "";

                            return (
                                <div
                                    key={tx._id}
                                    className="bg-[#111827] border border-[#1E3A5F] rounded-2xl p-5 hover:border-cyan-500/20 transition"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${roleColor}`}>
                                                    {roleLabel}
                                                </span>
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${statusStyle}`}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                            <p className="text-white font-semibold text-sm leading-snug truncate">
                                                {tx.item_snapshot?.name || "Unknown Product"}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-1">
                                                {date}{time && <span className="ml-1 text-gray-600">· {time}</span>}
                                            </p>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <p className={`text-base font-bold ${amountColor}`}>
                                                {amountPrefix} Rp {tx.total_amount.toLocaleString("id-ID")}
                                            </p>
                                            {tx.item_snapshot?.price_paid && tx.item_snapshot.price_paid !== tx.total_amount && (
                                                <p className="text-gray-500 text-xs mt-0.5">
                                                    Rp {tx.item_snapshot.price_paid.toLocaleString("id-ID")} / unit
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </main>
        </div>
    );
}
