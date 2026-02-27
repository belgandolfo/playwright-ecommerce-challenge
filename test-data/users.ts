import 'dotenv/config';

export const adminUser = {
  username: process.env.TEST_EMAIL ?? 'admin@admin.com',
  password: process.env.TEST_PASS ?? 'admin123',
};

export const invalidUser = {
    username: process.env.TEST_EMAIL ?? 'invalid@admin.com',
    password: process.env.TEST_PASS ?? 'invalidPass',
  };

export const testUser = {
    username: process.env.TEST_EMAIL ?? 'nonadmin@admin.com',
    password: process.env.TEST_PASS ?? 'nonadmin123',
  };