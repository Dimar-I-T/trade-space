import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookie = await cookies();
        cookie.delete('token');

        return NextResponse.json({
            success: true,
            message: "Successfully logged out"
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, {status: 500});
    }
}