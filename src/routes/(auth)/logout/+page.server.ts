import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
  // La page logout sera traitée uniquement par action POST
  throw redirect(302, '/');
};

export const actions: Actions = {
  default: async ({ cookies }) => {
    // Delete authentication cookie
    cookies.delete('auth_token', { path: '/' });
    
    // Redirect to login page
    throw redirect(302, '/login?message=logged_out');
  }
};