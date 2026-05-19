import { getCategories } from "@/services/categoryService";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const result = await getCategories();
        return NextResponse.json({
            success: true,
            message: "Successfully retrieved all categories",
            data: result
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error
        }, {status: 500});
    }
}