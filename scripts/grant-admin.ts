import dataSource from '../src/database/data-source';

/**
 * Хэрэглэгчид эрх олгох / жагсаах (khurd-api-ийн script-ийн хувилбар).
 *
 *   npm run script:grant-admin                          # хэрэглэгчдийн жагсаалт
 *   npm run script:grant-admin -- a@b.com               # admin эрх олгох
 *   npm run script:grant-admin -- a@b.com marketer      # өөр эрх олгох
 *
 * Docker дотор:
 *   docker compose exec api node -e "..."  — эсвэл GraphQL createStaff ашиглана
 */
async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const role = process.argv[3]?.trim() || 'admin';
  await dataSource.initialize();
  try {
    if (!email) {
      const rows = await dataSource.query(
        `SELECT email, first_name, last_name, roles, is_active
         FROM users ORDER BY created_at DESC LIMIT 50`,
      );
      console.table(rows);
      return;
    }
    const [user] = await dataSource.query(
      `SELECT id, roles FROM users WHERE email = ? LIMIT 1`,
      [email],
    );
    if (!user) {
      console.error(`✗ User not found: ${email}`);
      process.exitCode = 1;
      return;
    }
    const roles = new Set<string>(
      String(user.roles || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean),
    );
    roles.add(role);
    const next = [...roles].join(',');
    await dataSource.query(`UPDATE users SET roles = ? WHERE id = ?`, [
      next,
      user.id,
    ]);
    console.log(`✓ ${email} → roles: ${next}`);
  } finally {
    await dataSource.destroy();
  }
}

void main();
