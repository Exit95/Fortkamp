import type { APIRoute } from 'astro';
import { deleteFileByKey } from '../../../lib/s3';
import type { DeleteRequest } from '../../../lib/types';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: DeleteRequest = await request.json();
    const { key } = body;

    if (!key) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: key' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sicherheitscheck: Key muss mit dem Prefix beginnen
    const allowedPrefixes = ['galabau/uploads/', 'uploads/'];
    const isAllowed = allowedPrefixes.some(prefix => key.startsWith(prefix));

    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: 'Invalid key. Must be in uploads/ directory' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await deleteFileByKey(key);

    return new Response(
      JSON.stringify({ success: true, message: 'File deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[API] Delete error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete file' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

