import type { APIRoute } from 'astro';
import { uploadToS3Direct } from '../../lib/s3';

export const prerender = false;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const POST: APIRoute = async (context) => {
  try {
    // Session-Prüfung
    const session = await context.session?.get('user');
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await context.request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';
    const category = formData.get('category') as string || 'general';

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ error: 'File too large (max 50MB)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Invalid file type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // File zu Buffer konvertieren
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // S3 Key generieren
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const sanitizedName = file.name.replace(/[^a-z0-9.]/gi, '-').toLowerCase();
    const filename = `${timestamp}_${random}_${sanitizedName}`;
    const s3Key = `${type}/${category}/${filename}`;

    // Upload zu S3
    const publicUrl = await uploadToS3Direct(buffer, s3Key, file.type);

    console.log(`Upload complete: ${file.name} → ${s3Key} (${buffer.length} bytes)`);

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      key: s3Key,
      filename: file.name,
      size: buffer.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

