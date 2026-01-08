import { getJsonFromS3, isS3Configured, getPrefix } from './s3';
import servicesData from '../data/services.json';
import projectsData from '../data/projects.json';

// Dynamischer Pfad basierend auf S3_PREFIX
const getServicesKey = () => `${getPrefix()}data/services.json`;
const getProjectsKey = () => `${getPrefix()}data/projects.json`;

// Services laden (S3 mit lokalem Fallback)
export async function getServices(): Promise<any[]> {
  try {
    if (isS3Configured()) {
      const key = getServicesKey();
      console.log('[Data] Loading services from S3:', key);
      return await getJsonFromS3(key, []);
    } else {
      console.log('[Data] S3 not configured, using local services.json');
      return servicesData as any[];
    }
  } catch (error) {
    console.error('Error loading services from S3, using local fallback:', error);
    return servicesData as any[];
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
      return projectsData as any[];
    }
  } catch (error) {
    console.error('Error loading projects from S3, using local fallback:', error);
    return projectsData as any[];
  }
}

