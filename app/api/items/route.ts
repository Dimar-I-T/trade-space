import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { createItem, getItems } from "@/services/itemService";

export async function POST(req: NextRequest) {
    try {
        const cookieHeader = req.headers.get('cookie') ?? '';
        const res = await axios.get(`${process.env.WEB_URL}/api/auth/me`, {
            headers: {
                Cookie: cookieHeader
            }
        });
        const user = res.data.data;
        const user_id = user._id;
        const { name, description, category, specs, price, stock, condition } = await req.json();
        const result = await createItem(user_id, name, description, category, specs, price, stock, condition);

        return NextResponse.json({
            success: true,
            message: "Successfully created item",
            data: result
        });
    } catch (error: any) {
        console.error("Error creating item:", error);
        const errorMessage = error.response?.data?.message || error.message || "Internal Server Error";
        return NextResponse.json({
            success: false,
            message: errorMessage
        }, { status: error.response?.status || 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const search = searchParams.get('search') as string;
        const by_rating = searchParams.get('by_rating') === 'true';
        const category = searchParams.get('category') as string;
        const limit = searchParams.get('limit') as string;
        const item_id = searchParams.get('item_id') as string;
        const by_price = searchParams.get('by_price') as string;

        const result = await getItems(search, by_rating, category, limit, item_id, by_price);

        return NextResponse.json({
            success: true,
            message: "Successfully retrieved data",
            data: result
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error
        }, {status: 500});
    }
}