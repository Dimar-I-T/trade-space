import { NextResponse } from "next/server";
import Item from "@/models/Item";
import dbConnect from '@/lib/mongodb';

export async function PATCH() {
    try {
        await dbConnect();

        const result = await Item.updateMany(
            {
                name: {
                    $regex: /^Dummy/i
                }
            },
            {
                $set: {
                    picture_url:
                        "https://placehold.co/600x400?text=Dummy%20Data",
                },
            }
        );

        return NextResponse.json({
            success: true,
            matched: result.matchedCount,
            modified: result.modifiedCount,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update dummy items",
            },
            {
                status: 500,
            }
        );
    }
}