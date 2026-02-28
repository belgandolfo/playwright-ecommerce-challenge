/* eslint-disable playwright/no-standalone-expect */
import { testNoAuth, expect } from './fixtures';
import { adminUser, invalidUser } from '../test-data/users';

testNoAuth.describe('Login', () => {
  testNoAuth('successful login with valid admin credentials', async ({
    loginPage,
    shoppingCartPage,
  }) => {
    await loginPage.login(adminUser.username, adminUser.password);
    await expect(loginPage.logoutButton).toBeVisible();
    await expect(shoppingCartPage.cartTotalTitle).toBeVisible();
  });

  testNoAuth('shows error message for non-existing credentials', async ({
    loginPage,
  }) => {
    await loginPage.login(invalidUser.username, invalidUser.password);
    await expect(loginPage.badCredentialsMessage).toBeVisible();
  });

});
