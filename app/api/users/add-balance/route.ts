import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(
    Request: Request,
    { body }: { body: { amount: number } }
) {
    try {
        await connectMongoDB();
        const { amount } = await Request.json();

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json(
                { success: false, message: "Invalid amount", data: null },
                { status: 400 }
            );
        }

        const userId = request.headers.get('X-User-Id');
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "User not authenticated", data: null },
                { status: 401 }
            );
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found", data: null },
                { status: 404 }
            );
        }

        user.balance += amount;
        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: "Balance updated successfully",
                data: user
            },
            { status: 200 }
        );

    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error", data: null },
            { status: 500 }
        );
    }
}