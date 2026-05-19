import { deleteItemById, getItemById, updateItemById } from "@/services/itemService";
import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(req: NextRequest, {params} : RouteParams) {
    try {
        const { id: item_id } = await params;
        const result = await getItemById(item_id);
        return NextResponse.json({
            success: true,
            message: "Successfully retrieved item data by id",
            data: result
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error
        }, {status: 500});
    }
}

export async function PUT(req: NextRequest, {params} : RouteParams) {
    try {
        const {id: item_id} = await params;
        const cookieHeader = req.headers.get('cookie') ?? '';
        await axios.get(`${process.env.WEB_URL}/api/auth/me`, {
            headers: {
                Cookie: cookieHeader
            }
        });
        
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;
        const specs = formData.get('specs') as string;
        const price = formData.get('price') as string;
        const stock = formData.get('stock') as string;
        const condition = formData.get('condition') as string;
        const file = formData.get('file') as File;
        const existing_url = formData.get('picture_url') as string;
        const parsed = JSON.parse(specs);
        let specsObject: object = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
        const result = await updateItemById(item_id, name, description, category, specsObject, price, stock, condition, file, existing_url);

        return NextResponse.json({
            success: true,
            message: "Successfully updated item",
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

export async function DELETE(req: NextRequest, {params}: RouteParams) {
    try {
        const {id: item_id} = await params;
        const result = await deleteItemById(item_id);
        return NextResponse.json({
            success: true,
            message: "Successfully deleted item",
            data: result
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error
        }, {status: 500});
    }
}