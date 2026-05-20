"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Review {
    _id: string;
    from_user?: { _id?: string; username?: string; name?: string } | string;
    user_id?: { _id?: string; username?: string; name?: string } | string;
    userId?: { _id?: string; username?: string; name?: string } | string;
    user?: { _id?: string; username?: string; name?: string } | string;
    rating: number;
    comment: string;
    createdAt?: string;
    date?: string;
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

// Komponen Card review
const ReviewCard = ({ review, currentUser }: { review: Review; currentUser: any }) => {
    const [reviewerName, setReviewerName] = useState<string>("memuat...");

    useEffect(() => {
        const reviewerId = review.from_user || review.user_id || review.userId || review.user;

        if (!reviewerId) {
            setReviewerName("pengguna anonim");
            return;
        }

        if (typeof reviewerId === "object") {
            setReviewerName(reviewerId.username || reviewerId.name || "pengguna");
            return;
        }

        if (currentUser && currentUser._id === reviewerId) {
            setReviewerName(currentUser.username || "Kamu");
            return;
        }

        fetch(`/api/users/${reviewerId}`)
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setReviewerName(data.data.username || data.data.name || "pengguna");
                } else {
                    setReviewerName("pengguna anonim");
                }
            })
            .catch(() => setReviewerName("pengguna anonim"));

    }, [review, currentUser]);

    const rawDate = review.createdAt || review.date;
    const formattedDate = rawDate
        ? new Date(rawDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
        : "";

    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-neutral-900 capitalize">
                        {reviewerName}
                    </span>
                    {formattedDate && (
                        <span className="text-xs text-neutral-400 font-medium">• {formattedDate}</span>
                    )}
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                    {"★".repeat(review.rating)}
                    <span className="text-neutral-300">{"★".repeat(5 - review.rating)}</span>
                </div>
            </div>
            <p className="text-neutral-700 text-sm leading-relaxed">{review.comment}</p>
        </div>
    );
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [item, setItem] = useState<Item | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [currentUser, setCurrentUser] = useState<{ _id?: string; username?: string; name?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");
    const [submitReviewLoading, setSubmitReviewLoading] = useState(false);
    const [reviewMessage, setReviewMessage] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const userRes = await fetch("/api/auth/me");
                let userDataForState = null;
                if (userRes.ok) {
                    const userData = await userRes.json();
                    userDataForState = userData.user || userData.data;
                    setCurrentUser(userDataForState);
                }

                const itemRes = await fetch(`/api/items/${id}`);
                if (!itemRes.ok) throw new Error();
                const itemData = await itemRes.json();
                const fetchedItem = itemData.data || itemData.item || itemData;
                setItem(fetchedItem);

                let extractedReviews: Review[] = [];
                if (fetchedItem.reviews && Array.isArray(fetchedItem.reviews)) {
                    extractedReviews = fetchedItem.reviews;
                } else {
                    const reviewRes = await fetch(`/api/reviews?item_id=${id}`);
                    if (reviewRes.ok) {
                        const reviewData = await reviewRes.json();
                        extractedReviews = reviewData.data || reviewData.reviews || (Array.isArray(reviewData) ? reviewData : []);
                    }
                }

                setReviews(extractedReviews.reverse());
            } catch (err) {
                setMessage("produk tidak ditemukan");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handleAddToCart = async () => {
        setActionLoading(true);
        setMessage("");
        try {
            const res = await fetch("/api/users/cart", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_id: id, qty: quantity, price_snap: item?.price }),
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

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) {
            setReviewMessage("komentar tidak boleh kosong");
            return;
        }

        setSubmitReviewLoading(true);
        setReviewMessage("");

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_id: id, itemId: id, rating: newRating, comment: newComment }),
            });

            if (res.status === 401 || res.status === 403) {
                router.push("/login");
                return;
            }

            if (res.ok) {
                const data = await res.json();
                const rawBackendReview = data.data || data.review;

                const addedReview: Review = {
                    _id: rawBackendReview?._id || Date.now().toString(),
                    rating: newRating,
                    comment: newComment,
                    from_user: currentUser?._id,
                    createdAt: new Date().toISOString(),
                };

                setReviews((prev) => [addedReview, ...prev]);
                setNewComment("");
                setNewRating(5);
                setReviewMessage("Review berhasil ditambahkan!");
                setTimeout(() => setReviewMessage(""), 3000);
            } else {
                const errData = await res.json();
                setReviewMessage(errData.message || "gagal menambahkan review");
            }
        } catch (err) {
            setReviewMessage("terjadi kesalahan sistem");
        } finally {
            setSubmitReviewLoading(false);
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
                    <h2 className="text-xl font-bold text-neutral-900 mb-8">Review & komentar pembeli</h2>

                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 shadow-sm mb-8">
                        <h3 className="font-bold text-neutral-900 text-sm mb-4">
                            tulis review sebagai <span className="text-blue-600 capitalize">{currentUser?.username || "pengguna"}</span>
                        </h3>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">rating</label>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewRating(star)}
                                            className={`text-2xl focus:outline-none transition-colors ${star <= newRating ? "text-amber-500" : "text-neutral-300"}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">komentar</label>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-sm bg-white"
                                    placeholder="bagaimana pendapatmu tentang produk ini?"
                                ></textarea>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className={`text-xs font-bold ${reviewMessage.includes('berhasil') ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {reviewMessage}
                                </span>
                                <button
                                    type="submit"
                                    disabled={submitReviewLoading}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 text-white font-bold text-sm rounded-lg transition shadow-sm"
                                >
                                    {submitReviewLoading ? "mengirim..." : "kirim review"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {reviews.length === 0 ? (
                        <p className="text-sm text-neutral-400 italic">belum ada review untuk produk ini. jadilah yang pertama!</p>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <ReviewCard key={review._id} review={review} currentUser={currentUser} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}