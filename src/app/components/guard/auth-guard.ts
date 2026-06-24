import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  // DEMO MODE: Auth guard is disabled - allow all routes
  // const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  // if (token) return true;
  // redirect to /login if no token
  // return false;
  return true;
};