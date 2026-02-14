
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const getUploadUrl = process.env.NEXT_PUBLIC_GET_UPLOAD_URL;

    if (!getUploadUrl) {
        return NextResponse.json(
            { error: 'NEXT_PUBLIC_GET_UPLOAD_URL is not set' },
            { status: 500 }
        );
    }

    try {
        const response = await fetch(getUploadUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...body,
                bucket: 'truetaste-backend-uploadsbucket-nq0otqizpnj7',
                keyPrefix: 'products/',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Lambda Error: ${response.status} ${errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
