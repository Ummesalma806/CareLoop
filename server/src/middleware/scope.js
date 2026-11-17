import { ROLES, ADMIN_LEVELS } from '../config/constants.js';

/**
 * One central place for "who can see which tickets".
 * Every ticket query must start from this filter, so rules never get forgotten.
 *   customer      -> only own tickets
 *   agent         -> tickets of own branch
 *   branch admin  -> tickets of own branch
 *   super admin   -> everything
 */
export function ticketScope(user) {
  if (user.role === ROLES.CUSTOMER) return { customer: user._id };
  if (user.role === ROLES.ADMIN && user.adminLevel === ADMIN_LEVELS.SUPER) return {};
  return { branch: user.branch };
}
