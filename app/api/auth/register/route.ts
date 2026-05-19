import { register } from "@/services/authService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const {username, email, password} = await req.json();
        const result = await register(username, email, password);
        return NextResponse.json({
            success: true,
            message: "Successfully registered user",
            data: result
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error
        }, {status: 500});
    }
} 