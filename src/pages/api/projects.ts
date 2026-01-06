import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

const PROJECTS_PATH = path.join(process.cwd(), 'src/data/projects.json');

export const GET: APIRoute = async () => {
  try {
    const data = await fs.readFile(PROJECTS_PATH, 'utf-8');
    return new Response(data, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to read projects' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const projects = await request.json();
    await fs.writeFile(PROJECTS_PATH, JSON.stringify(projects, null, 2), 'utf-8');
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Save error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save projects' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

