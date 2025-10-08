import type { Handle } from '@sveltejs/kit';
import { getUserFromEvent } from '$lib/server/auth.js';

export const handle: Handle = async ({ event, resolve }) => {
  // Get user from auth cookie
  const user = await getUserFromEvent(event);
  
  // Add user to locals so it's accessible in all pages
  event.locals.user = user;
  
  // Continuer avec la requête
  const response = await resolve(event);
  
  return response;
};