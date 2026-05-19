import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-100">
      
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 py-32 text-center">
        
        <h1 className="text-6xl font-bold text-blue-950">
          Buy & Sell Tech Easily
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          TradeSpace helps students buy and sell gadgets, laptops, and tech products easily.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex gap-4">
          
          <button className="rounded-xl bg-blue-950 px-6 py-3 text-white transition hover:bg-blue-900">
            Explore Products
          </button>

          <button className="rounded-xl  bg-blue-950 px-6 py-3 text-white transition hover:bg-blue-900">
            Sell Your Product
          </button>

        </div>
      </section>

{/* Recommended Products */}
<section className="px-10 pb-20">

  <h2 className="mb-8 text-3xl font-bold text-blue-950">
    Recommended Products
  </h2>

  <div className="grid grid-cols-1 gap-6 md:grid-cols-4">

    {/* Product 1 */}
    <div className="rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="h-40 rounded-xl bg-gray-200"></div>

      <h3 className="mt-4 text-xl font-semibold">
        ASUS Vivobook
      </h3>

      <p className="mt-2 text-gray-500">
        Ryzen 7 <br />
        • 16GB RAM <br />
        • SSD 512GB
      </p>

      <p className="mt-4 text-2xl font-bold text-blue-950">
        Rp 7.500.000
      </p>
    </div>

    {/* Product 2 */}
    <div className="rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="h-40 rounded-xl bg-gray-200"></div>

      <h3 className="mt-4 text-xl font-semibold">
        MacBook Air M1
      </h3>

      <p className="mt-2 text-gray-500">
        Apple M1 <br />
        • 8GB RAM <br />
        • SSD 256GB
      </p>

      <p className="mt-4 text-2xl font-bold text-blue-950">
        Rp 11.000.000
      </p>
    </div>

    {/* Product 3 */}
    <div className="rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="h-40 rounded-xl bg-gray-200"></div>

      <h3 className="mt-4 text-xl font-semibold">
        Logitech G Pro
      </h3>

      <p className="mt-2 text-gray-500">
        Mechanical Keyboard RGB
      </p>

      <p className="mt-4 text-2xl font-bold text-blue-950">
        Rp 1.500.000
      </p>
    </div>

    {/* Product 4 */}
    <div className="rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="h-40 rounded-xl bg-gray-200"></div>

      <h3 className="mt-4 text-xl font-semibold">
        iPad Air
      </h3>

      <p className="mt-2 text-gray-500">
        Apple A14 <br />
        • 64GB Storage
      </p>

      <p className="mt-4 text-2xl font-bold text-blue-950">
        Rp 8.500.000
      </p>
    </div>

    {/* Product 5 */}
    <div className="rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="h-40 rounded-xl bg-gray-200"></div>

      <h3 className="mt-4 text-xl font-semibold">
        Samsung Galaxy Tab
      </h3>

      <p className="mt-2 text-gray-500">
        Snapdragon <br />
        • 128GB Storage
      </p>

      <p className="mt-4 text-2xl font-bold text-blue-950">
        Rp 6.000.000
      </p>
    </div>

    {/* Product 6 */}
    <div className="rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="h-40 rounded-xl bg-gray-200"></div>

      <h3 className="mt-4 text-xl font-semibold">
        Razer Mouse
      </h3>

      <p className="mt-2 text-gray-500">
        Wireless Gaming Mouse
      </p>

      <p className="mt-4 text-2xl font-bold text-blue-950">
        Rp 900.000
      </p>
    </div>

    {/* Product 7 */}
    <div className="rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="h-40 rounded-xl bg-gray-200"></div>

      <h3 className="mt-4 text-xl font-semibold">
        Lenovo Legion
      </h3>

      <p className="mt-2 text-gray-500">
        RTX 4060 <br />
        • Ryzen 7
      </p>

      <p className="mt-4 text-2xl font-bold text-blue-950">
        Rp 16.000.000
      </p>
    </div>

    {/* Product 8 */}
    <div className="rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="h-40 rounded-xl bg-gray-200"></div>

      <h3 className="mt-4 text-xl font-semibold">
        AirPods Pro
      </h3>

      <p className="mt-2 text-gray-500">
        Noise Cancelling Earbuds
      </p>

      <p className="mt-4 text-2xl font-bold text-blue-950">
        Rp 3.200.000
      </p>
    </div>

        </div>
      </section>

    </main>
  );
}