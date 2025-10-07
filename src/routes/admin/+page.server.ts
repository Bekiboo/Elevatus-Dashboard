import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { users, invitations } from '$lib/server/db/schema.js';
import { eq, and, count } from 'drizzle-orm';
import { createInvitation } from '$lib/server/auth.js';
import type { Actions } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  // Vérifier que l'utilisateur est admin
  if (!locals.user || locals.user.role !== 'admin') {
    throw redirect(302, '/dashboard');
  }
  
  // Récupérer tous les utilisateurs
  const allUsers = await db.select().from(users);
  
  // Récupérer toutes les invitations pendantes
  const pendingInvitations = await db.select().from(invitations).where(eq(invitations.used, false));
  
  return {
    users: allUsers,
    invitations: pendingInvitations,
    currentUserId: locals.user.id
  };
};

// Fonction helper pour vérifier s'il y a d'autres admins
async function hasOtherAdmins(currentUserId: number): Promise<boolean> {
  const adminCount = await db.select({ count: count() })
    .from(users)
    .where(and(
      eq(users.role, 'admin'),
      eq(users.verified, true),
      // Exclure l'utilisateur actuel
      db.$with('excluded').as(db.select().from(users).where(eq(users.id, currentUserId)))
    ));
  
  return adminCount[0]?.count > 0;
}

export const actions: Actions = {
  verifyUser: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== 'admin') {
      return fail(403, { error: 'Accès non autorisé' });
    }

    const data = await request.formData();
    const userId = parseInt(data.get('userId') as string);

    try {
      await db.update(users)
        .set({ 
          verified: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      return { success: true, message: 'Utilisateur vérifié avec succès' };
    } catch {
      return fail(500, { error: 'Erreur lors de la vérification' });
    }
  },

  verifyAll: async ({ locals }) => {
    if (!locals.user || locals.user.role !== 'admin') {
      return fail(403, { error: 'Accès non autorisé' });
    }

    try {
      const result = await db.update(users)
        .set({ 
          verified: true,
          updatedAt: new Date()
        })
        .where(eq(users.verified, false))
        .returning();

      return { 
        success: true, 
        message: `${result.length} utilisateur(s) vérifié(s) avec succès` 
      };
    } catch {
      return fail(500, { error: 'Erreur lors de la vérification en masse' });
    }
  },

  deleteUser: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== 'admin') {
      return fail(403, { error: 'Accès non autorisé' });
    }

    const data = await request.formData();
    const userId = parseInt(data.get('userId') as string);

    // Empêcher l'auto-suppression
    if (userId === locals.user.id) {
      return fail(400, { error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    try {
      // Vérifier si c'est le dernier admin
      const userToDelete = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (userToDelete.length === 0) {
        return fail(404, { error: 'Utilisateur non trouvé' });
      }

      if (userToDelete[0].role === 'admin') {
        const otherAdmins = await db.select({ count: count() })
          .from(users)
          .where(and(
            eq(users.role, 'admin'),
            eq(users.verified, true)
          ));
        
        if (otherAdmins[0]?.count <= 1) {
          return fail(400, { error: 'Impossible de supprimer le dernier administrateur' });
        }
      }

      await db.delete(users).where(eq(users.id, userId));
      return { success: true, message: 'Utilisateur supprimé avec succès' };
    } catch {
      return fail(500, { error: 'Erreur lors de la suppression' });
    }
  },

  updateUserRole: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== 'admin') {
      return fail(403, { error: 'Accès non autorisé' });
    }

    const data = await request.formData();
    const userId = parseInt(data.get('userId') as string);
    const newRole = data.get('role') as string;

    // Empêcher la modification de son propre rôle si c'est le dernier admin
    if (userId === locals.user.id && locals.user.role === 'admin' && newRole !== 'admin') {
      const otherAdmins = await db.select({ count: count() })
        .from(users)
        .where(and(
          eq(users.role, 'admin'),
          eq(users.verified, true)
        ));
      
      if (otherAdmins[0]?.count <= 1) {
        return fail(400, { error: 'Impossible de retirer vos droits d\'administrateur en tant que dernier admin' });
      }
    }

    try {
      await db.update(users)
        .set({ 
          role: newRole,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      return { success: true, message: 'Rôle mis à jour avec succès' };
    } catch {
      return fail(500, { error: 'Erreur lors de la mise à jour du rôle' });
    }
  },

  createInvite: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== 'admin') {
      return fail(403, { error: 'Accès non autorisé' });
    }

    const data = await request.formData();
    const email = data.get('email') as string;
    const role = data.get('role') as string;

    if (!email || !role) {
      return fail(400, { error: 'Email et rôle sont requis' });
    }

    try {
      const token = await createInvitation({
        email,
        role,
        invitedBy: locals.user.id
      });

      if (!token) {
        return fail(500, { error: 'Erreur lors de la création de l\'invitation' });
      }

      const inviteUrl = `${process.env.ORIGIN || 'http://localhost:5173'}/register?token=${token}`;
      return { 
        success: true, 
        message: 'Invitation créée avec succès',
        inviteUrl,
        email,
        role
      };
    } catch {
      return fail(500, { error: 'Erreur lors de la création de l\'invitation' });
    }
  },

  deleteInvitation: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== 'admin') {
      return fail(403, { error: 'Accès non autorisé' });
    }

    const data = await request.formData();
    const invitationId = parseInt(data.get('invitationId') as string);

    try {
      await db.delete(invitations).where(eq(invitations.id, invitationId));
      return { success: true, message: 'Invitation supprimée avec succès' };
    } catch {
      return fail(500, { error: 'Erreur lors de la suppression de l\'invitation' });
    }
  }
};