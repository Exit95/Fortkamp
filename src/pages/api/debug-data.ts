import type { APIRoute } from 'astro';
import { getServices, getProjects } from '../../lib/data';
import { isS3Configured } from '../../lib/s3';

export const prerender = false;

export const GET: APIRoute = async ({ session }) => {
  // Nur für eingeloggte Admins
  const user = await session?.get('user');
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const services = await getServices();
    const projects = await getProjects();

    return new Response(JSON.stringify({
      s3Configured: isS3Configured(),
      servicesCount: services.length,
      projectsCount: projects.length,
      services: services.map((s: any) => ({
        id: s.id,
        title: s.title,
        hasImage: !!s.image,
        imageUrl: s.image,
        hasImages: !!s.images,
        imagesCount: s.images?.length || 0,
        firstImageUrl: s.images?.[0]?.src
      })),
      projects: projects.map((p: any) => ({
        id: p.id,
        title: p.title,
        imagesCount: p.images?.length || 0,
        firstImageUrl: p.images?.[0]?.src
      }))
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

