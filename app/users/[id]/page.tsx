"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Package, Star, CalendarDays } from "lucide-react";

interface UserProfile {
    _id: string;
    username: string;
    name?: string;
    email: string;
    createdAt?: string;
}

interface Item {
    _id: string;
    name: string;
    price: number;
    stock: number;
    category?: string;
    condition?: string;
    picture_url?: string;
    average_rating?: number;
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const userRes = await fetch(`/api/users/${id}`);
                if (!userRes.ok) { setNotFound(true); setLoading(false); return; }
                const userData = await userRes.json();
                setProfile(userData.data);

                const itemsRes = await fetch(`/api/items?user_id=${id}`);
                if (itemsRes.ok) {
                    const itemsData = await itemsRes.json();
                    const all: Item[] = itemsData.data ?? [];
                    setItems(all.filter((i) => i.stock > 0));
                }
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D1229] flex items-center justify-center">
                <p className="text-cyan-400 text-lg font-medium animate-pulse">Loading profile...</p>
            </div>
        );
    }

    if (notFound || !profile) {
        return (
            <div className="min-h-screen bg-[#0D1229] text-white flex flex-col items-center justify-center gap-4">
                <p className="text-xl text-gray-400 font-medium">User not found.</p>
                <button
                    onClick={() => router.back()}
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-[#0D1229] font-bold text-sm rounded-xl transition"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const initial = profile.username.charAt(0).toUpperCase();
    const joinDate = profile.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : null;

    return (
        <div className="min-h-screen bg-[#0D1229] text-white">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 py-10">

                {/* Back */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 text-sm font-medium mb-8 transition"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                {/* Profile card */}
                <div className="bg-[#111827] border border-[#1E3A5F] rounded-2xl p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl">
                    <div className="flex-shrink-0 w-20 h-20 rounded-full bg-cyan-500 flex items-center justify-center text-[#0D1229] font-bold text-3xl shadow-lg shadow-cyan-500/30">
                        {initial}
                    </div>

                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
                        {profile.name && profile.name !== profile.username && (
                            <p className="text-gray-400 text-sm mt-0.5">{profile.name}</p>
                        )}

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4">
                            {joinDate && (
                                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                    <CalendarDays size={13} />
                                    <span>Joined {joinDate}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                <Package size={13} />
                                <span>{items.length} active listing{items.length !== 1 ? "s" : ""}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Listings */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6">
                        Listings by{" "}
                        <span className="text-cyan-400">{profile.username}</span>
                    </h2>

                    {items.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-[#2D3A6B] rounded-2xl bg-[#111827]">
                            <Package size={40} className="text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium mb-1">No listings yet</p>
                            <p className="text-gray-600 text-sm">This user hasn't listed any products.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {items.map((item) => (
                                <Link key={item._id} href={`/items/${item._id}`}>
                                    <div className="rounded-2xl bg-[#111827] border border-[#1E3A5F] overflow-hidden hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1 transition-all duration-200 group cursor-pointer">

                                        {/* Image */}
                                        <div className="h-44 bg-[#1A2244] overflow-hidden flex items-center justify-center relative">
                                            {item.picture_url ? (
                                                <img
                                                    src={item.picture_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                />
                                            ) : (
                                                <Package size={32} className="text-gray-600" />
                                            )}
                                            {item.condition && (
                                                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-bold bg-[#0D1229]/80 border border-[#2D3A6B] text-gray-300">
                                                    {item.condition}
                                                </span>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="p-4">
                                            {item.category && (
                                                <span className="inline-block px-2 py-0.5 rounded-full bg-[#1A2244] border border-[#2D3A6B] text-gray-400 text-xs mb-2">
                                                    {item.category}
                                                </span>
                                            )}
                                            <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 mb-3">
                                                {item.name}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <p className="text-cyan-400 font-bold text-base">
                                                    Rp {item.price.toLocaleString("id-ID")}
                                                </p>
                                                {item.average_rating != null && item.average_rating > 0 && (
                                                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                                                        <Star size={11} fill="currentColor" />
                                                        <span>{item.average_rating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
