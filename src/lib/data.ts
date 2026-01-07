import { getJsonFromS3, isS3Configured } from './s3';

const S3_SERVICES_KEY = 'galabau/data/services.json';
const S3_PROJECTS_KEY = 'galabau/data/projects.json';

// Services laden (immer aus S3 - keine lokalen Fallback-Dateien mehr)
export async function getServices(): Promise<any[]> {
  try {
    if (isS3Configured()) {
      return await getJsonFromS3(S3_SERVICES_KEY, []);
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
      return await getJsonFromS3(S3_PROJECTS_KEY, []);
    } else {
      console.warn('[Data] S3 not configured, returning empty projects');
      return [];
    }
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
}

