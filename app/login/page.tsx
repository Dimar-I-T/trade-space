"use client";

import { useState } from "react";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {

      const response = await fetch("http://localhost:3000/auth/login", {
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

      console.log(data);

      alert(data.message);

    } catch (error) {
      console.log(error);

      alert("Login gagal");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">

      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl">

        <h1 className="text-center text-4xl font-bold text-[#1D2559]">
          Login
        </h1>

        <p className="mt-3 text-center text-gray-500">
          Welcome back to TradeSpace
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-8 flex flex-col gap-5"
        >

          {/* Email */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#1D2559]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#1D2559]"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="mt-4 rounded-xl bg-[#1D2559] py-3 text-lg font-semibold text-white transition hover:bg-[#2A347A]"
          >
            Login
          </button>

        </form>

      </div>

    </div>
  );
}