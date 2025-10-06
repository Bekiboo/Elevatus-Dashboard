import { fail, redirect } from '@sveltejs/kit';
import { createInvitation } from '$lib/server/auth.js';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
  // Vérifier que l'utilisateur est connecté et est admin
  if (!locals.user) {
    throw redirect(302, '/login');
  }
  
  if (locals.user.role !== 'admin') {
    throw redirect(302, '/dashboard?error=access_denied');
  }
  
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    // Double vérification de l'autorisation
    if (!locals.user || locals.user.role !== 'admin') {
      return fail(403, {
        error: 'Accès non autorisé'
      });
    }

    const data = await request.formData();
    const email = data.get('email') as string;
    const role = data.get('role') as string;

    // Validation basique
    if (!email || !role) {
      return fail(400, {
        error: 'Email et rôle sont requis',
        email,
        role
      });
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return fail(400, {
        error: 'Format d\'email invalide',
        email,
        role
      });
    }

    // Validation du rôle
    const validRoles = ['admin', 'author', 'viewer'];
    if (!validRoles.includes(role)) {
      return fail(400, {
        error: 'Rôle invalide',
        email,
        role
      });
    }

    try {
      // Créer l'invitation
      const token = await createInvitation({
        email,
        role,
        invitedBy: locals.user.id
      });

      if (!token) {
        return fail(500, {
          error: 'Erreur lors de la création de l\'invitation. L\'email est peut-être déjà invité.',
          email,
          role
        });
      }

      // Générer l'URL d'invitation
      const inviteUrl = `${process.env.ORIGIN || 'http://localhost:5173'}/register?token=${token}`;

      return {
        success: true,
        inviteUrl,
        email,
        role
      };

    } catch (error) {
      console.error('Invitation error:', error);
      return fail(500, {
        error: 'Une erreur est survenue lors de la création de l\'invitation',
        email,
        role
      });
    }
  }
};