"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { X, Package, Star, CalendarDays, ExternalLink } from "lucide-react";

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
    seller_id?: string;
    specs?: string[] | string | Record<string, any>;
    reviews?: Review[];
    rating?: number;
    sold?: number;
    soldCount?: number;
}

interface UserProfile {
    _id: string;
    username: string;
    name?: string;
    createdAt?: string;
}

interface UserListing {
    _id: string;
    name: string;
    price: number;
    picture_url?: string;
    category?: string;
    condition?: string;
    average_rating?: number;
    stock: number;
}

// ── USER PROFILE MODAL ───────────────────────────────────────
const UserModal = ({ userId, onClose }: { userId: string; onClose: () => void }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [listings, setListings] = useState<UserListing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const [userRes, itemsRes] = await Promise.all([
                    fetch(`/api/users/${userId}`),
                    fetch(`/api/items?user_id=${userId}`),
                ]);
                if (userRes.ok) {
                    const d = await userRes.json();
                    setProfile(d.data);
                }
                if (itemsRes.ok) {
                    const d = await itemsRes.json();
                    const all: UserListing[] = d.data ?? [];
                    setListings(all.filter((i) => i.stock > 0));
                }
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [userId]);

    const joinDate = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : null;

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative z-10 w-full max-w-md bg-[#111827] border border-[#1E3A5F] rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#1E3A5F]">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Seller Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-[#1A2244] text-gray-500 hover:text-white transition"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <p className="text-cyan-400 text-sm animate-pulse">Loading...</p>
                        </div>
                    ) : !profile ? (
                        <p className="text-center text-gray-500 text-sm py-8">User not found.</p>
                    ) : (
                        <>
                            {/* Profile info */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-full bg-cyan-500 flex items-center justify-center text-[#0D1229] font-bold text-xl shadow-lg shadow-cyan-500/30 flex-shrink-0">
                                    {profile.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-base">{profile.username}</p>
                                    {profile.name && profile.name !== profile.username && (
                                        <p className="text-gray-400 text-xs mt-0.5">{profile.name}</p>
                                    )}
                                    <div className="flex items-center gap-3 mt-2">
                                        {joinDate && (
                                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                                                <CalendarDays size={11} />
                                                <span>Joined {joinDate}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                                            <Package size={11} />
                                            <span>{listings.length} listing{listings.length !== 1 ? "s" : ""}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Listings preview */}
                            {listings.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                        Active Listings
                                    </p>
                                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                                        {listings.slice(0, 5).map((item) => (
                                            <Link
                                                key={item._id}
                                                href={`/items/${item._id}`}
                                                onClick={onClose}
                                            >
                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1A2244] border border-[#2D3A6B] hover:border-cyan-500/40 hover:bg-[#1e2a52] transition group">
                                                    <div className="w-10 h-10 rounded-lg bg-[#0D1229] border border-[#2D3A6B] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        {item.picture_url ? (
                                                            <img src={item.picture_url} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package size={14} className="text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-xs font-semibold line-clamp-1 group-hover:text-cyan-300 transition">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-cyan-400 text-xs font-bold mt-0.5">
                                                            Rp {item.price.toLocaleString("id-ID")}
                                                        </p>
                                                    </div>
                                                    {item.average_rating != null && item.average_rating > 0 && (
                                                        <div className="flex items-center gap-0.5 text-amber-400 text-xs flex-shrink-0">
                                                            <Star size={10} fill="currentColor" />
                                                            <span>{item.average_rating.toFixed(1)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* View full profile */}
                            <Link href={`/users/${userId}`} onClick={onClose}>
                                <button className="w-full mt-5 py-2.5 border border-[#2D3A6B] hover:border-cyan-500/50 hover:bg-cyan-500/5 text-gray-400 hover:text-cyan-400 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2">
                                    <ExternalLink size={14} />
                                    View Full Profile
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── REVIEW CARD ──────────────────────────────────────────────
const ReviewCard = ({
    review,
    currentUser,
    onUserClick,
}: {
    review: Review;
    currentUser: any;
    onUserClick: (userId: string) => void;
}) => {
    const [reviewerName, setReviewerName] = useState<string>("Loading...");
    const [reviewerId, setReviewerId] = useState<string | null>(null);

    useEffect(() => {
        const raw = review.from_user || review.user_id || review.userId || review.user;

        if (!raw) {
            setReviewerName("Anonymous");
            return;
        }

        if (typeof raw === "object") {
            setReviewerName(raw.username || raw.name || "user");
            if (raw._id) setReviewerId(raw._id);
            return;
        }

        // raw is a string ID
        setReviewerId(raw);

        if (currentUser && currentUser._id === raw) {
            setReviewerName(currentUser.username || "You");
            return;
        }

        fetch(`/api/users/${raw}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.data) setReviewerName(data.data.username || data.data.name || "user");
                else setReviewerName("Anonymous");
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
                    <button
                        onClick={() => reviewerId && onUserClick(reviewerId)}
                        disabled={!reviewerId}
                        className={`font-bold text-sm capitalize transition ${
                            reviewerId
                                ? "text-cyan-400 hover:text-cyan-300 hover:underline underline-offset-2 cursor-pointer"
                                : "text-white cursor-default"
                        }`}
                    >
                        {reviewerName}
                    </button>
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

// ── MAIN PAGE ────────────────────────────────────────────────
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

    // Modal state
    const [modalUserId, setModalUserId] = useState<string | null>(null);

    // Seller info
    const [sellerName, setSellerName] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const userRes = await fetch("/api/auth/me");
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setCurrentUser(userData.user || userData.data);
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

                // Fetch seller name
                if (fetchedItem.seller_id) {
                    fetch(`/api/users/${fetchedItem.seller_id}`)
                        .then((r) => r.json())
                        .then((d) => { if (d.data) setSellerName(d.data.username || d.data.name); })
                        .catch(() => {});
                }
            } catch {
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
        } catch {
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
        } catch {
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
                <button
                    onClick={() => router.push("/")}
                    className="px-5 py-2.5 bg-cyan-500 rounded-lg text-sm font-bold text-[#0D1229] hover:bg-cyan-400 transition"
                >
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

            {/* User profile modal */}
            {modalUserId && (
                <UserModal userId={modalUserId} onClose={() => setModalUserId(null)} />
            )}

            <main className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-16">
                    <div className="w-full aspect-square bg-[#111827] rounded-2xl overflow-hidden border border-[#1E3A5F] flex items-center justify-center shadow-sm">
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
                            <p className="text-2xl font-bold text-cyan-400 mb-3">
                                Rp {(item.price ?? 0).toLocaleString("id-ID")}
                            </p>

                            {/* Seller */}
                            {item.seller_id && (
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="text-xs text-gray-500">Sold by</span>
                                    <button
                                        onClick={() => setModalUserId(item.seller_id!)}
                                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline underline-offset-2 transition"
                                    >
                                        {sellerName ?? "…"}
                                    </button>
                                </div>
                            )}

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
                                        ) : typeof item.specs === "object" ? (
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
                                <span className="text-sm font-medium text-gray-400">
                                    Stock: <span className="text-white font-bold">{item.stock}</span>
                                </span>
                                {item.stock > 0 && (
                                    <div className="flex items-center border border-[#1E3A5F] bg-[#111827] rounded-lg overflow-hidden">
                                        <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-1.5 hover:bg-[#1A2244] text-gray-400 font-semibold transition">-</button>
                                        <span className="px-4 text-sm font-bold w-12 text-center text-white">{quantity}</span>
                                        <button onClick={() => setQuantity((q) => Math.min(item.stock, q + 1))} className="px-3 py-1.5 hover:bg-[#1A2244] text-gray-400 font-semibold transition">+</button>
                                    </div>
                                )}
                            </div>

                            {item.stock > 0 ? (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={actionLoading}
                                    className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-[#1A2244] disabled:text-gray-500 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 text-[#0D1229] shadow-sm"
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

                {/* Reviews section */}
                <div className="border-t border-[#1E3A5F] pt-12">
                    <h2 className="text-xl font-bold text-white mb-8">Reviews</h2>

                    {/* Write review box */}
                    <div className="bg-[#111827] border border-[#2D3A6B] rounded-xl p-6 shadow-sm mb-8">
                        <h3 className="font-bold text-white text-sm mb-4">
                            Write a review as{" "}
                            <span className="text-cyan-400 capitalize">{currentUser?.username || "user"}</span>
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
                                />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className={`text-xs font-bold ${reviewMessage.includes("successfully") ? "text-emerald-400" : "text-rose-400"}`}>
                                    {reviewMessage}
                                </span>
                                <button
                                    type="submit"
                                    disabled={submitReviewLoading}
                                    className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-[#1A2244] disabled:text-gray-500 text-[#0D1229] font-bold text-sm rounded-lg transition"
                                >
                                    {submitReviewLoading ? "Submitting..." : "Submit Review"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Review list */}
                    {reviews.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No reviews yet. Be the first!</p>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <ReviewCard
                                    key={review._id}
                                    review={review}
                                    currentUser={currentUser}
                                    onUserClick={(uid) => setModalUserId(uid)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
