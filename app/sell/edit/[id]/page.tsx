"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";

interface Category {
    _id: string;
    name: string;
    allowed_specs: string[];
}

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [specs, setSpecs] = useState<Record<string, string>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string>("");
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "",
        price: "",
        stock: "",
        condition: "",
    });

    // Auth check
    useEffect(() => {
        fetch("/api/auth/me").then((res) => {
            if (!res.ok) router.push("/login");
        });
    }, []);

    // Fetch categories + existing item data
    useEffect(() => {
        async function fetchData() {
            try {
                const [catRes, itemRes] = await Promise.all([
                    fetch("/api/categories"),
                    fetch(`/api/items/${id}`),
                ]);

                const catData = await catRes.json();
                const cats: Category[] = catData.data ?? [];
                setCategories(cats);

                if (!itemRes.ok) {
                    router.push("/dashboard");
                    return;
                }

                const itemData = await itemRes.json();
                const item = itemData.data;

                // Pre-fill form
                setForm({
                    name: item.name ?? "",
                    description: item.description ?? "",
                    category: item.category ?? "",
                    price: String(item.price ?? ""),
                    stock: String(item.stock ?? ""),
                    condition: item.condition ?? "",
                });

                // Pre-fill image
                if (item.picture_url) {
                    setExistingImageUrl(item.picture_url);
                    setImagePreview(item.picture_url);
                }

                // Pre-fill specs
                const cat = cats.find((c) => c.name === item.category) ?? null;
                setSelectedCategory(cat);
                if (cat) {
                    const filledSpecs: Record<string, string> = {};
                    cat.allowed_specs.forEach((key) => {
                        filledSpecs[key] = item.specs?.[key] ?? "";
                    });
                    setSpecs(filledSpecs);
                }
            } catch {
                router.push("/dashboard");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handleCategoryChange = (categoryName: string) => {
        const cat = categories.find((c) => c.name === categoryName) ?? null;
        setSelectedCategory(cat);
        setForm((f) => ({ ...f, category: categoryName }));
        const newSpecs: Record<string, string> = {};
        cat?.allowed_specs.forEach((key) => { newSpecs[key] = ""; });
        setSpecs(newSpecs);
    };

    const applyImageFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) applyImageFile(file);
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) applyImageFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!imagePreview && !existingImageUrl) {
            setError("Please upload a product image.");
            return;
        }
        if (!form.condition) {
            setError("Please select a condition.");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("description", form.description);
            formData.append("category", form.category);
            formData.append("specs", JSON.stringify(specs));
            formData.append("price", form.price);
            formData.append("stock", form.stock);
            formData.append("condition", form.condition);
            formData.append("picture_url", existingImageUrl);
            if (imageFile) formData.append("file", imageFile);

            const res = await fetch(`/api/items/${id}`, {
                method: "PUT",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Failed to update listing.");
                return;
            }

            router.push("/dashboard");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D1229] flex items-center justify-center">
                <p className="text-cyan-400 text-lg font-medium animate-pulse">Loading product...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0D1229] text-white">
            <Navbar />

            <main className="max-w-2xl mx-auto px-4 py-10">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/dashboard">
                        <button className="p-2 rounded-xl border border-[#2D3A6B] hover:border-cyan-500/50 hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition">
                            <ArrowLeft size={18} />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Edit Product</h1>
                        <p className="text-gray-400 text-sm mt-0.5">Update your listing details</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Product Image <span className="text-rose-400">*</span>
                        </label>

                        {imagePreview ? (
                            <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-[#1E3A5F]">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-3 right-3 p-1.5 rounded-full bg-[#0D1229]/80 border border-[#2D3A6B] hover:bg-rose-500/20 hover:border-rose-400 text-gray-300 hover:text-rose-400 transition"
                                >
                                    <X size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#0D1229]/80 border border-[#2D3A6B] hover:border-cyan-500/50 text-gray-300 hover:text-cyan-400 text-xs font-medium transition"
                                >
                                    Replace
                                </button>
                            </div>
                        ) : (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full h-56 rounded-2xl border-2 border-dashed bg-[#111827] flex flex-col items-center justify-center gap-3 transition cursor-pointer select-none
                                    ${dragging
                                        ? "border-cyan-400 bg-cyan-500/10 scale-[1.01]"
                                        : "border-[#2D3A6B] hover:border-cyan-500/50 hover:bg-cyan-500/5"
                                    }`}
                            >
                                <Upload size={28} className={`transition ${dragging ? "text-cyan-400" : "text-gray-600"}`} />
                                <div className="text-center">
                                    <p className={`text-sm font-medium transition ${dragging ? "text-cyan-300" : "text-gray-500"}`}>
                                        {dragging ? "Drop image here" : "Drag & drop or click to upload"}
                                    </p>
                                    <p className="text-gray-600 text-xs mt-1">PNG, JPG, WEBP up to 10MB</p>
                                </div>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </div>

                    {/* Product Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Product Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. MacBook Pro 14-inch 2023"
                            className="w-full bg-[#111827] border border-[#1E3A5F] focus:border-cyan-500 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none text-sm transition"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Description <span className="text-rose-400">*</span>
                        </label>
                        <textarea
                            required
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            rows={4}
                            placeholder="Describe your product — include any relevant details, flaws, or accessories included"
                            className="w-full bg-[#111827] border border-[#1E3A5F] focus:border-cyan-500 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none text-sm transition resize-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Category <span className="text-rose-400">*</span>
                        </label>
                        <select
                            required
                            value={form.category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="w-full bg-[#111827] border border-[#1E3A5F] focus:border-cyan-500 rounded-xl px-4 py-3 text-white outline-none text-sm transition appearance-none cursor-pointer"
                        >
                            <option value="" disabled className="text-gray-600">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat.name} className="bg-[#111827]">
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Dynamic Specs */}
                    {selectedCategory && selectedCategory.allowed_specs.length > 0 && (
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Specifications
                            </label>
                            <div className="bg-[#111827] border border-[#1E3A5F] rounded-2xl p-4 space-y-3">
                                {selectedCategory.allowed_specs.map((specKey) => (
                                    <div key={specKey} className="flex items-center gap-3">
                                        <span className="text-gray-400 text-sm w-28 flex-shrink-0 capitalize">
                                            {specKey}
                                        </span>
                                        <input
                                            type="text"
                                            value={specs[specKey] ?? ""}
                                            onChange={(e) => setSpecs((s) => ({ ...s, [specKey]: e.target.value }))}
                                            placeholder={`Enter ${specKey}`}
                                            className="flex-1 bg-[#1A2244] border border-[#2D3A6B] focus:border-cyan-500 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 outline-none text-sm transition"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Price & Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Price (Rp) <span className="text-rose-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">
                                    Rp
                                </span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    value={form.price ? Number(form.price).toLocaleString("id-ID") : ""}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\D/g, "");
                                        setForm((f) => ({ ...f, price: raw }));
                                    }}
                                    placeholder="0"
                                    className="w-full bg-[#111827] border border-[#1E3A5F] focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 outline-none text-sm transition"
                                />
                            </div>
                            {form.price && (
                                <p className="text-gray-500 text-xs mt-1.5 pl-1">
                                    = Rp {Number(form.price).toLocaleString("id-ID")}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Stock <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                required
                                value={form.stock ? Number(form.stock).toLocaleString("id-ID") : ""}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, "");
                                    setForm((f) => ({ ...f, stock: raw }));
                                }}
                                placeholder="0"
                                className="w-full bg-[#111827] border border-[#1E3A5F] focus:border-cyan-500 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none text-sm transition"
                            />
                        </div>
                    </div>

                    {/* Condition */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Condition <span className="text-rose-400">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CONDITIONS.map((cond) => (
                                <button
                                    key={cond}
                                    type="button"
                                    onClick={() => setForm((f) => ({ ...f, condition: cond }))}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                                        form.condition === cond
                                            ? "bg-cyan-500 border-cyan-500 text-[#0D1229]"
                                            : "bg-[#111827] border-[#2D3A6B] text-gray-400 hover:border-cyan-500/50 hover:text-gray-200"
                                    }`}
                                >
                                    {cond}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-rose-900/30 border border-rose-500/40 rounded-xl text-rose-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Link href="/dashboard" className="flex-1">
                            <button
                                type="button"
                                className="w-full py-4 border border-[#2D3A6B] hover:border-gray-500 text-gray-400 hover:text-gray-200 font-bold text-sm rounded-xl transition"
                            >
                                Cancel
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:text-gray-500 text-[#0D1229] font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
}
