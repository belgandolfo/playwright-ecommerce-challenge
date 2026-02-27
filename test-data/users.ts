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

export const testUser = {
  username: process.env.TEST_EMAIL!,
  password: process.env.TEST_PASSWORD!,
};