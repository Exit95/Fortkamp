import type { APIRoute } from 'astro';
import { getPresignedUploadUrl } from '../../../lib/s3';

export const prerender = false;

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Session-Prüfung
async function checkAuth(context: any): Promise<boolean> {
  const session = await context.session?.get('user');
  return !!session;
}

interface PresignRequest {
  type: 'service' | 'project' | 'general';
  slugOrId: string;
  filename: string;
  contentType: string;
}

export const POST: APIRoute = async (context) => {
  try {
    console.log('[Presign] Request received');

    // Session-Prüfung
    if (!await checkAuth(context)) {
      console.log('[Presign] Unauthorized - no session');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // JSON-Body parsen
    const body: PresignRequest = await context.request.json();
    const { type, slugOrId, filename, contentType } = body;

    console.log('[Presign] Request data:', { type, slugOrId, filename, contentType });

    // Validierung
    if (!filename) {
      return new Response(JSON.stringify({ error: 'Missing filename' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!contentType) {
      return new Response(JSON.stringify({ error: 'Missing contentType' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Allowed: JPG, PNG, WebP' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Presigned URL generieren
    const uploadType = type || 'general';
    const slug = slugOrId || 'general';

    const result = await getPresignedUploadUrl(uploadType, slug, filename, contentType);

    console.log('[Presign] Generated presigned URL:', {
      key: result.key,
      publicUrl: result.publicUrl
    });

    return new Response(JSON.stringify({
      uploadUrl: result.uploadUrl,
      publicUrl: result.publicUrl,
      key: result.key
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Presign] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Failed to generate presigned URL'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

