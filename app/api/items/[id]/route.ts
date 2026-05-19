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
        
        const { name, description, category, specs, price, stock, condition } = await req.json();
        const result = await updateItemById(item_id, name, description, category, specs, price, stock, condition);

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