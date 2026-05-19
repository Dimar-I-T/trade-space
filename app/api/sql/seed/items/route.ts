import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db/config";

export async function GET(req: NextRequest) {
    try {
        await pool.query('BEGIN');
        const user_id = '3746759d-9b94-44ba-b89e-2e33a3451800';
        const JUMLAH_DATA: number = 10;
        for (let x: number = 0; x < JUMLAH_DATA; x++) {
            const name = `Dummy Product Edisi ${x}`;
            const description = `Ini adalah deskripsi produk ${x}`;
            const category = 'Laptop';
            const price = 10_000_000 + Math.floor(Math.random() * 5_000_000);
            const stock = 1 + Math.floor(Math.random() * 5);
            const condition = 'Baru';
            const result0 = await pool.query(`
                    insert into items (user_id, name, description, category, price, stock, condition) values
                    ($1, $2, $3, $4, $5, $6, $7)
                    returning *
                `, [user_id, name, description, category, price, stock, condition]);

            if (result0.rows.length == 0) {
                throw Error('Error saat insert into items');
            }

            const item_id = result0.rows[0].item_id;
            const specs = {
                brand: "ASUS",
                ram: "16GB"
            };

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

            const BANYAK_KOMEN: number = 1 + Math.floor(Math.random() * 5);

            for (let y: number = 0; y < BANYAK_KOMEN; y++) {
                const rating = 1 + Math.floor(Math.random() * 5);
                const comment = `Ini komen ke-${y} untuk produk ${x}`;
                const result1 = await pool.query(`
                    insert into reviews (user_id, item_id, rating, comment) values
                    ($1, $2, $3, $4)
                    returning *
                `, [user_id, item_id, rating, comment]);

                if (result1.rows.length == 0) {
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
            }
        }

        await pool.query('COMMIT');
        return NextResponse.json({
            success: true,
            message: "Successfully created 200 items and its reviews"
        });
    } catch (error: any) {
        await pool.query('ROLLBACK');
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}