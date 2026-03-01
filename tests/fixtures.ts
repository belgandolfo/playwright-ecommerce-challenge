import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { BasePage } from '../pages/BasePage';
import { LoginPage } from '../pages/LoginPage';
import { ShoppingCartPage } from '../pages/ShoppingCartPage';
import { ShippingDetailsPage } from '../pages/ShippingDetailsPage';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage';
import { getTestUser } from '../test-data/users';

type PageFixtures = {
  loggedInPageWithLogout: Page;
  loginPage: LoginPage;
  orderConfirmationPage: OrderConfirmationPage;
  shippingDetailsPage: ShippingDetailsPage;
  shoppingCartPage: ShoppingCartPage;
};

/**
 * Default test with auto login/logout: every test gets admin login before and logout after.
 * Use page object fixtures (loginPage, shoppingCartPage, etc.) – they use the logged-in page.
 */
export const test = base.extend<PageFixtures>({
  loggedInPageWithLogout: [
    async ({ page }, use) => {
      const user = getTestUser();
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(user.username, user.password);
      await use(page);
      const basePage = new BasePage(page);
      await basePage.logout();
    },
    { auto: true },
  ],

  orderConfirmationPage: async ({ loggedInPageWithLogout }, use) => {
    await use(new OrderConfirmationPage(loggedInPageWithLogout));
  },

  shippingDetailsPage: async ({ loggedInPageWithLogout }, use) => {
    await use(new ShippingDetailsPage(loggedInPageWithLogout));
  },

  shoppingCartPage: async ({ loggedInPageWithLogout }, use) => {
    const shoppingCartPage = new ShoppingCartPage(loggedInPageWithLogout);
    //await shoppingCartPage.goto(); // this is not needed because the urls are the same for all pages
    await expect(shoppingCartPage.shoppingCartHeader).toBeVisible();
    await use(shoppingCartPage);
  },
});

/**
 * Use this for tests that must run without auth (e.g. login page tests).
 * No login before or logout after; page objects use the raw page.
 */
export const testNoAuth = base.extend<PageFixtures>({
  loggedInPageWithLogout: async ({ page }, use) => {
    await use(page);
  },

  shoppingCartPage: async ({ page }, use) => {
    await use(new ShoppingCartPage(page));
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const loginTitle = loginPage.page.getByRole('heading', {
      name: 'Login - Shop',
    });
    await expect(loginTitle).toBeVisible();
    await expect(loginTitle).toHaveText('Login - Shop');
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.homeButton).toBeVisible();
    await expect(loginPage.contactButton).toBeVisible();
    await use(loginPage);
  },
});

export { expect } from '@playwright/test';
