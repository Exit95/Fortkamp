import { getJsonFromS3, isS3Configured, getPrefix } from './s3';
import { readFileSync } from 'fs';
import { join } from 'path';

// Dynamischer Pfad basierend auf S3_PREFIX
const getServicesKey = () => `${getPrefix()}data/services.json`;
const getProjectsKey = () => `${getPrefix()}data/projects.json`;

// Lokale JSON-Daten laden
function loadLocalJson(filename: string): any[] {
  try {
    // Versuche verschiedene Pfade
    const paths = [
      join(process.cwd(), 'src', 'data', filename),
      join(process.cwd(), 'data', filename),
      join('/app', 'src', 'data', filename),
    ];

    for (const path of paths) {
      try {
        const data = readFileSync(path, 'utf-8');
        console.log(`[Data] Loaded local ${filename} from ${path}`);
        return JSON.parse(data);
      } catch {
        // Nächsten Pfad versuchen
      }
    }
    console.warn(`[Data] Could not find local ${filename}`);
    return [];
  } catch (error) {
    console.error(`[Data] Error loading local ${filename}:`, error);
    return [];
  }
}

// Services laden (S3 mit lokalem Fallback)
export async function getServices(): Promise<any[]> {
  try {
    if (isS3Configured()) {
      const key = getServicesKey();
      console.log('[Data] Loading services from S3:', key);
      return await getJsonFromS3(key, []);
    } else {
      console.log('[Data] S3 not configured, using local services.json');
      return loadLocalJson('services.json');
    }
  } catch (error) {
    console.error('Error loading services from S3, using local fallback:', error);
    return loadLocalJson('services.json');
  }
}

// Projects laden (S3 mit lokalem Fallback)
export async function getProjects(): Promise<any[]> {
  try {
    if (isS3Configured()) {
      const key = getProjectsKey();
      console.log('[Data] Loading projects from S3:', key);
      return await getJsonFromS3(key, []);
    } else {
      console.log('[Data] S3 not configured, using local projects.json');
      return loadLocalJson('projects.json');
    }
  } catch (error) {
    console.error('Error loading projects from S3, using local fallback:', error);
    return loadLocalJson('projects.json');
  }
}

