import { pool } from "@/lib/db/config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const {user_id, name, description, category, specs, price, stock, condition} = await req.json();
        await pool.query('BEGIN');
        const result = await pool.query(`
                insert into items (user_id, name, description, category, price, stock, condition) values  
                ($1, $2, $3, $4, $5, $6, $7)
                returning *
            `, [user_id, name, description, category, price, stock, condition]);
        
        if (result.rows.length == 0) {
            throw Error('cannot insert into items');
        }

        const item_id = result.rows[0].item_id;
        for (const [key, value] of Object.entries(specs)) {
            const res_spec_id = await pool.query(`
                    select spec_id
                    from specs
                    where name = $1
                `, [key]);
            if (res_spec_id.rows.length == 0) {
                throw Error('cannot get spec_id');
            }

            const spec_id = res_spec_id.rows[0].spec_id;
            const res_create = await pool.query(`
                    insert into item_specs (item_id, spec_id, value) values
                    ($1, $2, $3)
                    returning *
                `, [item_id, spec_id, value]);
            
            if (res_create.rows.length == 0) {
                throw Error('cannot insert into specs');
            }
        }

        await pool.query('COMMIT');
        const hasil = result.rows[0];
        return NextResponse.json({
            success: true,
            message: "Successfully created item",
            data: hasil
        })
    } catch (error: any) {
        await pool.query('ROLLBACK');
        return NextResponse.json({
            success: false,
            message: error.message
        }, {status: 500});
    }
} 

export async function GET(req: NextRequest) {
    try {
        const searchParam = req.nextUrl.searchParams;
        const limit = searchParam.get('limit');
        let query = `
            SELECT i.*, r.review_id AS review_id, r.comment, r.rating
            FROM (
                SELECT * FROM items
                ${limit ? 'LIMIT $1' : ''}
            ) AS i
            LEFT JOIN reviews r ON i.item_id = r.item_id
        `;
        let params = [];
        if (limit) {
            params.push(limit);
        }

        const result = await pool.query(query, params);
        const itemMap = new Map();

        result.rows.forEach(row => {
            if (!itemMap.has(row.item_id)) {
                itemMap.set(row.item_id, {
                    ...row,
                    reviews: [] 
                });
                delete itemMap.get(row.item_id).review_id;
                delete itemMap.get(row.item_id).comment;
            }

            if (row.review_id) {
                itemMap.get(row.item_id).reviews.push({
                    id: row.review_id,
                    comment: row.comment,
                    rating: row.rating
                });
            }
        });

        return NextResponse.json({
            success: true,
            data: Array.from(itemMap.values())
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}