"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

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
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchCart = async () => {
        try {
            const res = await fetch("/api/users/cart");

            if (res.status === 401 || res.status === 403) {
                setIsGuest(true);
                setLoading(false);
                return;
            }

            if (!res.ok) {
                // Backend melempar 500 saat belum login (getAuth throw)
                // Cek pesan error untuk membedakan "belum login" vs error sungguhan
                const errData = await res.json().catch(() => ({}));
                const msg: string = errData?.message ?? "";
                if (msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("must login")) {
                    setIsGuest(true);
                    setLoading(false);
                    return;
                }
                throw new Error(msg || "server error");
            }

            const data = await res.json();

            let extractedItems: CartItem[] = [];
            if (Array.isArray(data)) extractedItems = data;
            else if (Array.isArray(data.data)) extractedItems = data.data;
            else if (Array.isArray(data.cart)) extractedItems = data.cart;
            else if (data.data && Array.isArray(data.data.cart)) extractedItems = data.data.cart;
            else if (data.user && Array.isArray(data.user.cart)) extractedItems = data.user.cart;

            setCartItems(extractedItems);
        } catch (err) {
            setError("gagal memuat data keranjang");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleDeleteItem = async (targetId: string) => {
        if (!confirm("apakah kamu yakin ingin menghapus item ini?")) return;
        setActionLoading(targetId);
        try {
            const res = await fetch(`/api/users/cart/${targetId}`, {
                method: "DELETE",
            });

            if (res.status === 401 || res.status === 403) {
                router.push("/login");
                return;
            }

            if (res.ok) {
                setCartItems((prev) =>
                    prev.filter((item) => {
                        const id = item.item_id?._id || item.itemId?._id || item._id;
                        return id !== targetId;
                    })
                );
            }
        } catch (err) {
            setError("gagal menghapus item");
        } finally {
            setActionLoading(null);
        }
    };

    const handleCheckout = () => {
        if (isGuest) {
            router.push("/login");
            return;
        }
        // TODO: implementasi checkout
        alert("fitur checkout segera hadir!");
    };

    const calculateGrandTotal = () => {
        return cartItems.reduce((total, entry) => {
            const price = entry.price_snap ?? 0;
            return total + price * entry.qty;
        }, 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D1229] flex items-center justify-center">
                <p className="text-cyan-400 text-lg font-medium animate-pulse">memuat keranjang belanja...</p>
            </div>
        );
    }

    // ── GUEST STATE ──────────────────────────────────────────────
    if (isGuest) {
        return (
            <div className="min-h-screen bg-[#0D1229] text-white">
                <Navbar />
                <main className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-[#1A2244] border border-cyan-500/30 flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-9 h-9 text-cyan-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-3">Keranjang Belanja</h1>
                    <p className="text-gray-400 mb-2">Kamu belum login.</p>
                    <p className="text-gray-500 text-sm mb-8">
                        Login untuk melihat dan mengelola keranjang belanja kamu.
                    </p>

                    <div className="flex gap-3">
                        <Link href="/login">
                            <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-[#0D1229] font-bold rounded-xl transition shadow-lg shadow-cyan-500/20">
                                Login
                            </button>
                        </Link>
                        <Link href="/register">
                            <button className="px-6 py-3 border border-cyan-500/50 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300 font-bold rounded-xl transition">
                                Daftar
                            </button>
                        </Link>
                    </div>

                    <div className="mt-10 text-sm text-gray-600">
                        atau{" "}
                        <Link href="/" className="text-cyan-500 hover:text-cyan-400 underline underline-offset-2 transition">
                            lanjut browsing produk
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
                <h1 className="text-3xl font-bold tracking-tight text-white mb-8">
                    Keranjang Belanja
                </h1>

                {error && (
                    <div className="mb-6 p-4 bg-rose-900/30 border border-rose-500/40 rounded-xl text-rose-400 text-sm font-medium">
                        {error}
                    </div>
                )}

                {cartItems.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-[#2D3A6B] rounded-2xl bg-[#111827]">
                        <p className="text-gray-400 font-medium mb-4">keranjang belanja kamu masih kosong.</p>
                        <button
                            onClick={() => router.push("/")}
                            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-[#0D1229] rounded-xl text-sm font-bold transition shadow-lg shadow-cyan-500/20"
                        >
                            mulai berbelanja
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Cart items */}
                        <div className="border border-[#1E3A5F] rounded-2xl overflow-hidden shadow-xl divide-y divide-[#1E3A5F]">
                            {cartItems.map((entry) => {
                                const product = entry.item_id || entry.itemId;
                                const productId = product?._id || entry._id;
                                const productName = product?.name || product?.title || "produk tidak dikenal";
                                const productImg = product?.picture_url || product?.image;
                                const price = entry.price_snap ?? 0;
                                const itemSubtotal = price * entry.qty;

                                return (
                                    <div key={entry._id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-[#111827] hover:bg-[#151f35] transition">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-20 h-20 bg-[#1A2244] border border-[#2D3A6B] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {productImg ? (
                                                    <img src={productImg} alt={productName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-gray-600 text-xs font-medium">no image</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-base mb-1">
                                                    {productName}
                                                </h3>
                                                <p className="text-sm text-gray-400">
                                                    Rp {price.toLocaleString("id-ID")} / produk
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto">
                                            <div className="flex items-center border border-[#2D3A6B] bg-[#1A2244] rounded-lg overflow-hidden">
                                                <span className="px-4 text-sm font-bold w-12 text-center text-cyan-300">
                                                    {entry.qty}
                                                </span>
                                            </div>

                                            <div className="text-right min-w-[120px]">
                                                <p className="text-sm font-bold text-cyan-400">
                                                    Rp {itemSubtotal.toLocaleString("id-ID")}
                                                </p>
                                            </div>

                                            <button
                                                disabled={actionLoading === productId}
                                                onClick={() => handleDeleteItem(productId)}
                                                className="text-gray-600 hover:text-rose-400 transition p-1 disabled:opacity-50"
                                                title="hapus item"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary & checkout */}
                        <div className="p-6 bg-[#111827] border border-[#1E3A5F] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                            <div>
                                <p className="text-sm font-medium text-gray-400 mb-1">Total Subtotal</p>
                                <p className="text-2xl font-bold text-cyan-400">
                                    Rp {calculateGrandTotal().toLocaleString("id-ID")}
                                </p>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={checkoutLoading}
                                className="w-full sm:w-auto px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:text-gray-500 text-[#0D1229] font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20"
                            >
                                {checkoutLoading ? "memproses..." : "lanjut ke pembayaran"}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
