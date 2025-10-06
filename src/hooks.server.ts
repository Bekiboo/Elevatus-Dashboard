import type { Handle } from '@sveltejs/kit';
import { getUserFromEvent } from '$lib/server/auth.js';

export const handle: Handle = async ({ event, resolve }) => {
  // Récupérer l'utilisateur depuis le cookie d'auth
  const user = await getUserFromEvent(event);
  
  // Ajouter l'utilisateur aux locals pour qu'il soit accessible dans toutes les pages
  event.locals.user = user;
  
  // Continuer avec la requête
  const response = await resolve(event);
  
  return response;
};