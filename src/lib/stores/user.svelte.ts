import type { AuthUser } from '$lib/server/auth.js';

/**
 * User store with Svelte 5 syntax
 * Uses runes for optimal reactivity
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
    
    // Admins have all rights
    if (this.#user.role === 'admin') return true;
    
    return this.#user.role === requiredRole;
  }
  
  // Method to check if user can perform an action
  canWrite(): boolean {
    return this.hasRole('author') || this.hasRole('admin');
  }
  
  canAdmin(): boolean {
    return this.hasRole('admin');
  }
}

// Instance globale du store
export const userStore = new UserStore();