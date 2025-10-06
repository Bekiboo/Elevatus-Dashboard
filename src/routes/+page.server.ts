import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
  // Si l'utilisateur est connecté, rediriger vers le dashboard
  if (locals.user) {
    throw redirect(302, '/dashboard');
  }
  
  // Sinon, rediriger vers la page de connexion
  throw redirect(302, '/login');
};

export const actions: Actions = {
  logout: async ({ cookies }) => {
    // Supprimer le cookie d'authentification
    cookies.delete('auth_token', { path: '/' });
    
    // Rediriger vers la page de connexion
    throw redirect(302, '/login?message=logged_out');
  }
};