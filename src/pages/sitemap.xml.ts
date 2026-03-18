import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return Response.redirect('https://futbolexperto.com/sitemap-index.xml', 301);
};
