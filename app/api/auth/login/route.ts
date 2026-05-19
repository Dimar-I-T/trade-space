import { login } from "@/services/authService";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
    try {
        const {email, password} = await req.json();
        const payload = await login(email, password);
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw Error('No secret jwt');
        }

        const token = jwt.sign(payload, secret, {
            expiresIn: '24h'
        })

        const response = NextResponse.json({
            success: true,
            message: "Successfully logged in",
            data: payload
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24
        });

        return response;
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error
        }, {status: 500});
    }
}