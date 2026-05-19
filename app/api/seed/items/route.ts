import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Item from "@/models/Item";

export async function GET(req: NextRequest) {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ 
            success: false, 
            message: "Not allowed" 
        }, { status: 403 });
    }

    try {
        await dbConnect();
        const itemsToInsert = [];
        const JUMLAH_ITEM = 200;
        const DUMMY_SELLER_ID = "6a0bb99c1f0a8403f0e605d8"; 
        const categories = ["Laptop", "Handphone & Tablet", "Konsol Game", "Elektronik Umum", "Audio", "Smartwatch & Wearables", "Aksesoris & Peripheral"];
        const conditions = ["Baru", "Bekas"];

        for (let x = 1; x <= JUMLAH_ITEM; x++) {
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
            const dummyReviews = [];
            const randomReviewCount = Math.floor(Math.random() * 5) + 1;
            let totalRating = 0;

            for (let j = 0; j < randomReviewCount; j++) {
                const rating = Math.floor(Math.random() * 5) + 1;
                totalRating += rating;
                dummyReviews.push({
                    from_user: DUMMY_SELLER_ID, 
                    rating: rating,
                    comment: `Review otomatis untuk produk ini. Kualitas sesuai harga.`,
                    timestamp: new Date()
                });
            }

            const averageRating = totalRating / randomReviewCount;
            itemsToInsert.push({
                seller_id: DUMMY_SELLER_ID,
                name: `Dummy Product ${randomCategory} Edisi ${x}`,
                description: `Ini adalah deskripsi otomatis untuk barang ke-${x} keperluan stress testing performa query.`,
                category: randomCategory,
                specs: { 
                    brand: "DummyBrand", 
                    model: `Model-X${x}`, 
                    color: "Black/White" 
                }, 
                price: Math.floor(Math.random() * 10000000) + 500000, 
                stock: Math.floor(Math.random() * 100) + 1,
                condition: randomCondition,
                average_rating: averageRating,
                reviews: dummyReviews
            });
        }

        await Item.insertMany(itemsToInsert);
        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${JUMLAH_ITEM} items into the database!`,
        });

    } catch (error: any) {
        console.error("Error seeding items:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "Internal Server Error"
        }, { status: 500 });
    }
}