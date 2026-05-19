import { getAuth } from "@/lib/auth";
import { JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";
import { getUserById } from "@/services/authService";

export async function GET() {
    try {
        const payload : JwtPayload | null = await getAuth();
        const user_id = payload?._id;
        const result = await getUserById(user_id);
        return NextResponse.json({
            success: true,
            message: "Successfully retrieved own user data",
            data: result
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, {status: 500});
    }
}