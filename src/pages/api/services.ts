import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import { getJsonFromS3, saveJsonToS3, isS3Configured, getPrefix } from '../../lib/s3';

export const prerender = false;

const SERVICES_PATH = path.join(process.cwd(), 'src/data/services.json');
const getServicesKey = () => `${getPrefix()}data/services.json`;

// Lade Default-Services aus lokaler Datei
async function getDefaultServices(): Promise<any[]> {
  try {
    const data = await fs.readFile(SERVICES_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export const GET: APIRoute = async () => {
  try {
    let services: any[];

    if (isS3Configured()) {
      // Versuche aus S3 zu laden
      const defaultServices = await getDefaultServices();
      services = await getJsonFromS3(getServicesKey(), defaultServices);
    } else {
      // Fallback auf lokale Datei
      const data = await fs.readFile(SERVICES_PATH, 'utf-8');
      services = JSON.parse(data);
    }

    return new Response(JSON.stringify(services), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('GET services error:', error);
    return new Response(JSON.stringify({ error: 'Failed to read services' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const services = await request.json();

    if (isS3Configured()) {
      // Speichern in S3
      await saveJsonToS3(getServicesKey(), services);
    } else {
      // Fallback auf lokale Datei
      await fs.writeFile(SERVICES_PATH, JSON.stringify(services, null, 2), 'utf-8');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Save error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save services' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

