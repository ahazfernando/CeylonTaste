import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const client = new S3Client({});
const BUCKET_NAME = process.env.UPLOAD_BUCKET;

const getHeaders = () => ({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,POST"
});

export const handler = async (event) => {
    console.log("Event:", JSON.stringify(event));

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: getHeaders(), body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: getHeaders(), body: JSON.stringify({ message: "Method not allowed" }) };
    }

    try {
        const body = JSON.parse(event.body || "{}");
        const { contentType, filename } = body;

        if (!contentType) {
            return { statusCode: 400, headers: getHeaders(), body: JSON.stringify({ message: "contentType is required" }) };
        }

        const ext = filename ? filename.split('.').pop() : 'jpg';
        const key = `products/${randomUUID()}.${ext}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType,
            // Metadata: { userId: ... } // Optional: Add metadata if needed
        });

        // Generate Pre-signed URL
        const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 }); // 5 minutes

        // Construct public URL (Virtual-hosted-style access)
        // us-east-1 format: https://BUCKET.s3.amazonaws.com/KEY
        // other regions: https://BUCKET.s3.REGION.amazonaws.com/KEY
        const region = process.env.AWS_REGION;
        const publicUrl = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

        return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
                uploadUrl,
                imageUrl: publicUrl,
                key
            })
        };

    } catch (err) {
        console.error("Error:", err);
        return {
            statusCode: 500,
            headers: getHeaders(),
            body: JSON.stringify({ message: "Internal Server Error", error: err.message })
        };
    }
};
