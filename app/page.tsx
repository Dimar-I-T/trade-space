"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function Home() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetch("/api/items?page=1&limit=8")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });

  }, []);

  return (
    <main className="min-h-screen bg-[#F5F5F7]">

      <Navbar />

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center py-40 text-center">

        <h1 className="text-7xl font-bold text-blue-950">
          Buy & Sell Tech Easily
        </h1>

        <p className="mt-6 max-w-2xl text-xl text-gray-600">
          TradeSpace helps students buy and sell gadgets,
          laptops, and tech products easily.
        </p>

        <div className="mt-10 flex gap-4">

          <button className="rounded-2xl bg-blue-950 px-8 py-4 text-white transition hover:bg-blue-900">
            Explore Products
          </button>

          <button className="rounded-2xl  bg-blue-950 px-8 py-4 text-white transition hover:bg-blue-900">
            Sell Your Product
          </button>

        </div>
      </section>

      {/* RECOMMENDED PRODUCTS */}
      <section className="px-10 pb-20">

        <h2 className="mb-8 text-3xl font-bold text-blue-950">
          Recommended Products
        </h2>

      {loading ? (
        <p className="text-gray-500">
          Loading products...
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">

          {products.map((product: any) => (

            <div
              key={product._id}
              className="rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
            >

              <div className="h-40 rounded-xl bg-gray-200"></div>

              <h3 className="mt-4 text-xl font-semibold">
                {product.name}
              </h3>

              <div className="mt-2 text-gray-500">

                {product.specs &&
                  Object.entries(product.specs).map(([key, value]) => (
                    <p key={key}>
                      • {String(value)}
                    </p>
                  ))}

              </div>

              <p className="mt-4 text-2xl font-bold text-blue-950">
                Rp {product.price.toLocaleString("id-ID")}
              </p>

            </div>

          ))}

        
        </div>
      )}
      </section>

    </main>
  );
}