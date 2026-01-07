import type { APIRoute } from 'astro';
import { getPresignedUploadUrl } from '../../../lib/s3';
import type { PresignRequest, PresignResponse } from '../../../lib/types';

export const prerender = false;

// Erlaubte Dateitypen
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export const POST: APIRoute = async (context) => {
  try {
    // Session-Prüfung
    const session = await context.session?.get('user');
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Please login first' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body: PresignRequest = await context.request.json();
    const { type, slugOrId, filename, contentType } = body;

    // Validierung
    if (!type || !slugOrId || !filename || !contentType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, slugOrId, filename, contentType' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return new Response(
        JSON.stringify({ error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!['service', 'project', 'general'].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid type. Must be: service, project, or general' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Presigned URL generieren
    const result = await getPresignedUploadUrl(type, slugOrId, filename, contentType);

    const response: PresignResponse = {
      uploadUrl: result.uploadUrl,
      publicUrl: result.publicUrl,
      key: result.key,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[API] Presign error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate upload URL' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

