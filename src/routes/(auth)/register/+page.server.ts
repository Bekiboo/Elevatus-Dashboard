import { fail, redirect } from '@sveltejs/kit';
import { createUser, validateInvitationToken, markInvitationAsUsed, generateToken } from '$lib/server/auth.js';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals, url }) => {
  // If user is already logged in, redirect to dashboard
  if (locals.user) {
    throw redirect(302, '/dashboard');
  }
  
  const token = url.searchParams.get('token');
  
  if (!token) {
    throw redirect(302, '/login');
  }
  
  // Validate invitation token
  const invitation = await validateInvitationToken(token);
  
  if (!invitation) {
    throw redirect(302, '/login?error=invitation_invalid');
  }
  
  return {
    email: invitation.email,
    role: invitation.role,
    token
  };
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const confirmPassword = data.get('confirmPassword') as string;
    const firstName = data.get('firstName') as string;
    const lastName = data.get('lastName') as string;
    const title = data.get('title') as string;
    const token = data.get('token') as string;

    // Basic validation
    if (!email || !password || !confirmPassword || !firstName || !lastName || !token) {
      return fail(400, {
        error: 'All required fields must be filled',
        firstName,
        lastName,
        title,
        email
      });
    }

    // Check that passwords match
    if (password !== confirmPassword) {
      return fail(400, {
        error: 'Passwords do not match',
        firstName,
        lastName,
        title,
        email
      });
    }

    // Password validation
    if (password.length < 8) {
      return fail(400, {
        error: 'Password must contain at least 8 characters',
        firstName,
        lastName,
        title,
        email
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return fail(400, {
        error: 'Invalid email format',
        firstName,
        lastName,
        title,
        email
      });
    }

    try {
      // Revalidate invitation token
      const invitation = await validateInvitationToken(token);
      
      if (!invitation) {
        return fail(400, {
          error: 'Invalid or expired invitation token',
          firstName,
          lastName,
          title,
          email
        });
      }

      // Check that email matches
      if (invitation.email !== email) {
        return fail(400, {
          error: 'Email does not match the invitation',
          firstName,
          lastName,
          title,
          email
        });
      }

      // Create user
      const user = await createUser({
        email,
        password,
        firstName,
        lastName,
        title: title || undefined,
        role: invitation.role
      });

      if (!user) {
        return fail(500, {
          error: 'Error creating account. Email may already be in use.',
          firstName,
          lastName,
          title,
          email
        });
      }

      // Mark invitation as used
      await markInvitationAsUsed(token);

      // Log user in automatically
      const authToken = generateToken(user);
      cookies.set('auth_token', authToken, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
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
      
      console.error('Registration error:', error);
      return fail(500, {
        error: 'An error occurred while creating the account',
        firstName,
        lastName,
        title,
        email
      });
    }
  }
};