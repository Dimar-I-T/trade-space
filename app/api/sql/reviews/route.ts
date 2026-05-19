import { pool } from "@/lib/db/config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await pool.query('BEGIN');
        const {user_id, item_id, rating, comment} = await req.json();
        const result = await pool.query(`
                insert into reviews (user_id, item_id, rating, comment) values
                ($1, $2, $3, $4)
                returning *
            `, [user_id, item_id, rating, comment]);

        if (result.rows.length == 0) {
            throw Error('Terjadi error insert');
        }

        const res_update_rating = await pool.query(`
                select avg(rating) as average_rating
                from reviews
                where item_id = $1
                group by item_id
            `, [item_id]);

        if (res_update_rating.rows.length == 0) {
            throw Error('Terjadi error saat select average');
        }

        const newRating = Number(res_update_rating.rows[0].average_rating);
        const res_update_avg = await pool.query(`
                update items
                set average_rating = $1
                where item_id = $2
                returning *
            `, [newRating, item_id]);

        if (res_update_avg.rows.length == 0) {
            throw Error('Terjadi error saat mengupdate ke items');
        }

        await pool.query('COMMIT');
        return NextResponse.json({
            success: true,
            message: "Successfully created review for item",
            data: result.rows[0]
        });
    } catch (error: any) {
        await pool.query('ROLLBACK');
        return NextResponse.json({
            success: false,
            message: error.message
        }, {status: 500});
    }
}