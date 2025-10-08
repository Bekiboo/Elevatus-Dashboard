import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
  // If user is logged in, redirect to dashboard
  if (locals.user) {
    throw redirect(302, '/dashboard');
  }
  
  // Otherwise, redirect to login page
  throw redirect(302, '/login');
};

export const actions: Actions = {
  logout: async ({ cookies }) => {
    // Delete authentication cookie
    cookies.delete('auth_token', { path: '/' });
    
    // Redirect to login page
    throw redirect(302, '/login?message=logged_out');
  }
};