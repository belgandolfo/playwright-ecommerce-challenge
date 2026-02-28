import 'dotenv/config';

export const adminUser = {
  username: process.env.ADMIN_EMAIL!,
  password: process.env.ADMIN_PASSWORD!,
};

/**
 * To avoid repeating code for invalid user in both dev and qa environments,
 * it is only defined here, as we can use the fallback values for both.
 */
export const invalidUser = {
  username: process.env.INVALID_EMAIL ?? 'invalid@admin.com',
  password: process.env.INVALID_PASSWORD ?? 'invalidPass',
};

export const nonAdminUser = {
  username: process.env.TEST_EMAIL!,
  password: process.env.TEST_PASSWORD!,
};

export type TestUserKey = 'admin' | 'nonadmin';

const usersByKey: Record<TestUserKey, { username: string; password: string }> = {
  admin: adminUser,
  nonadmin: nonAdminUser,
};

/**
 * Returns the user for the current test run.
 * Set TEST_USER=admin | nonAdmin (default: admin) when running tests.
 */
export function getTestUser(): { username: string; password: string } {
  const key = (process.env.TEST_USER ?? 'admin').toLowerCase() as TestUserKey;
  const user = usersByKey[key];
  if (!user) {
    throw new Error(
      `Unknown TEST_USER="${process.env.TEST_USER}". Use: admin or nonAdmin.`,
    );
  }
  return user;
}