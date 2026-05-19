import { cloudinary } from "@/lib/cloudinary";

export async function uploadPicture(file: File) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64Image, {
        resource_type: "image",
        folder: "uploads",
    });

    return result.secure_url;
}