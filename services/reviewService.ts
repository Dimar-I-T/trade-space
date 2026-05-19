import dbConnect from "@/lib/mongodb";
import Item from "@/models/Item";

export async function createReview(user_id: string, item_id: string, rating: string, comment: string) {
    try {   
        await dbConnect();
        const ratingNum = Number(rating);
        const newReview = {
            from_user: user_id,
            rating: ratingNum,
            comment: comment
        };

        const item = await Item.findById(item_id);
        if (!item) {
            throw Error('Item not found');
        }

        item.reviews.push(newReview);
        const totalRating = item.reviews.reduce((acc: any, curr: any) => acc + curr.rating, 0);
        item.average_rating = totalRating / item.reviews.length;
        await item.save();
        return item.reviews[item.reviews.length - 1];
    } catch (error: any) {
        throw error.message;
    }
}

export async function deleteReviewById(user_id: string, review_id: string, item_id: string) {
    try {
        const item = await Item.findById(item_id);
        if (!item) {
            throw Error('Item not found');
        }

        const review = item.reviews.id(review_id);
        if (!review) {
            throw Error('review tidak ada');
        }

        if (review.from_user.toString() !== user_id && item.seller_id.toString() !== user_id) {
            throw Error('Kamu tidak bisa menghapus review orang lain');
        }

        item.reviews.pull({_id: review_id});
        if (item.reviews.length > 0) {
            const totalRating = item.reviews.reduce((acc: any, curr: any) => acc + curr.rating, 0);
            item.average_rating = totalRating / item.reviews.length;
        } else {
            item.average_rating = 0; 
        }

        await item.save();
        return review;
    } catch (error: any) {
        throw error.message;
    }
}