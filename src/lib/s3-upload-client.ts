/**
 * Client-side product image upload via S3.
 * Calls the truetaste-getUploadUrl Lambda to get a pre-signed URL, then PUTs the file.
 */

const GET_UPLOAD_URL = process.env.NEXT_PUBLIC_GET_UPLOAD_URL?.trim() || '';

export interface GetUploadUrlResponse {
  uploadUrl: string;
  imageUrl: string;
}

/**
 * Request a pre-signed upload URL from the Lambda, then upload the file to S3.
 * Returns the public image URL to store on the product.
 */
export async function uploadImageToS3(file: File): Promise<string> {
  if (!GET_UPLOAD_URL) {
    throw new Error('NEXT_PUBLIC_GET_UPLOAD_URL is not set. Configure your Lambda getUploadUrl URL.');
  }

  let res;
  try {
    res = await fetch(GET_UPLOAD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    });
  } catch (err) {
    throw new Error(`Connection to Upload Lambda failed: ${err instanceof Error ? err.message : 'Unknown Network Error'}`);
  }

  if (!res.ok) {
    const text = await res.text();
    let message = `Failed to get upload URL (${res.status})`;
    try {
      const json = JSON.parse(text);
      message = json.message ?? json.error ?? message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  const data = (await res.json()) as GetUploadUrlResponse;
  const { uploadUrl, imageUrl } = data;
  if (!uploadUrl) {
    throw new Error('Invalid response: missing uploadUrl');
  }

  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!putRes.ok) {
    throw new Error(`Upload to S3 failed (${putRes.status}). Check bucket CORS and permissions.`);
  }

  // Lambda may return imageUrl; if not, the upload URL without query params is often the object URL
  return imageUrl || uploadUrl.split('?')[0];
}
