import fs from 'fs/promises';
import path from 'path';
import { getJsonFromS3, isS3Configured } from './s3';

const SERVICES_PATH = path.join(process.cwd(), 'src/data/services.json');
const PROJECTS_PATH = path.join(process.cwd(), 'src/data/projects.json');
const S3_SERVICES_KEY = 'galabau/data/services.json';
const S3_PROJECTS_KEY = 'galabau/data/projects.json';

// Lade Default-Services aus lokaler Datei
async function getDefaultServices(): Promise<any[]> {
  try {
    const data = await fs.readFile(SERVICES_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Lade Default-Projekte aus lokaler Datei
async function getDefaultProjects(): Promise<any[]> {
  try {
    const data = await fs.readFile(PROJECTS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Services laden (aus S3 wenn konfiguriert, sonst lokal)
export async function getServices(): Promise<any[]> {
  try {
    if (isS3Configured()) {
      const defaultServices = await getDefaultServices();
      return await getJsonFromS3(S3_SERVICES_KEY, defaultServices);
    } else {
      return await getDefaultServices();
    }
  } catch (error) {
    console.error('Error loading services:', error);
    return await getDefaultServices();
  }
}

// Projects laden (aus S3 wenn konfiguriert, sonst lokal)
export async function getProjects(): Promise<any[]> {
  try {
    if (isS3Configured()) {
      const defaultProjects = await getDefaultProjects();
      return await getJsonFromS3(S3_PROJECTS_KEY, defaultProjects);
    } else {
      return await getDefaultProjects();
    }
  } catch (error) {
    console.error('Error loading projects:', error);
    return await getDefaultProjects();
  }
}

