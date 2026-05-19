import { getCategories } from "@/services/categoryService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const name = searchParams.get('name') as string;
        const result = await getCategories(name);
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