import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { users, invitations } from '$lib/server/db/schema.js';
import { eq, and, count } from 'drizzle-orm';
import { createInvitation } from '$lib/server/auth.js';
import type { Actions } from '@sveltejs/kit';

export const load = async ({ locals }: { locals: App.Locals }) => {
  // Check that user is admin
  if (!locals.user || locals.user.role !== 'admin') {
    throw redirect(302, '/dashboard');
  }
  
  // Get all users
  const allUsers = await db.select().from(users);
  
  // Get all pending invitations
  const pendingInvitations = await db.select().from(invitations).where(eq(invitations.used, false));
  
  return {
    users: allUsers,
    invitations: pendingInvitations,
    currentUserId: locals.user.id
  };
};



export const actions: Actions = {
  verifyUser: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== 'admin') {
      return fail(403, { error: 'Access denied' });
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

      return { success: true, message: 'User verified successfully' };
    } catch {
      return fail(500, { error: 'Error during verification' });
    }
  },

  verifyAll: async ({ locals }) => {
    if (!locals.user || locals.user.role !== 'admin') {
      return fail(403, { error: 'Access denied' });
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
        message: `${result.length} user(s) verified successfully` 
      };
    } catch {
      return fail(500, { error: 'Error during bulk verification' });
    }
  },

  deleteUser: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== 'admin') {
      return fail(403, { error: 'Access denied' });
    }

    const data = await request.formData();
    const userId = parseInt(data.get('userId') as string);

    // Prevent self-deletion
    if (userId === locals.user.id) {
      return fail(400, { error: 'You cannot delete your own account' });
    }

    try {
      // Check if it's the last admin
      const userToDelete = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (userToDelete.length === 0) {
        return fail(404, { error: 'User not found' });
      }

      if (userToDelete[0].role === 'admin') {
        const otherAdmins = await db.select({ count: count() })
          .from(users)
          .where(and(
            eq(users.role, 'admin'),
            eq(users.verified, true)
          ));
        
        if (otherAdmins[0]?.count <= 1) {
          return fail(400, { error: 'Cannot delete the last administrator' });
        }
      }

      await db.delete(users).where(eq(users.id, userId));
      return { success: true, message: 'User deleted successfully' };
    } catch {
      return fail(500, { error: 'Error during deletion' });
    }
  },

  updateUserRole: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== 'admin') {
      return fail(403, { error: 'Access denied' });
    }

    const data = await request.formData();
    const userId = parseInt(data.get('userId') as string);
    const newRole = data.get('role') as string;

    // Prevent changing own role if it's the last admin
    if (userId === locals.user.id && locals.user.role === 'admin' && newRole !== 'admin') {
      const otherAdmins = await db.select({ count: count() })
        .from(users)
        .where(and(
          eq(users.role, 'admin'),
          eq(users.verified, true)
        ));
      
      if (otherAdmins[0]?.count <= 1) {
        return fail(400, { error: 'Cannot remove your administrator rights as the last admin' });
      }
    }

    try {
      await db.update(users)
        .set({ 
          role: newRole,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      return { success: true, message: 'Role updated successfully' };
    } catch {
      return fail(500, { error: 'Error updating role' });
    }
  },

  createInvite: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== 'admin') {
      return fail(403, { error: 'Access denied' });
    }

    const data = await request.formData();
    const email = data.get('email') as string;
    const role = data.get('role') as string;

    if (!email || !role) {
      return fail(400, { error: 'Email and role are required' });
    }

    try {
      const token = await createInvitation({
        email,
        role,
        invitedBy: locals.user.id
      });

      if (!token) {
        return fail(500, { error: 'Error creating invitation' });
      }

      const inviteUrl = `${process.env.ORIGIN || 'http://localhost:5173'}/register?token=${token}`;
      return { 
        success: true, 
        message: 'Invitation created successfully',
        inviteUrl,
        email,
        role
      };
    } catch {
      return fail(500, { error: 'Error creating invitation' });
    }
  },

  deleteInvitation: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== 'admin') {
      return fail(403, { error: 'Access denied' });
    }

    const data = await request.formData();
    const invitationId = parseInt(data.get('invitationId') as string);

    try {
      await db.delete(invitations).where(eq(invitations.id, invitationId));
      return { success: true, message: 'Invitation deleted successfully' };
    } catch {
      return fail(500, { error: 'Error deleting invitation' });
    }
  }
};