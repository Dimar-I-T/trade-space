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

// Review card component
const ReviewCard = ({ review, currentUser }: { review: Review; currentUser: any }) => {
    const [reviewerName, setReviewerName] = useState<string>("Loading...");

    useEffect(() => {
        const reviewerId = review.from_user || review.user_id || review.userId || review.user;

        if (!reviewerId) {
            setReviewerName("Anonymous");
            return;
        }

        if (typeof reviewerId === "object") {
            setReviewerName(reviewerId.username || reviewerId.name || "user");
            return;
        }

        if (currentUser && currentUser._id === reviewerId) {
            setReviewerName(currentUser.username || "You");
            return;
        }

        fetch(`/api/users/${reviewerId}`)
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setReviewerName(data.data.username || data.data.name || "user");
                } else {
                    setReviewerName("Anonymous");
                }
            })
            .catch(() => setReviewerName("Anonymous"));

    }, [review, currentUser]);

    const rawDate = review.createdAt || review.date;
    const formattedDate = rawDate
        ? new Date(rawDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
        : "";

    return (
        <div className="bg-[#111827] border border-[#2D3A6B] rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-white capitalize">
                        {reviewerName}
                    </span>
                    {formattedDate && (
                        <span className="text-xs text-gray-500 font-medium">• {formattedDate}</span>
                    )}
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                    {"★".repeat(review.rating)}
                    <span className="text-gray-600">{"★".repeat(5 - review.rating)}</span>
                </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
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
                setMessage("Product not found");
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
                setMessage("Added to cart!");
                router.push("/cart");
            } else if (res.status === 401 || res.status === 403) {
                router.push("/login");
            } else {
                const data = await res.json();
                setMessage(data.message || "Failed to add to cart");
            }
        } catch (err) {
            setMessage("Something went wrong. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) {
            setReviewMessage("Comment cannot be empty.");
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
                setReviewMessage("Review submitted successfully!");
                setTimeout(() => setReviewMessage(""), 3000);
            } else {
                const errData = await res.json();
                setReviewMessage(errData.message || "Failed to submit review.");
            }
        } catch (err) {
            setReviewMessage("Something went wrong. Please try again.");
        } finally {
            setSubmitReviewLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D1229] text-white flex items-center justify-center">
                <p className="text-lg font-medium animate-pulse">Loading product...</p>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-[#0D1229] text-white flex flex-col items-center justify-center gap-4">
                <p className="text-xl text-gray-400 font-medium">{message || "Product not found"}</p>
                <button onClick={() => router.push("/")} className="px-5 py-2.5 bg-cyan-500 rounded-lg text-sm font-medium text-[#0D1229] font-bold hover:bg-cyan-400 transition shadow-sm">
                    Back to Home
                </button>
            </div>
        );
    }

    const displayRating = item.rating || (reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0);
    const displaySold = item.sold ?? item.soldCount ?? 0;

    return (
        <div className="min-h-screen bg-[#0D1229] text-white">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-16">
                    <div className="w-full aspect-square bg-[#111827] rounded-2xl overflow-hidden border border-[#1E3A5F] flex items-center justify-center relative shadow-sm">
                        {item.picture_url ? (
                            <img src={item.picture_url} alt={item.name} className="object-cover w-full h-full" />
                        ) : (
                            <span className="text-gray-500 text-sm font-medium">No image</span>
                        )}
                    </div>

                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="inline-block px-3 py-1 bg-[#1A2244] border border-[#1E3A5F] rounded-full text-xs text-gray-400 font-semibold uppercase tracking-wider">
                                    {item.category || "General"}
                                </span>

                                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full text-amber-600 text-xs font-bold">
                                    <span>★</span>
                                    <span>{displayRating > 0 ? displayRating.toFixed(1) : "0.0"}</span>
                                    <span className="text-gray-500 font-normal">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
                                </div>

                                <div className="text-xs bg-[#1A2244] border border-[#1E3A5F] text-gray-400 px-2.5 py-1 rounded-full font-medium">
                                    <span className="font-bold text-white">{displaySold}</span> sold
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{item.name}</h1>

                            <p className="text-2xl font-bold text-cyan-400 mb-6">
                                Rp {(item.price ?? 0).toLocaleString("id-ID")}
                            </p>

                            <div className="border-t border-[#1E3A5F] pt-6 mb-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                                <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">{item.description}</p>
                            </div>

                            <div className="border-t border-[#1E3A5F] pt-6 mb-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Specifications</h3>
                                {item.specs ? (
                                    <div className="text-sm text-gray-300 space-y-1">
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
                                    <p className="text-xs text-gray-500 italic">No specifications available.</p>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-[#1E3A5F] pt-6 mt-auto">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-gray-400">Stock: <span className="text-white font-bold">{item.stock}</span></span>

                                {item.stock > 0 && (
                                    <div className="flex items-center border border-[#1E3A5F] bg-[#111827] rounded-lg overflow-hidden shadow-sm">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="px-3 py-1.5 hover:bg-[#1A2244] text-gray-400 font-semibold transition"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 text-sm font-bold w-12 text-center text-white">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => Math.min(item.stock, q + 1))}
                                            className="px-3 py-1.5 hover:bg-[#1A2244] text-gray-400 font-semibold transition"
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
                                    className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-[#1A2244] disabled:text-gray-500 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 text-white shadow-sm"
                                >
                                    {actionLoading ? "Adding..." : "Add to Cart"}
                                </button>
                            ) : (
                                <div className="w-full py-3.5 bg-[#1A2244] text-gray-500 border border-[#1E3A5F] rounded-xl text-center font-bold text-sm">
                                    Out of Stock
                                </div>
                            )}

                            {message && (
                                <p className={`mt-4 text-center text-xs font-bold ${message.includes("Added") ? "text-emerald-400" : "text-rose-400"}`}>
                                    {message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#1E3A5F] pt-12">
                    <h2 className="text-xl font-bold text-white mb-8">Reviews</h2>

                    <div className="bg-[#111827] border border-[#2D3A6B] rounded-xl p-6 shadow-sm mb-8">
                        <h3 className="font-bold text-white text-sm mb-4">
                            Write a review as <span className="text-cyan-400 capitalize">{currentUser?.username || "user"}</span>
                        </h3>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Rating</label>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewRating(star)}
                                            className={`text-2xl focus:outline-none transition-colors ${star <= newRating ? "text-amber-500" : "text-gray-600"}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Comment</label>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-[#2D3A6B] rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm bg-[#1A2244] text-white placeholder:text-gray-600"
                                    placeholder="Share your thoughts about this product..."
                                ></textarea>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className={`text-xs font-bold ${reviewMessage.includes('successfully') ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {reviewMessage}
                                </span>
                                <button
                                    type="submit"
                                    disabled={submitReviewLoading}
                                    className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-[#1A2244] text-white font-bold text-sm rounded-lg transition shadow-sm"
                                >
                                    {submitReviewLoading ? "Submitting..." : "Submit Review"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {reviews.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No reviews yet. Be the first!</p>
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