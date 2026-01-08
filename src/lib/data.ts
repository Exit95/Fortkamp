import { getJsonFromS3, isS3Configured, getPrefix } from './s3';

// Dynamischer Pfad basierend auf S3_PREFIX
const getServicesKey = () => `${getPrefix()}data/services.json`;
const getProjectsKey = () => `${getPrefix()}data/projects.json`;

// Services laden (immer aus S3 - keine lokalen Fallback-Dateien mehr)
export async function getServices(): Promise<any[]> {
  try {
    if (isS3Configured()) {
      const key = getServicesKey();
      console.log('[Data] Loading services from:', key);
      return await getJsonFromS3(key, []);
    } else {
      console.warn('[Data] S3 not configured, returning empty services');
      return [];
    }
  } catch (error) {
    console.error('Error loading services:', error);
    return [];
  }
}

// Projects laden (immer aus S3 - keine lokalen Fallback-Dateien mehr)
export async function getProjects(): Promise<any[]> {
  try {
    if (isS3Configured()) {
      const key = getProjectsKey();
      console.log('[Data] Loading projects from:', key);
      return await getJsonFromS3(key, []);
    } else {
      console.warn('[Data] S3 not configured, returning empty projects');
      return [];
    }
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
}

