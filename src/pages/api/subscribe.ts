import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';

export const prerender = false;

const PB_URL = import.meta.env.POCKETBASE_URL || import.meta.env.PUBLIC_POCKETBASE_URL || 'https://futbolxp.pockethost.io';
const PB_EMAIL = import.meta.env.POCKETBASE_EMAIL;
const PB_PASSWORD = import.meta.env.POCKETBASE_PASSWORD;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, teams } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Falta el correo electrónico.' }), { status: 400 });
    }

    if (!PB_EMAIL || !PB_PASSWORD) {
      console.error('Missing PocketBase superuser credentials for subscribe API.');
      return new Response(JSON.stringify({ error: 'Servicio no configurado.' }), { status: 500 });
    }

    const pb = new PocketBase(PB_URL);
    pb.autoCancellation(false);

    try {
      if (!pb.authStore.isValid || !pb.authStore.isSuperuser) {
        await pb.collection('_superusers').authWithPassword(PB_EMAIL, PB_PASSWORD);
      }
    } catch (authErr) {
      console.error('Error de autenticación con PocketBase:', authErr);
      return new Response(JSON.stringify({ error: 'Error interno de servidor.' }), { status: 500 });
    }

    try {
      const existing = await pb.collection('subscribers').getFirstListItem(`email = "${email}"`);
      if (existing) {
        return new Response(
          JSON.stringify({ error: 'Este correo ya está suscrito.' }),
          { status: 409 }
        );
      }
    } catch (e: any) {
      if (e.status !== 404) {
        throw e;
      }
    }

    await pb.collection('subscribers').create({
      email,
      teams: teams || [],
    });

    pb.authStore.clear();

    return new Response(
      JSON.stringify({ success: true, message: '¡Suscripción exitosa!' }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Error al guardar en PocketBase:', err);
    return new Response(
      JSON.stringify({ error: 'Hubo un error al suscribirte. Inténtalo de nuevo.' }),
      { status: 500 }
    );
  }
};
