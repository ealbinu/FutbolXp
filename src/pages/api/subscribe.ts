import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get env - works both locally (import.meta.env) and on CF Workers (locals.runtime.env)
    const runtime = (locals as any)?.runtime;
    const env: Record<string, string | undefined> = runtime?.env ?? (import.meta.env as any);

    const PB_URL: string = env.POCKETBASE_URL ?? env.PUBLIC_POCKETBASE_URL ?? 'https://futbolxp.pockethost.io';
    const PB_EMAIL: string | undefined = env.POCKETBASE_EMAIL;
    const PB_PASSWORD: string | undefined = env.POCKETBASE_PASSWORD;

    if (!PB_EMAIL || !PB_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Servicio no configurado.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { email, teams } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Falta el correo electrónico.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Authenticate as superuser via REST API
    const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: PB_EMAIL, password: PB_PASSWORD }),
    });

    if (!authRes.ok) {
      const authErr = await authRes.text();
      console.error('PocketBase auth failed:', authRes.status, authErr);
      return new Response(JSON.stringify({ error: 'Error interno de servidor.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { token } = await authRes.json();

    // 2. Check if email already exists
    const checkRes = await fetch(
      `${PB_URL}/api/collections/subscribers/records?filter=${encodeURIComponent(`email="${email}"`)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (checkRes.ok) {
      const checkData = await checkRes.json();
      if (checkData.totalItems > 0) {
        return new Response(JSON.stringify({ error: 'Este correo ya está suscrito.' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 3. Create subscriber
    const createRes = await fetch(`${PB_URL}/api/collections/subscribers/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, teams: teams ?? [] }),
    });

    if (!createRes.ok) {
      const createErr = await createRes.text();
      console.error('PocketBase create failed:', createRes.status, createErr);
      return new Response(JSON.stringify({ error: 'Hubo un error al suscribirte. Inténtalo de nuevo.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, message: '¡Suscripción exitosa!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Unexpected error in /api/subscribe:', err);
    return new Response(JSON.stringify({ error: 'Hubo un error al suscribirte. Inténtalo de nuevo.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
