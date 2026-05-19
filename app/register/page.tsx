export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-lg">
        <h1 className="text-center text-5xl font-bold text-[#1D2559]">
          Register
        </h1>

        <p className="mt-4 text-center text-gray-600">
          Create your TradeSpace account
        </p>

        <form className="mt-10 flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-lg font-medium">
              Username
            </label>

            <input
              type="text"
              placeholder="Enter your username"
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