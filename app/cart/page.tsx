"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface CartItem {
    _id: string;
    qty : number;
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
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState("");

    const fetchCart = async () => {
        try {
            const res = await fetch("/api/users/cart");

            if (res.status === 401 || res.status === 403) {
                router.push("/login");
                return;
            }

            if (!res.ok) throw new Error();

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

    const handleUpdateqty = async (targetId: string, newqty: number) => {
        if (newqty < 1) return;
        setActionLoading(targetId);
        try {
            const res = await fetch(`/api/users/cart/${targetId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qty: newqty }),
            });

            if (res.status === 401 || res.status === 403) {
                router.push("/login");
                return;
            }

            if (res.ok) {
                setCartItems((prev) =>
                    prev.map((item) => {
                        const id = item.item_id?._id || item.itemId?._id || item._id;
                        return id === targetId ? { ...item, qty: newqty } : item;
                    })
                );
            }
        } catch (err) {
            setError("gagal memperbarui jumlah");
        } finally {
            setActionLoading(null);
        }
    };

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

    const calculateGrandTotal = () => {
        return cartItems.reduce((total, entry) => {
            const product = entry.item_id || entry.itemId;
            const price = product?.price ?? 0;
            return total + price * entry.qty;
        }, 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white text-neutral-800 flex items-center justify-center">
                <p className="text-lg font-medium animate-pulse">memuat keranjang belanja...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-neutral-800">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-8">Keranjang Belanja</h1>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
                        {error}
                    </div>
                )}

                {cartItems.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50">
                        <p className="text-neutral-500 font-medium mb-4">keranjang belanja kamu masih kosong.</p>
                        <button
                            onClick={() => router.push("/")}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
                        >
                            mulai berbelanja
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-neutral-200">
                            {cartItems.map((entry) => {
                                const product = entry.item_id || entry.itemId;
                                const productId = product?._id || entry._id;
                                const productName = product?.name || product?.title || "produk tidak dikenal";
                                const productImg = product?.picture_url || product?.image;
                                const price = entry?.price_snap ?? 0;
                                const itemSubtotal = price * entry.qty;

                                return (
                                    <div key={entry._id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-20 h-20 bg-neutral-50 border border-neutral-200 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {productImg ? (
                                                    <img src={productImg} alt={productName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-neutral-400 text-xs font-medium">no image</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-neutral-900 text-base mb-1">
                                                    {productName}
                                                </h3>
                                                <p className="text-sm text-neutral-500">
                                                    Rp {price.toLocaleString("id-ID")} / produk
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto">
                                            <div className="flex items-center border border-neutral-200 bg-neutral-50 rounded-lg overflow-hidden shadow-sm">
                                                <button
                                                    disabled={actionLoading === productId}
                                                    onClick={() => handleUpdateqty(productId, entry.qty - 1)}
                                                    className="px-3 py-1.5 hover:bg-neutral-200 text-neutral-600 font-bold transition disabled:opacity-50"
                                                >
                                                    -
                                                </button>
                                                <span className="px-3 text-sm font-bold w-10 text-center text-neutral-800">
                                                    {entry.qty}
                                                </span>
                                                <button
                                                    disabled={actionLoading === productId}
                                                    onClick={() => handleUpdateqty(productId, entry.qty + 1)}
                                                    className="px-3 py-1.5 hover:bg-neutral-200 text-neutral-600 font-bold transition disabled:opacity-50"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="text-right min-w-[120px]">
                                                <p className="text-sm font-bold text-neutral-900">
                                                    Rp {itemSubtotal.toLocaleString("id-ID")}
                                                </p>
                                            </div>

                                            <button
                                                disabled={actionLoading === productId}
                                                onClick={() => handleDeleteItem(productId)}
                                                className="text-neutral-400 hover:text-rose-600 transition p-1 disabled:opacity-50"
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

                        <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                            <div>
                                <p className="text-sm font-medium text-neutral-500 mb-1">Total Subtotal Seluruhnya</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    Rp {calculateGrandTotal().toLocaleString("id-ID")}
                                </p>
                            </div>
                            <button
                                onClick={() => alert("fitur checkout segera hadir!")}
                                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-sm"
                            >
                                lanjut ke pembayaran
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}