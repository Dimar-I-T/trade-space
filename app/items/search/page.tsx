"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Search, X, Package, Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
    _id: string;
    name: string;
    price: number;
    picture_url?: string;
    category?: string;
    condition?: string;
    average_rating?: number;
    stock: number;
}

interface Category {
    _id: string;
    name: string;
}

const SORT_OPTIONS = [
    { value: "newest", label: "Newest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
];

const PAGE_SIZE = 12;

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D1229] flex items-center justify-center">
        <p className="text-cyan-400 text-lg font-medium animate-pulse">Loading...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get("q") ?? "");
    const [inputValue, setInputValue] = useState(searchParams.get("q") ?? "");
    const [category, setCategory] = useState(searchParams.get("category") ?? "");
    const [sort, setSort] = useState(searchParams.get("sort") ?? "newest");
    const [page, setPage] = useState(Number(searchParams.get("page") ?? 1));

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);


    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch categories once
    useEffect(() => {
        fetch("/api/categories")
            .then((r) => r.json())
            .then((d) => setCategories(d.data ?? []));
    }, []);

    // Build URL params and push to router
    const syncUrl = useCallback((q: string, cat: string, s: string, p: number) => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (cat) params.set("category", cat);
        if (s && s !== "newest") params.set("sort", s);
        if (p > 1) params.set("page", String(p));
        router.replace(`/items/search?${params.toString()}`, { scroll: false });
    }, [router]);

    // Fetch products whenever filters change
    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (query) params.set("search", query);
                if (category) params.set("category", category);
                if (sort === "price_asc") params.set("by_price", "asc");
                if (sort === "price_desc") params.set("by_price", "desc");
                params.set("limit", String(PAGE_SIZE + 1)); // fetch one extra to know if there's a next page
                params.set("page", String(page));

                const res = await fetch(`/api/items?${params.toString()}`);
                const data = await res.json();
                const all: Product[] = data.data ?? [];

                if (all.length > PAGE_SIZE) {
                    setHasMore(true);
                    setProducts(all.slice(0, PAGE_SIZE));
                } else {
                    setHasMore(false);
                    setProducts(all);
                }
            } catch {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, [query, category, sort, page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const newPage = 1;
        setQuery(inputValue);
        setPage(newPage);
        syncUrl(inputValue, category, sort, newPage);
    };

    const handleCategoryChange = (cat: string) => {
        setCategory(cat);
        setPage(1);
        syncUrl(query, cat, sort, 1);
    };

    const handleSortChange = (s: string) => {
        setSort(s);
        setPage(1);
        syncUrl(query, category, s, 1);
    };

    const handlePageChange = (p: number) => {
        setPage(p);
        syncUrl(query, category, sort, p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const clearQuery = () => {
        setInputValue("");
        setQuery("");
        setPage(1);
        syncUrl("", category, sort, 1);
        inputRef.current?.focus();
    };

    const clearAll = () => {
        setInputValue("");
        setQuery("");
        setCategory("");
        setSort("newest");
        setPage(1);
        syncUrl("", "", "newest", 1);
    };

    const activeFilters = [
        ...(query ? [{ label: `"${query}"`, onRemove: () => { setInputValue(""); setQuery(""); setPage(1); syncUrl("", category, sort, 1); } }] : []),
        ...(category ? [{ label: category, onRemove: () => handleCategoryChange("") }] : []),
        ...(sort !== "newest" ? [{ label: SORT_OPTIONS.find(s => s.value === sort)?.label ?? sort, onRemove: () => handleSortChange("newest") }] : []),
    ];

    return (
        <div className="min-h-screen bg-[#0D1229] text-white">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-10">

                {/* ── SEARCH BAR ── */}
                <form onSubmit={handleSearch} className="relative mb-6">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Search products..."
                        className="w-full bg-[#111827] border border-[#1E3A5F] focus:border-cyan-500 rounded-2xl pl-11 pr-24 py-4 text-white placeholder:text-gray-600 outline-none text-sm transition"
                    />
                    {inputValue && (
                        <button
                            type="button"
                            onClick={clearQuery}
                            className="absolute right-24 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 transition"
                        >
                            <X size={15} />
                        </button>
                    )}
                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-[#0D1229] font-bold text-sm rounded-xl transition"
                    >
                        Search
                    </button>
                </form>

                {/* ── FILTERS ROW ── */}
                <div className="flex flex-wrap items-center gap-3 mb-6">

                    {/* Category pills */}
                    <div className="flex flex-wrap gap-2 flex-1">
                        <button
                            onClick={() => handleCategoryChange("")}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition ${
                                !category
                                    ? "bg-cyan-500 border-cyan-500 text-[#0D1229]"
                                    : "bg-[#111827] border-[#2D3A6B] text-gray-400 hover:border-cyan-500/50 hover:text-gray-200"
                            }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => handleCategoryChange(cat.name)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition ${
                                    category === cat.name
                                        ? "bg-cyan-500 border-cyan-500 text-[#0D1229]"
                                        : "bg-[#111827] border-[#2D3A6B] text-gray-400 hover:border-cyan-500/50 hover:text-gray-200"
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Sort dropdown */}
                    <select
                        value={sort}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="bg-[#111827] border border-[#1E3A5F] focus:border-cyan-500 rounded-xl px-4 py-2 text-sm text-gray-300 outline-none transition appearance-none cursor-pointer"
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value} className="bg-[#111827]">
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* ── ACTIVE FILTER TAGS ── */}
                {activeFilters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        <span className="text-xs text-gray-500">Filters:</span>
                        {activeFilters.map((f, i) => (
                            <span
                                key={i}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold"
                            >
                                {f.label}
                                <button onClick={f.onRemove} className="hover:text-white transition">
                                    <X size={11} />
                                </button>
                            </span>
                        ))}
                        <button
                            onClick={clearAll}
                            className="text-xs text-gray-500 hover:text-rose-400 transition underline underline-offset-2"
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {/* ── RESULTS ── */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="rounded-2xl bg-[#111827] border border-[#1E3A5F] overflow-hidden animate-pulse">
                                <div className="h-44 bg-[#1A2244]" />
                                <div className="p-4 space-y-3">
                                    <div className="h-3 bg-[#1A2244] rounded w-1/3" />
                                    <div className="h-4 bg-[#1A2244] rounded w-3/4" />
                                    <div className="h-5 bg-[#1A2244] rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-[#2D3A6B] rounded-2xl bg-[#111827]">
                        <Package size={40} className="text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium mb-1">No products found</p>
                        <p className="text-gray-600 text-sm mb-5">
                            {query ? `No results for "${query}"` : "Try adjusting your filters."}
                        </p>
                        <button
                            onClick={clearAll}
                            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-[#0D1229] font-bold text-sm rounded-xl transition"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Result count */}
                        <p className="text-xs text-gray-500 mb-5">
                            {query || category
                                ? `Showing results${query ? ` for "${query}"` : ""}${category ? ` in ${category}` : ""}`
                                : `Showing all products`}
                            {" · "}page {page}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {products.map((product) => (
                                <Link key={product._id} href={`/items/${product._id}`}>
                                    <div className="rounded-2xl bg-[#111827] border border-[#1E3A5F] overflow-hidden hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1 transition-all duration-200 group cursor-pointer h-full">

                                        {/* Image */}
                                        <div className="h-44 bg-[#1A2244] overflow-hidden flex items-center justify-center relative">
                                            {product.picture_url ? (
                                                <img
                                                    src={product.picture_url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                />
                                            ) : (
                                                <Package size={32} className="text-gray-600" />
                                            )}
                                            {product.condition && (
                                                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-bold bg-[#0D1229]/80 border border-[#2D3A6B] text-gray-300">
                                                    {product.condition}
                                                </span>
                                            )}
                                            {product.stock === 0 && (
                                                <div className="absolute inset-0 bg-[#0D1229]/60 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-gray-400 bg-[#0D1229]/80 px-3 py-1 rounded-full border border-[#2D3A6B]">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="p-4">
                                            {product.category && (
                                                <span className="inline-block px-2 py-0.5 rounded-full bg-[#1A2244] border border-[#2D3A6B] text-gray-400 text-xs mb-2">
                                                    {product.category}
                                                </span>
                                            )}
                                            <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 mb-3">
                                                {product.name}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <p className="text-cyan-400 font-bold text-base">
                                                    Rp {product.price.toLocaleString("id-ID")}
                                                </p>
                                                {product.average_rating != null && product.average_rating > 0 && (
                                                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                                                        <Star size={11} fill="currentColor" />
                                                        <span>{product.average_rating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* ── PAGINATION ── */}
                        {(page > 1 || hasMore) && (
                            <div className="flex items-center justify-center gap-3 mt-10">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#2D3A6B] hover:border-cyan-500/50 text-gray-400 hover:text-cyan-400 text-sm font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={15} /> Prev
                                </button>

                                <span className="px-4 py-2 rounded-xl bg-[#111827] border border-[#1E3A5F] text-white text-sm font-bold min-w-[48px] text-center">
                                    {page}
                                </span>

                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={!hasMore}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#2D3A6B] hover:border-cyan-500/50 text-gray-400 hover:text-cyan-400 text-sm font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    Next <ChevronRight size={15} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
