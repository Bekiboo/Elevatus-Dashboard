import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { dev } from '$app/environment';
import { db } from './db/index.js';
import { users, invitations } from './db/schema.js';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';

// Variables d'environnement avec fallbacks pour le dev
const JWT_SECRET = process.env.JWT_SECRET || (dev ? 'dev-secret-key' : '');
const BCRYPT_ROUNDS = 12;
const TOKEN_EXPIRY = '7d';

if (!JWT_SECRET && !dev) {
  throw new Error('JWT_SECRET must be set in production');
}

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  title?: string;
  role: string;
  verified: boolean;
}


export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
      id: number;
      email: string;
      role: string;
    };
    return {
      id: decoded.id,
      email: decoded.email,
      firstName: '', // Sera récupéré de la DB si nécessaire
      lastName: '',
      role: decoded.role,
      verified: true
    };
  } catch {
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (result.length === 0) return null;
    
    const user = result[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title ?? undefined,
      role: user.role,
      verified: user.verified
    };
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

export async function getUserById(id: number): Promise<AuthUser | null> {
  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    
    if (result.length === 0) return null;
    
    const user = result[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title ?? undefined,
      role: user.role,
      verified: user.verified
    };
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

export async function createUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  title?: string;
  role?: string;
}): Promise<AuthUser | null> {
  try {
    const passwordHash = await hashPassword(data.password);
    
    const result = await db.insert(users).values({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      title: data.title,
      role: data.role || 'author',
      verified: true // Users created via invitation are automatically verified
    }).returning();
    
    if (result.length === 0) return null;
    
    const user = result[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title ?? undefined,
      role: user.role,
      verified: user.verified
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (result.length === 0) return null;
    
    const user = result[0];
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    
    if (!isValidPassword) return null;
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title ?? undefined,
      role: user.role,
      verified: user.verified
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

export function generateInvitationToken(): string {
  return jwt.sign(
    { type: 'invitation', timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function createInvitation(data: {
  email: string;
  role: string;
  invitedBy: number;
}): Promise<string | null> {
  try {
    const token = generateInvitationToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
    
    await db.insert(invitations).values({
      email: data.email,
      token,
      role: data.role,
      invitedBy: data.invitedBy,
      expiresAt
    });
    
    return token;
  } catch (error) {
    console.error('Error creating invitation:', error);
    return null;
  }
}

export async function validateInvitationToken(token: string): Promise<{
  email: string;
  role: string;
} | null> {
  try {
    const result = await db.select()
      .from(invitations)
      .where(eq(invitations.token, token))
      .limit(1);
    
    if (result.length === 0) return null;
    
    const invitation = result[0];
    
    // Check if invitation is not expired and has not been used
    if (invitation.used || invitation.expiresAt < new Date()) {
      return null;
    }
    
    return {
      email: invitation.email,
      role: invitation.role
    };
  } catch (error) {
    console.error('Error validating invitation token:', error);
    return null;
  }
}

export async function markInvitationAsUsed(token: string): Promise<boolean> {
  try {
    const result = await db.update(invitations)
      .set({ used: true })
      .where(eq(invitations.token, token))
      .returning();
    
    return result.length > 0;
  } catch (error) {
    console.error('Error marking invitation as used:', error);
    return false;
  }
}

export async function getUserFromEvent(event: RequestEvent): Promise<AuthUser | null> {
  const token = event.cookies.get('auth_token');
  
  if (!token) return null;
  
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  // Get complete user information
  return getUserById(decoded.id);
}

export function setAuthCookie(event: RequestEvent, user: AuthUser): void {
  const token = generateToken(user);
  
  event.cookies.set('auth_token', token, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    httpOnly: true,
    secure: !dev,
    sameSite: 'strict'
  });
}

export function clearAuthCookie(event: RequestEvent): void {
  event.cookies.delete('auth_token', { path: '/' });
}