// Service Categories (Fix-Liste)
export const SERVICE_CATEGORIES = [
  'Neugestaltung',
  'Umgestaltung',
  'Pflasterarbeiten',
  'Natursteinarbeiten',
  'Pflegearbeiten',
  'Heckenschnitt',
  'Baggervermietung',
] as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[number];

// Image Type
export interface GalleryImage {
  url: string;
  key: string;
  alt: string;
  order: number;
}

// Service Type
export interface Service {
  id: string;
  slug: string;
  title: ServiceCategory;
  shortDescription: string;
  icon?: string;
  images: GalleryImage[];
  features?: string[];
  order: number;
}

// Project Type
export interface Project {
  id: string;
  slug: string;
  title: string;
  client?: string;
  clientType?: 'private' | 'commercial' | 'property-management';
  location?: string;
  completedAt?: string;
  duration?: string;
  summary: string;
  services: string[]; // Service IDs
  tags: ServiceCategory[];
  images: GalleryImage[];
  featured: boolean;
}

// Upload Types
export type UploadType = 'service' | 'project' | 'general';

export interface PresignRequest {
  type: UploadType;
  slugOrId: string;
  filename: string;
  contentType: string;
}

export interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export interface DeleteRequest {
  key: string;
}

