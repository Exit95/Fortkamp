import type { APIRoute } from 'astro';
import busboy from 'busboy';
import { uploadToS3Direct } from '../../../lib/s3';

export const prerender = false;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Session-Prüfung
async function checkAuth(context: any): Promise<boolean> {
  const session = await context.session?.get('user');
  return !!session;
}

export const POST: APIRoute = async (context) => {
  if (!await checkAuth(context)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Promise((resolve) => {
    const contentType = context.request.headers.get('content-type') || '';

    const bb = busboy({
      headers: {
        'content-type': contentType
      },
      limits: {
        fileSize: MAX_FILE_SIZE
      }
    });

    let filename: string | null = null;
    let category: string | null = null;
    let type: string | null = null;
    const chunks: { index: number; buffer: Buffer }[] = [];

    // 1. Metadaten sammeln
    bb.on('field', (fieldname, val) => {
      if (fieldname === 'filename') {
        filename = val;
      } else if (fieldname === 'category') {
        category = val;
      } else if (fieldname === 'type') {
        type = val;
      }
    });

    // 2. Chunks sammeln
    bb.on('file', (fieldname, file) => {
      const match = fieldname.match(/^chunk_(\d+)$/);
      if (!match) {
        file.resume();
        return;
      }

      const chunkIndex = parseInt(match[1], 10);
      const buffers: Buffer[] = [];

      file.on('data', (data: Buffer) => {
        buffers.push(data);
      });

      file.on('end', () => {
        const chunkBuffer = Buffer.concat(buffers);
        chunks.push({ index: chunkIndex, buffer: chunkBuffer });
      });

      file.on('error', (err) => {
        console.error('File stream error:', err);
        resolve(new Response(JSON.stringify({ error: 'Upload failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }));
      });
    });

    // 3. Alle Chunks verarbeitet
    bb.on('finish', async () => {
      try {
        if (!filename) {
          resolve(new Response(JSON.stringify({ error: 'Missing filename' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }));
          return;
        }

        if (chunks.length === 0) {
          resolve(new Response(JSON.stringify({ error: 'No chunks received' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }));
          return;
        }

        // Chunks sortieren und zusammenfügen
        chunks.sort((a, b) => a.index - b.index);
        const finalBuffer = Buffer.concat(chunks.map(c => c.buffer));

        // S3 Key generieren
        const s3Key = type && category
          ? `${type}/${category}/${filename}`
          : `uploads/${filename}`;

        // Content-Type ermitteln
        const ext = filename.split('.').pop()?.toLowerCase();
        const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
          : ext === 'png' ? 'image/png'
          : ext === 'webp' ? 'image/webp'
          : 'application/octet-stream';

        if (!ALLOWED_TYPES.includes(mimeType)) {
          resolve(new Response(JSON.stringify({ error: 'Invalid file type' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }));
          return;
        }

        // Upload zu S3
        const publicUrl = await uploadToS3Direct(finalBuffer, s3Key, mimeType);

        console.log(`Upload complete: ${filename} → ${s3Key} (${finalBuffer.length} bytes, ${chunks.length} chunks)`);

        resolve(new Response(JSON.stringify({
          success: true,
          url: publicUrl,
          key: s3Key,
          filename: filename,
          size: finalBuffer.length
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));

      } catch (error) {
        console.error('Upload error:', error);
        resolve(new Response(JSON.stringify({ error: 'Upload failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }));
      }
    });

    bb.on('error', (err: any) => {
      console.error('Busboy error:', err);
      resolve(new Response(JSON.stringify({ error: 'Upload failed: ' + (err?.message || 'Unknown error') }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }));
    });

    // Request-Body an Busboy pipen
    context.request.body?.pipeTo(new WritableStream({
      write(chunk) {
        bb.write(chunk);
      },
      close() {
        bb.end();
      },
      abort(err) {
        console.error('Stream aborted:', err);
        bb.destroy();
      }
    }));
  });
};

