import {
  parseRoles,
  serializeRoles,
  mergeRoles,
  hasAnyRole,
} from './roles.util';

describe('roles.util', () => {
  describe('parseRoles', () => {
    it('splits a CSV string into distinct roles', () => {
      expect(parseRoles('driver,user')).toEqual(['driver', 'user']);
    });

    it('trims spaces and drops empties', () => {
      expect(parseRoles(' admin, director , ,staff ')).toEqual([
        'admin',
        'director',
        'staff',
      ]);
    });

    it('flattens a single array element that is itself CSV', () => {
      expect(parseRoles(['driver,user'])).toEqual(['driver', 'user']);
    });

    it('dedupes mixed array and CSV input', () => {
      expect(parseRoles(['admin', 'user,admin'])).toEqual(['admin', 'user']);
    });

    it('returns [] for empty values', () => {
      expect(parseRoles(null)).toEqual([]);
      expect(parseRoles(undefined)).toEqual([]);
      expect(parseRoles('')).toEqual([]);
    });
  });

  describe('hasAnyRole', () => {
    it('matches each role in a CSV, not the whole string', () => {
      expect(hasAnyRole('driver,user', 'driver')).toBe(true);
      expect(hasAnyRole('driver,user', 'user')).toBe(true);
      expect(hasAnyRole('driver,user', 'admin')).toBe(false);
    });

    it('does not treat teesh-admin as admin', () => {
      expect(hasAnyRole('teesh-admin', 'admin')).toBe(false);
      expect(hasAnyRole(['teesh-admin', 'user'], 'admin')).toBe(false);
      expect(hasAnyRole(['teesh-admin', 'admin'], 'admin')).toBe(true);
    });

    it('returns true if any required role is present', () => {
      expect(
        hasAnyRole(['scanner', 'teesh-admin'], 'admin', 'teesh-admin'),
      ).toBe(true);
    });
  });

  describe('mergeRoles', () => {
    it('adds roles without removing existing ones', () => {
      expect(mergeRoles('driver', ['user'])).toEqual(['driver', 'user']);
      expect(mergeRoles(['driver', 'user'], 'admin')).toEqual([
        'driver',
        'user',
        'admin',
      ]);
    });
  });

  describe('serializeRoles', () => {
    it('round-trips CSV without spaces', () => {
      expect(serializeRoles(['driver', 'user', 'admin'])).toBe(
        'driver,user,admin',
      );
      expect(parseRoles(serializeRoles('driver, user'))).toEqual([
        'driver',
        'user',
      ]);
    });
  });
});

describe('User multi-role helpers', () => {
  it('lets one user hold many roles', () => {
    const roles = mergeRoles('driver', 'user', 'admin');
    expect(roles).toEqual(['driver', 'user', 'admin']);
    expect(hasAnyRole(roles, 'driver')).toBe(true);
    expect(hasAnyRole(roles, 'user')).toBe(true);
    expect(hasAnyRole(roles, 'admin')).toBe(true);
  });

  it('keeps driver login working when the user is also a customer', () => {
    const roles = ['driver', 'user'];
    expect(hasAnyRole(roles, 'driver')).toBe(true);
    expect(hasAnyRole(roles, 'scanner')).toBe(false);
  });
});
