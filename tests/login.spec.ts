import {  testNoAuth, expect } from './fixtures';
import {
  adminUser,
  invalidUser,
  nonAdminUser,
} from '../test-data/users';
import { LoginPage } from '../pages/LoginPage';
import { ShoppingCartPage } from '../pages/ShoppingCartPage';

async function expectLoginFormVisible(loginPage: LoginPage): Promise<void> {
  await expect(loginPage.emailInput).toBeVisible();
  await expect(loginPage.passwordInput).toBeVisible();
  await expect(loginPage.submitButton).toBeVisible();
}

testNoAuth.describe('Login', () => {
  testNoAuth('successful login with valid admin credentials', async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(adminUser.username, adminUser.password);
    await expect(loginPage.logoutButton).toBeVisible();
    const shoppingCartPage = new ShoppingCartPage(loginPage.page);
    await expect(shoppingCartPage.shoppingCartHeader).toBeVisible();
  });

  //This test will not work as there are no non-admin users to test with
  testNoAuth('successful login with nonAdmin credentials', async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(nonAdminUser.username, nonAdminUser.password);
    await expect(loginPage.logoutButton).toBeVisible();
    const shoppingCartPage = new ShoppingCartPage(loginPage.page);
    await expect(shoppingCartPage.shoppingCartHeader).toBeVisible();
  });

  testNoAuth('shows error message for non-existing credentials', async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(invalidUser.username, invalidUser.password);
    await expect(loginPage.badCredentialsMessage).toBeVisible();
    await expectLoginFormVisible(loginPage);
  });

  testNoAuth('shows error message for valid email and wrong password', async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(adminUser.username, 'wrongpassword');
    await expect(loginPage.badCredentialsMessage).toBeVisible();
    await expectLoginFormVisible(loginPage);
  });

  testNoAuth('shows error message for submitions with empty email and password', async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login('', '');
    await expect(loginPage.badCredentialsMessage).toBeVisible();
    await expectLoginFormVisible(loginPage);
  });

  testNoAuth('shows error message for submitions with empty email', async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login('', adminUser.password);
    await expect(loginPage.badCredentialsMessage).toBeVisible();
    await expectLoginFormVisible(loginPage);
  });

  testNoAuth('shows error message for submitions with empty password', async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(adminUser.username, '');
    await expect(loginPage.badCredentialsMessage).toBeVisible();
    await expectLoginFormVisible(loginPage);
  });
});
