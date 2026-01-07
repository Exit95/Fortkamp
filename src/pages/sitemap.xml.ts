import type { APIRoute } from 'astro';
import { getServices, getProjects } from '../lib/data';

const SITE_URL = 'https://galabau-fortkamp.de';

export const GET: APIRoute = async () => {
  const services = await getServices();
  const projects = await getProjects();

  const today = new Date().toISOString().split('T')[0];

  // Static pages with priorities
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/leistungen/', priority: '0.9', changefreq: 'weekly' },
    { url: '/projekte/', priority: '0.9', changefreq: 'weekly' },
    { url: '/kontakt/', priority: '0.8', changefreq: 'monthly' },
    { url: '/impressum/', priority: '0.3', changefreq: 'yearly' },
    { url: '/datenschutz/', priority: '0.3', changefreq: 'yearly' },
  ];

  // Service pages
  const servicePages = services.map((service: any) => ({
    url: `/leistungen/${service.slug}/`,
    priority: '0.8',
    changefreq: 'weekly'
  }));

  // Project pages
  const projectPages = projects.map((project: any) => ({
    url: `/projekte/${project.slug}/`,
    priority: '0.7',
    changefreq: 'monthly'
  }));

  const allPages = [...staticPages, ...servicePages, ...projectPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allPages.map(page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};

