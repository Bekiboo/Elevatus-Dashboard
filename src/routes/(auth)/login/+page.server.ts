import { fail, redirect } from '@sveltejs/kit';
import { authenticateUser, generateToken } from '$lib/server/auth.js';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
  // If user is already logged in, redirect to dashboard
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

    // Basic validation
    if (!email || !password) {
      return fail(400, {
        error: 'Email and password are required',
        email
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return fail(400, {
        error: 'Invalid email format',
        email
      });
    }

    try {
      // Attempt authentication
      const user = await authenticateUser(email, password);

      if (!user) {
        return fail(400, {
          error: 'Incorrect email or password',
          email
        });
      }

      // Check if user is verified
      if (!user.verified) {
        return fail(400, {
          error: 'Your account is not yet verified. Please contact an administrator.',
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

      // Redirect to dashboard
      throw redirect(302, '/dashboard');

    } catch (error) {
      // If it's a redirect, re-throw it
      if (error && typeof error === 'object' && 'status' in error && error.status === 302) {
        throw error;
      }
      
      console.error('Login error:', error);
      return fail(500, {
        error: 'An error occurred during login',
        email
      });
    }
  }
};