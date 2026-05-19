import { createReview } from "@/services/reviewService";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

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
        const {item_id, rating, comment} = await req.json();
        const result = await createReview(user_id, item_id, rating, comment);
        return NextResponse.json({
            success: true,
            message: "Successfully created review",
            data: result
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error
        }, {status: 500});
    }
}