import { prisma } from '@/lib/prisma';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  let listings: Array<{ id: string; updatedAt: Date }> = [];
  try {
    listings = await prisma.listing.findMany({
      where: { status: 'AVAILABLE' },
      select: { id: true, updatedAt: true },
      take: 1000,
    });
  } catch {
    // DB might not be available during build
  }

  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/listings', priority: '0.9', changefreq: 'hourly' },
    { url: '/auth/login', priority: '0.5', changefreq: 'monthly' },
    { url: '/auth/register', priority: '0.5', changefreq: 'monthly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
  ${listings.map(listing => `
  <url>
    <loc>${baseUrl}/listings/${listing.id}</loc>
    <lastmod>${listing.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
