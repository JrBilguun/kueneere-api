function toRoleCsv(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** Accepts CSV strings, arrays, or mixed values and returns unique role names. */
export function parseRoles(roles: unknown): string[] {
  if (roles == null || roles === '') {
    return [];
  }

  const parts = Array.isArray(roles)
    ? roles.flatMap((role) => toRoleCsv(role).split(','))
    : toRoleCsv(roles).split(',');

  return [...new Set(parts.map((role) => role.trim()).filter(Boolean))];
}

export function serializeRoles(roles: unknown): string {
  return parseRoles(roles).join(',');
}

export function mergeRoles(...groups: unknown[]): string[] {
  return parseRoles(groups.flatMap((group) => parseRoles(group)));
}

export function hasAnyRole(roles: unknown, ...needed: string[]): boolean {
  if (needed.length === 0) {
    return true;
  }
  const owned = new Set(parseRoles(roles));
  return needed.some((role) => owned.has(role));
}
