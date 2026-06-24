import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) return true;               // logged in → allow
  router.navigate(['/login']);          // not logged in → redirect
  return false;
};