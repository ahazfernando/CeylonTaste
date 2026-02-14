
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const getUploadUrl = process.env.NEXT_PUBLIC_GET_UPLOAD_URL;
        if (!getUploadUrl) {
            return NextResponse.json(
                { error: 'NEXT_PUBLIC_GET_UPLOAD_URL is not set' },
                { status: 500 }
            );
        }

        // 1. Get the signed URL from AWS Lambda
        // We send JSON as expected by the Lambda
        const lambdaResponse = await fetch(getUploadUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: file.name,
                contentType: file.type,
                bucket: 'truetaste-backend-uploadsbucket-nq0otqizpnj7',
                keyPrefix: 'products/',
            }),
        });

        if (!lambdaResponse.ok) {
            const text = await lambdaResponse.text();
            return NextResponse.json(
                { error: `Lambda Error: ${lambdaResponse.status} ${text}` },
                { status: lambdaResponse.status }
            );
        }

        const { uploadUrl, imageUrl } = await lambdaResponse.json();
        if (!uploadUrl) {
            return NextResponse.json(
                { error: 'Invalid response from Lambda: missing uploadUrl' },
                { status: 502 }
            );
        }

        // 2. Upload the file content to S3 using the signed URL
        // We need to convert the File to an ArrayBuffer/Buffer for the fetch body
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const s3Response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
            },
            body: buffer,
        });

        if (!s3Response.ok) {
            return NextResponse.json(
                { error: `S3 Upload Error: ${s3Response.status}` },
                { status: s3Response.status }
            );
        }

        // 3. Return the public image URL
        // Fallback: strip query params if imageUrl isn't provided
        const finalUrl = imageUrl || uploadUrl.split('?')[0];

        return NextResponse.json({ imageUrl: finalUrl });

    } catch (error) {
        console.error('Proxy upload error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
