"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Login berhasil!');
        router.push("/");
      } else {
        alert(data.message || "Login gagal");
      }
    } catch (error) {
      alert("Server error");
      console.log(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060a1c]">
      
      <div className="w-full max-w-md rounded-3xl border border-cyan-500/20 bg-[#0B1120] px-10 py-12 shadow-2xl">

        <h1 className="mb-3 text-center text-6xl font-bold text-white">
          Login
        </h1>

        <p className="mb-8 text-center text-gray-400">
          Welcome back to TradeSpace
        </p>

        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-6"
        >

          <div>
            <label className="mb-2 ml-1 block text-lg font-medium text-white">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-cyan-400/20 bg-[#111827] px-5 py-3 text-white placeholder:text-gray-400 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 ml-1 block text-lg font-medium text-white">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-cyan-400/20 bg-[#111827] px-5 py-3 text-white placeholder:text-gray-400 outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-xl bg-[#232B67] py-3 text-lg font-semibold text-white transition hover:bg-[#2A347A]"
          >
            Login
          </button>

          <p className="text-center text-gray-400">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-cyan-400 hover:underline"
            >
              Register
            </a>
          </p>

        </form>
      </div>
    </div>
  );
}