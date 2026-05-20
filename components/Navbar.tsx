import Link from "next/link";
import { ShoppingCart, Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="bg-[#1D2559] px-6 py-3 shadow-md">
      <div className="flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-300">
            💻
          </div>

          <h1 className="text-2xl font-bold text-white">
            Trade<span className="text-blue-300">Space</span>
          </h1>
        </div>

        {/* CENTER */}
        <div className="mx-20 flex w-full max-w-xl items-center rounded-2xl border border-blue-300 bg-[#22306B] px-4 py-2">

          <Search className="mr-2 text-gray-300" size={18} />

          <input
            type="text"
            placeholder="Search for laptops, gadgets, and electronics"
            className="w-full bg-transparent text-white placeholder:text-gray-300 outline-none"
          />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* Cart */}
          <Link href="/cart">
            <button className="rounded-xl border border-blue-300 p-2.5 text-white transition hover:bg-blue-800">
              <ShoppingCart size={20} />
            </button>
          </Link>

          {/* Divider */}
          <div className="h-7 w-[1px] bg-blue-300" />

          {/* Login */}
          <Link href="/login">
            <button className="rounded-xl border border-blue-300 px-6 py-2 text-white transition hover:bg-blue-800">
            Login
            </button>
        </Link>

          {/* Register */}
          <Link href="/register">
            <button className="rounded-xl border border-blue-300 px-6 py-2 text-white transition hover:bg-blue-800">
                Register
            </button>
        </Link>

        </div>
      </div>
    </header>
  );
}