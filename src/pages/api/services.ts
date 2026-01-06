import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

const SERVICES_PATH = path.join(process.cwd(), 'src/data/services.json');

export const GET: APIRoute = async () => {
  try {
    const data = await fs.readFile(SERVICES_PATH, 'utf-8');
    return new Response(data, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to read services' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const services = await request.json();
    await fs.writeFile(SERVICES_PATH, JSON.stringify(services, null, 2), 'utf-8');
    
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

