import { deleteReviewById } from "@/services/reviewService";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function DELETE(req: NextRequest, {params}: RouteParams) {
    try {
        const cookieHeader = req.headers.get('cookie') ?? '';
        const res = await axios.get(`${process.env.WEB_URL}/api/auth/me`, {
            headers: {
                Cookie: cookieHeader
            }
        });
        
        const user = res.data.data;
        const user_id = user._id;
        const {id: review_id} = await params;
        const {item_id} = await req.json();
        const result = await deleteReviewById(user_id, review_id, item_id);
        return NextResponse.json({
            success: true,
            message: "Successfully deleted review",
            data: result
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error
        }, {status: 500})
    }
}