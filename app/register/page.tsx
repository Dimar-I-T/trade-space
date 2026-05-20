"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Register berhasil!");
      } else {
        alert(data.message || "Register gagal");
      }
    } catch (error) {
      alert("Server error");
      console.log(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-lg">
        <h1 className="text-center text-5xl font-bold text-[#1D2559]">
          Register
        </h1>

        <p className="mt-4 text-center text-gray-600">
          Create your TradeSpace account
        </p>

        <form
          onSubmit={handleRegister}
          className="mt-10 flex flex-col gap-5"
        >
          <div>
            <label className="mb-2 block text-lg font-medium">
              Username
            </label>

            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-5 py-4 outline-none focus:border-[#1D2559]"
            />
          </div>

          <div>
            <label className="mb-2 block text-lg font-medium">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-5 py-4 outline-none focus:border-[#1D2559]"
            />
          </div>

          <div>
            <label className="mb-2 block text-lg font-medium">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-5 py-4 outline-none focus:border-[#1D2559]"
            />
          </div>

          <button
            type="submit"
            className="mt-4 rounded-2xl bg-[#1D2559] py-4 text-xl font-semibold text-white transition hover:bg-[#2A347A]"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}