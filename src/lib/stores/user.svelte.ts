import type { AuthUser } from '$lib/server/auth.js';

/**
 * Store d'utilisateur avec la syntaxe Svelte 5
 * Utilise les runes pour une réactivité optimale
 */
class UserStore {
  #user = $state<AuthUser | null>(null);
  
  isAuthenticated = $derived(this.#user !== null);
  
  role = $derived(this.#user?.role || null);
  
  isAdmin = $derived(this.#user?.role === 'admin');
  
  isAuthor = $derived(this.#user?.role === 'author' || this.#user?.role === 'admin');
  
  get userData() {
    return this.#user;
  }
  
  setUser(user: AuthUser | null) {
    this.#user = user;
  }
  
  login(user: AuthUser) {
    this.#user = user;
  }
  
  logout() {
    this.#user = null;
  }
  
  updateUser(updates: Partial<AuthUser>) {
    if (this.#user) {
      this.#user = { ...this.#user, ...updates };
    }
  }
  
  hasRole(requiredRole: string): boolean {
    if (!this.#user) return false;
    
    // Les admins ont tous les droits
    if (this.#user.role === 'admin') return true;
    
    return this.#user.role === requiredRole;
  }
  
  // Méthode pour vérifier si l'utilisateur peut faire une action
  canWrite(): boolean {
    return this.hasRole('author') || this.hasRole('admin');
  }
  
  canAdmin(): boolean {
    return this.hasRole('admin');
  }
}

// Instance globale du store
export const userStore = new UserStore();