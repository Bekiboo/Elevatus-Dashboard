import { fail, redirect } from '@sveltejs/kit';
import { authenticateUser, generateToken } from '$lib/server/auth.js';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
  // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
  if (locals.user) {
    throw redirect(302, '/dashboard');
  }
  
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    // Validation basique
    if (!email || !password) {
      return fail(400, {
        error: 'Email et mot de passe sont requis',
        email
      });
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return fail(400, {
        error: 'Format d\'email invalide',
        email
      });
    }

    try {
      // Tenter l'authentification
      const user = await authenticateUser(email, password);

      if (!user) {
        return fail(400, {
          error: 'Email ou mot de passe incorrect',
          email
        });
      }

      // Vérifier si l'utilisateur est vérifié
      if (!user.verified) {
        return fail(400, {
          error: 'Votre compte n\'est pas encore vérifié. Contactez un administrateur.',
          email
        });
      }

      // Définir le cookie d'authentification
      const token = generateToken(user);
      cookies.set('auth_token', token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 jours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      // Rediriger vers le dashboard
      throw redirect(302, '/dashboard');

    } catch (error) {
      // Si c'est une redirection, la relancer
      if (error && typeof error === 'object' && 'status' in error && error.status === 302) {
        throw error;
      }
      
      console.error('Login error:', error);
      return fail(500, {
        error: 'Une erreur est survenue lors de la connexion',
        email
      });
    }
  }
};