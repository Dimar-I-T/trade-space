"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Review {
    _id: string;
    user_id?: { username: string } | string;
    userId?: { username: string } | string;
    rating: number;
    comment: string;
    createdAt?: string;
}

interface Item {
    _id: string;
    name: string;
    description: string;
    price: number;
    picture_url?: string;
    stock: number;
    category?: string;
    specs?: string[] | string | Record<string, any>;
    reviews?: Review[];
    rating?: number;
    sold?: number;
    soldCount?: number;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [item, setItem] = useState<Item | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const itemRes = await fetch(`/api/items/${id}`);
                if (!itemRes.ok) throw new Error();
                const itemData = await itemRes.json();
                const fetchedItem = itemData.data || itemData.item || itemData;
                setItem(fetchedItem);

                if (fetchedItem.reviews && Array.isArray(fetchedItem.reviews)) {
                    setReviews(fetchedItem.reviews);
                } else {
                    const reviewRes = await fetch(`/api/reviews?item_id=${id}`);
                    if (reviewRes.ok) {
                        const reviewData = await reviewRes.json();
                        const extractedReviews = reviewData.data || reviewData.reviews || (Array.isArray(reviewData) ? reviewData : []);
                        setReviews(extractedReviews);
                    }
                }
            } catch (err) {
                setMessage("produk tidak ditemukan");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    // fungsi add to cart
    const handleAddToCart = async () => {
        setActionLoading(true);
        setMessage("");
        try {
            const res = await fetch("/api/users/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId: id, item_id: id, quantity }),
            });

            if (res.ok) {
                setMessage("berhasil ditambahkan ke keranjang!");
                router.push("/cart");
            } else if (res.status === 401 || res.status === 403) {
                router.push("/login");
            } else {
                const data = await res.json();
                setMessage(data.message || "gagal menambahkan ke keranjang");
            }
        } catch (err) {
            setMessage("terjadi kesalahan sistem");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white text-neutral-800 flex items-center justify-center">
                <p className="text-lg font-medium animate-pulse">memuat produk...</p>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-white text-neutral-800 flex flex-col items-center justify-center gap-4">
                <p className="text-xl text-neutral-500 font-medium">{message || "produk tidak ditemukan"}</p>
                <button onClick={() => router.push("/")} className="px-5 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm">
                    kembali ke beranda
                </button>
            </div>
        );
    }

    const displayRating = item.rating || (reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0);
    const displaySold = item.sold ?? item.soldCount ?? 0;

    return (
        <div className="min-h-screen bg-white text-neutral-800">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-16">
                    <div className="w-full aspect-square bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 flex items-center justify-center relative shadow-sm">
                        {item.picture_url ? (
                            <img src={item.picture_url} alt={item.name} className="object-cover w-full h-full" />
                        ) : (
                            <span className="text-neutral-400 text-sm font-medium">tidak ada gambar</span>
                        )}
                    </div>

                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="inline-block px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-xs text-neutral-600 font-semibold uppercase tracking-wider">
                                    {item.category || "umum"}
                                </span>

                                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-amber-600 text-xs font-bold">
                                    <span>★</span>
                                    <span>{displayRating > 0 ? displayRating.toFixed(1) : "0.0"}</span>
                                    <span className="text-neutral-400 font-normal">({reviews.length} ulasan)</span>
                                </div>

                                <div className="text-xs bg-neutral-100 border border-neutral-200 text-neutral-600 px-2.5 py-1 rounded-full font-medium">
                                    terjual <span className="font-bold text-neutral-900">{displaySold}</span> produk
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">{item.name}</h1>

                            <p className="text-2xl font-bold text-blue-600 mb-6">
                                Rp {(item.price ?? 0).toLocaleString("id-ID")}
                            </p>

                            <div className="border-t border-neutral-200 pt-6 mb-6">
                                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">deskripsi</h3>
                                <p className="text-neutral-700 leading-relaxed text-sm whitespace-pre-line">{item.description}</p>
                            </div>

                            <div className="border-t border-neutral-200 pt-6 mb-6">
                                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">spesifikasi</h3>
                                {item.specs ? (
                                    <div className="text-sm text-neutral-700 space-y-1">
                                        {Array.isArray(item.specs) ? (
                                            <ul className="list-disc list-inside">
                                                {item.specs.map((spec, i) => <li key={i}>{spec}</li>)}
                                            </ul>
                                        ) : typeof item.specs === 'object' ? (
                                            <ul className="list-disc list-inside">
                                                {Object.entries(item.specs).map(([key, value]) => (
                                                    <li key={key}><span className="font-semibold capitalize">{key}</span>: {String(value)}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="whitespace-pre-line">{String(item.specs)}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-neutral-400 italic">spesifikasi produk tidak tersedia</p>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-neutral-200 pt-6 mt-auto">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-neutral-500">stok tersedia: <span className="text-neutral-900 font-bold">{item.stock}</span></span>

                                {item.stock > 0 && (
                                    <div className="flex items-center border border-neutral-200 bg-neutral-50 rounded-lg overflow-hidden shadow-sm">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="px-3 py-1.5 hover:bg-neutral-200 text-neutral-600 font-semibold transition"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 text-sm font-bold w-12 text-center text-neutral-800">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => Math.min(item.stock, q + 1))}
                                            className="px-3 py-1.5 hover:bg-neutral-200 text-neutral-600 font-semibold transition"
                                        >
                                            +
                                        </button>
                                    </div>
                                )}
                            </div>

                            {item.stock > 0 ? (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={actionLoading}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-200 disabled:text-neutral-400 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 text-white shadow-sm"
                                >
                                    {actionLoading ? "memproses..." : "beli sekarang"}
                                </button>
                            ) : (
                                <div className="w-full py-3.5 bg-neutral-100 text-neutral-400 border border-neutral-200 rounded-xl text-center font-bold text-sm">
                                    stok habis
                                </div>
                            )}

                            {message && (
                                <p className={`mt-4 text-center text-xs font-bold ${message.includes("berhasil") ? "text-emerald-600" : "text-rose-600"}`}>
                                    {message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-neutral-200 pt-12">
                    <h2 className="text-xl font-bold text-neutral-900 mb-6">ulasan & komentar pembeli</h2>
                    {reviews.length === 0 ? (
                        <p className="text-sm text-neutral-400 italic">belum ada ulasan untuk produk ini.</p>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => {
                                const reviewerObj = review.user_id || review.userId;
                                const reviewerName = typeof reviewerObj === "object" ? reviewerObj.username : "pengguna";

                                return (
                                    <div key={review._id} className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-sm text-neutral-900">
                                                {reviewerName}
                                            </span>
                                            <div className="flex items-center gap-1 text-amber-500 text-xs">
                                                {"★".repeat(review.rating)}
                                                {"☆".repeat(5 - review.rating)}
                                            </div>
                                        </div>
                                        <p className="text-neutral-700 text-sm leading-relaxed">{review.comment}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}