"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Star, Package, ArrowRight } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  picture_url?: string;
  category?: string;
  condition?: string;
  average_rating?: number;
  stock: number;
  specs?: Record<string, any>;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const productsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch("/api/items?page=1&limit=16")
      .then((res) => res.json())
      .then((data) => {
        const all: Product[] = data.data ?? [];
        // Filter stock > 0 client-side (backend doesn't support this query yet)
        setProducts(all.filter((p) => p.stock > 0));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#0D1229]">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center py-36 text-center px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <span className="mb-4 inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold tracking-widest uppercase">
          Student Marketplace
        </span>

        <h1 className="text-6xl font-bold text-white leading-tight max-w-3xl">
          Buy & Sell Tech{" "}
          <span className="text-cyan-400">Easily</span>
        </h1>

        <p className="mt-5 max-w-xl text-lg text-gray-400">
          TradeSpace helps students buy and sell gadgets, laptops, and tech products with ease.
        </p>

        <div className="mt-10 flex gap-4">
          <button
            onClick={scrollToProducts}
            className="rounded-2xl bg-cyan-500 hover:bg-cyan-400 px-8 py-4 text-[#0D1229] font-bold transition shadow-lg shadow-cyan-500/20"
          >
            Explore Products
          </button>
          <Link href="/sell">
            <button className="rounded-2xl border border-cyan-500/40 hover:border-cyan-400 px-8 py-4 text-cyan-400 hover:text-cyan-300 font-bold transition">
              Sell Your Product
            </button>
          </Link>
        </div>
      </section>

      {/* ── RECOMMENDED PRODUCTS ── */}
      <section ref={productsRef} className="px-6 md:px-10 pb-24">

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">
            Recommended Products
          </h2>
          <Link href="/items/search" className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition">
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-[#111827] border border-[#1E3A5F] overflow-hidden animate-pulse">
                <div className="h-44 bg-[#1A2244]" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-[#1A2244] rounded w-3/4" />
                  <div className="h-3 bg-[#1A2244] rounded w-1/2" />
                  <div className="h-5 bg-[#1A2244] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#2D3A6B] rounded-2xl">
            <Package size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
            {products.map((product) => (
              <Link key={product._id} href={`/items/${product._id}`}>
                <div className="rounded-2xl bg-[#111827] border border-[#1E3A5F] overflow-hidden hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1 transition-all duration-200 group cursor-pointer">

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
        )}

      </section>
    </main>
  );
}
