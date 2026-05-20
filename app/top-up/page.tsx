"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Wallet, CheckCircle, Loader2 } from "lucide-react";

const PRESETS = [
    { label: "Rp 50.000", value: 50000 },
    { label: "Rp 100.000", value: 100000 },
    { label: "Rp 200.000", value: 200000 },
    { label: "Rp 500.000", value: 500000 },
    { label: "Rp 1.000.000", value: 1000000 },
    { label: "Rp 2.000.000", value: 2000000 },
];

export default function TopUpPage() {
    const router = useRouter();
    const [balance, setBalance] = useState<number>(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [customRaw, setCustomRaw] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [newBalance, setNewBalance] = useState<number>(0);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => {
                if (!res.ok) { router.push("/login"); return null; }
                return res.json();
            })
            .then((data) => {
                if (data) setBalance(data.data?.balance ?? 0);
            })
            .catch(() => router.push("/login"))
            .finally(() => setLoading(false));
    }, []);

    const effectiveAmount = selected ?? (customRaw ? Number(customRaw) : 0);

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "");
        setCustomRaw(raw);
        setSelected(null);
    };

    const handlePreset = (value: number) => {
        setSelected(value);
        setCustomRaw("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!effectiveAmount || effectiveAmount < 1000) {
            setError("Minimum top-up amount is Rp 1.000.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/users/add-balance", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: effectiveAmount }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Top-up failed. Please try again.");
                return;
            }

            const updated = data.data?.balance ?? balance + effectiveAmount;
            setNewBalance(updated);
            setBalance(updated);   // keep balance fresh for "Top Up Again"
            setSuccess(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D1229] flex items-center justify-center">
                <p className="text-cyan-400 text-lg font-medium animate-pulse">Loading...</p>
            </div>
        );
    }

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
                    <h1 className="text-2xl font-bold text-white mb-2">Top-Up Successful!</h1>
                    <p className="text-gray-400 text-sm mb-6">
                        <span className="text-cyan-400 font-bold">Rp {effectiveAmount.toLocaleString("id-ID")}</span> has been added to your balance.
                    </p>

                    <div className="bg-[#111827] border border-[#1E3A5F] rounded-2xl p-6 mb-8">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">New Balance</p>
                        <p className="text-3xl font-bold text-cyan-400">Rp {newBalance.toLocaleString("id-ID")}</p>
                    </div>

                    <div className="flex gap-3 justify-center">
                        <Link href="/dashboard">
                            <button className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-[#0D1229] font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20">
                                Back to Dashboard
                            </button>
                        </Link>
                        <button
                            onClick={() => { setSuccess(false); setSelected(null); setCustomRaw(""); }}
                            className="px-6 py-2.5 border border-[#2D3A6B] hover:border-cyan-500/50 text-gray-400 hover:text-cyan-400 font-bold text-sm rounded-xl transition"
                        >
                            Top Up Again
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0D1229] text-white">
            <Navbar />

            <main className="max-w-lg mx-auto px-4 py-10">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/dashboard">
                        <button className="p-2 rounded-xl border border-[#2D3A6B] hover:border-cyan-500/50 hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition">
                            <ArrowLeft size={18} />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Top Up Balance</h1>
                        <p className="text-gray-400 text-sm mt-0.5">Add funds to your TradeSpace wallet</p>
                    </div>
                </div>

                {/* Current balance */}
                <div className="bg-[#111827] border border-[#1E3A5F] rounded-2xl p-5 mb-8 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                        <Wallet size={22} className="text-cyan-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Current Balance</p>
                        <p className="text-xl font-bold text-cyan-400">Rp {balance.toLocaleString("id-ID")}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Preset amounts */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Select Amount
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {PRESETS.map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => handlePreset(p.value)}
                                    className={`py-3 px-2 rounded-xl text-sm font-bold border transition text-center ${
                                        selected === p.value
                                            ? "bg-cyan-500 border-cyan-500 text-[#0D1229]"
                                            : "bg-[#111827] border-[#2D3A6B] text-gray-300 hover:border-cyan-500/50 hover:text-cyan-300"
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom amount */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Or Enter Custom Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">
                                Rp
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={customRaw ? Number(customRaw).toLocaleString("id-ID") : ""}
                                onChange={handleCustomChange}
                                placeholder="0"
                                className="w-full bg-[#111827] border border-[#1E3A5F] focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 outline-none text-sm transition"
                            />
                        </div>
                        {customRaw && (
                            <p className="text-gray-500 text-xs mt-1.5 pl-1">
                                = Rp {Number(customRaw).toLocaleString("id-ID")}
                            </p>
                        )}
                    </div>

                    {/* Summary */}
                    {effectiveAmount > 0 && (
                        <div className="bg-[#111827] border border-cyan-500/20 rounded-xl p-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Top-up amount</span>
                                <span className="text-white font-semibold">Rp {effectiveAmount.toLocaleString("id-ID")}</span>
                            </div>
                            <div className="flex justify-between text-sm border-t border-[#1E3A5F] pt-2 mt-2">
                                <span className="text-gray-400">Balance after top-up</span>
                                <span className="text-cyan-400 font-bold">Rp {(balance + effectiveAmount).toLocaleString("id-ID")}</span>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-rose-900/30 border border-rose-500/40 rounded-xl text-rose-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting || effectiveAmount < 1}
                        className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:text-gray-500 text-[#0D1229] font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            `Confirm Top-Up${effectiveAmount > 0 ? ` — Rp ${effectiveAmount.toLocaleString("id-ID")}` : ""}`
                        )}
                    </button>

                </form>
            </main>
        </div>
    );
}
