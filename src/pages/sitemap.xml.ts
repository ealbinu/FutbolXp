import type { APIRoute } from 'astro';

const BASE_URL = 'https://futbolexperto.com';

const routes = [
  '/',
  '/analista/',
  '/analista/comparar/',
  '/jugadores/',
  '/noticias/',
  '/partidos/',
];

export const GET: APIRoute = async () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${routes.map((route) => `  <url>\n    <loc>${BASE_URL}${route}</loc>\n  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
