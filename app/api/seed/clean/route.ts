import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Item from "@/models/Item";

export async function GET(req: NextRequest) {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ 
            success: false, 
            message: "Not allowed in production environment" 
        }, { status: 403 });
    }

    try {
        await dbConnect();
        const result = await Item.deleteMany({});
        return NextResponse.json({
            success: true,
            message: `Cleanup berhasil! ${result.deletedCount} item telah dihapus dari database.`,
        });

    } catch (error: any) {
        console.error("Error cleaning database:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "Internal Server Error"
        }, { status: 500 });
    }
}