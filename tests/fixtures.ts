import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { BasePage } from '../pages/BasePage';
import { LoginPage } from '../pages/LoginPage';
import { ShoppingCartPage } from '../pages/ShoppingCartPage';
import { ShippingDetailsPage } from '../pages/ShippingDetailsPage';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage';
import { getTestUser } from '../test-data/users';
import shopItems from '../test-data/shopItems.json';
import shippingData from '../test-data/shippingData.json';

type PageFixtures = {
  authenticatedUser: Page;
  basePage: BasePage;
  loginPage: LoginPage;
  userInOrderConfirmationPage: { orderConfirmationPage: OrderConfirmationPage; cartTotal: number };
  userInShippingDetailsPage: ShippingDetailsPage;
  userInShoppingCartPage: ShoppingCartPage;
  shoppingCartPage: ShoppingCartPage;
  shippingDetailsPage: ShippingDetailsPage;
  orderConfirmationPage: OrderConfirmationPage;
};

/**
 * Default test with auto login/logout: every test gets admin login before and logout after.
 * Use page object fixtures (loginPage, shoppingCartPage, etc.) – they use the logged-in page.
 */
export const test = base.extend<PageFixtures>({
  authenticatedUser: [
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

  userInShippingDetailsPage: async ({ authenticatedUser }, use) => {
    const shoppingCartPage = new ShoppingCartPage(authenticatedUser);
    await shoppingCartPage.addItemToCart(shopItems.iphone12);
    await shoppingCartPage.proceedToCheckout();
    const userInShippingDetailsPage = new ShippingDetailsPage(authenticatedUser);
    await expect(userInShippingDetailsPage.shippingDetailsHeader).toBeVisible();
    await expect(userInShippingDetailsPage.phoneNumberInput).toBeVisible();
    await expect(userInShippingDetailsPage.streetInput).toBeVisible();
    await expect(userInShippingDetailsPage.cityInput).toBeVisible();
    await expect(userInShippingDetailsPage.countrySelect).toBeVisible();
    await expect(userInShippingDetailsPage.submitOrderButton).toBeVisible();
    await use(userInShippingDetailsPage);
  },

  userInOrderConfirmationPage: async ({ authenticatedUser }, use) => {
    const itemsAdded = [shopItems.iphone12];
    const cartTotal = itemsAdded.reduce((sum, item) => sum + item.price, 0);

    const shoppingCartPage = new ShoppingCartPage(authenticatedUser);
    for (const item of itemsAdded) {
      await shoppingCartPage.addItemToCart(item);
    }
    await shoppingCartPage.proceedToCheckout();
    const shippingDetailsPage = new ShippingDetailsPage(authenticatedUser);
    await expect(shippingDetailsPage.shippingDetailsHeader).toBeVisible();
    await expect(shippingDetailsPage.phoneNumberInput).toBeVisible();
    await expect(shippingDetailsPage.streetInput).toBeVisible();
    await expect(shippingDetailsPage.cityInput).toBeVisible();
    await expect(shippingDetailsPage.countrySelect).toBeVisible();
    await expect(shippingDetailsPage.submitOrderButton).toBeVisible();
    await shippingDetailsPage.fillShippingDetails(shippingData.validCustomer);
    const orderConfirmationPage = new OrderConfirmationPage(authenticatedUser);
    await expect(orderConfirmationPage.congratsMessage).toBeVisible();
    await use({ orderConfirmationPage, cartTotal });
  },

  userInShoppingCartPage: async ({ authenticatedUser }, use) => {
    const shoppingCartPage = new ShoppingCartPage(authenticatedUser);
    //await shoppingCartPage.goto(); // this is not needed because the urls are the same for all pages
    await expect(shoppingCartPage.shoppingCartHeader).toBeVisible();
    await use(shoppingCartPage);
  }
});

/**
 * Use this for tests that must run without auth (e.g. login page tests).
 * No login before or logout after; page objects use the raw page.
 */
export const testNoAuth = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  }
});

export { expect } from '@playwright/test';
