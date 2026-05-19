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
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;
        const specs = formData.get('specs') as string;
        const price = formData.get('price') as string;
        const stock = formData.get('stock') as string;
        const condition = formData.get('condition') as string;
        const file = formData.get('file') as File;
        const parsed = JSON.parse(specs);
        let specsObject: object = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;

        const result = await createItem(user_id, name, description, category, specsObject, price, stock, condition, file);

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
        const page = searchParams.get('page') as string;

        const result = await getItems(search, by_rating, category, limit, item_id, by_price, page);

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