import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import { getJsonFromS3, saveJsonToS3, isS3Configured } from '../../lib/s3';

export const prerender = false;

const PROJECTS_PATH = path.join(process.cwd(), 'src/data/projects.json');
const S3_PROJECTS_KEY = 'galabau/data/projects.json';

// Lade Default-Projekte aus lokaler Datei
async function getDefaultProjects(): Promise<any[]> {
  try {
    const data = await fs.readFile(PROJECTS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export const GET: APIRoute = async () => {
  try {
    let projects: any[];

    if (isS3Configured()) {
      // Versuche aus S3 zu laden
      const defaultProjects = await getDefaultProjects();
      projects = await getJsonFromS3(S3_PROJECTS_KEY, defaultProjects);
    } else {
      // Fallback auf lokale Datei
      const data = await fs.readFile(PROJECTS_PATH, 'utf-8');
      projects = JSON.parse(data);
    }

    return new Response(JSON.stringify(projects), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('GET projects error:', error);
    return new Response(JSON.stringify({ error: 'Failed to read projects' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const projects = await request.json();

    if (isS3Configured()) {
      // Speichern in S3
      await saveJsonToS3(S3_PROJECTS_KEY, projects);
    } else {
      // Fallback auf lokale Datei
      await fs.writeFile(PROJECTS_PATH, JSON.stringify(projects, null, 2), 'utf-8');
    }

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

