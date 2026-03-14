import type { APIRoute } from 'astro';
import { pb } from '../../lib/pocketbase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, teams } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Falta el correo electrónico.' }), { status: 400 });
    }

    // Autenticarnos como admin para tener permisos sobre la colección de subscribers
    try {
      if (!pb.authStore.isValid || !pb.authStore.isAdmin) {
        await pb.admins.authWithPassword('pegaso@agentmail.to', 'WiKCaJLJqdtXD65');
      }
    } catch (authErr) {
      console.error('Error de autenticación con PocketBase:', authErr);
      return new Response(JSON.stringify({ error: 'Error interno de servidor.' }), { status: 500 });
    }

    // Verificar si el email ya existe
    try {
      const existing = await pb.collection('subscribers').getFirstListItem(`email = "${email}"`);
      if (existing) {
        return new Response(
          JSON.stringify({ error: 'Este correo ya está suscrito.' }),
          { status: 409 }
        );
      }
    } catch (e: any) {
      // 404 means not found, which is what we want — proceed to create
      if (e.status !== 404) {
        throw e;
      }
    }

    await pb.collection('subscribers').create({
      email: email,
      teams: teams || []
    });

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
}
