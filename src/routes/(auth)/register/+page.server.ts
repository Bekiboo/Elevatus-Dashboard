import { fail, redirect } from '@sveltejs/kit';
import { createUser, validateInvitationToken, markInvitationAsUsed, generateToken } from '$lib/server/auth.js';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals, url }) => {
  // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
  if (locals.user) {
    throw redirect(302, '/dashboard');
  }
  
  const token = url.searchParams.get('token');
  
  if (!token) {
    throw redirect(302, '/login');
  }
  
  // Valider le token d'invitation
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

    // Validation basique
    if (!email || !password || !confirmPassword || !firstName || !lastName || !token) {
      return fail(400, {
        error: 'Tous les champs requis doivent être remplis',
        firstName,
        lastName,
        title,
        email
      });
    }

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      return fail(400, {
        error: 'Les mots de passe ne correspondent pas',
        firstName,
        lastName,
        title,
        email
      });
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return fail(400, {
        error: 'Le mot de passe doit contenir au moins 8 caractères',
        firstName,
        lastName,
        title,
        email
      });
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return fail(400, {
        error: 'Format d\'email invalide',
        firstName,
        lastName,
        title,
        email
      });
    }

    try {
      // Revalider le token d'invitation
      const invitation = await validateInvitationToken(token);
      
      if (!invitation) {
        return fail(400, {
          error: 'Token d\'invitation invalide ou expiré',
          firstName,
          lastName,
          title,
          email
        });
      }

      // Vérifier que l'email correspond
      if (invitation.email !== email) {
        return fail(400, {
          error: 'L\'email ne correspond pas à l\'invitation',
          firstName,
          lastName,
          title,
          email
        });
      }

      // Créer l'utilisateur
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
          error: 'Erreur lors de la création du compte. L\'email est peut-être déjà utilisé.',
          firstName,
          lastName,
          title,
          email
        });
      }

      // Marquer l'invitation comme utilisée
      await markInvitationAsUsed(token);

      // Connecter l'utilisateur automatiquement
      const authToken = generateToken(user);
      cookies.set('auth_token', authToken, {
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
      
      console.error('Registration error:', error);
      return fail(500, {
        error: 'Une erreur est survenue lors de la création du compte',
        firstName,
        lastName,
        title,
        email
      });
    }
  }
};