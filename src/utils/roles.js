// Roles are assigned in auth0 and included in the user's ID token under this claim.
export const ROLES_CLAIM = 'https://dst-ncalc.org/claims';
export const getRoles = (user) => user?.[ROLES_CLAIM] || [];

// Admin roles that have access to everything by default.
export const ADMIN_ROLES = ['ncalc-admin', 'ncalc-super-admin'];

// Pages restricted to specific roles. (ncalc-admin / ncalc-super-admin) have access by default.
export const APPLIED_MAPS_ROLES = ['TNC'];

export const isUserAdmin = (roles) => roles.some((r) => ADMIN_ROLES.includes(r));
export const isUserSuperAdmin = (roles) => roles.includes('ncalc-super-admin');

/**
 * True if the given roles grant access to a page restricted to `allowedRoles`.
 * Admins always have access.
 */
export const hasAccess = (roles, allowedRoles) => isUserAdmin(roles)
  || roles.some((r) => allowedRoles.includes(r));
