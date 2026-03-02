/* eslint-disable playwright/no-standalone-expect */
import { test, expect } from './fixtures';
import shopItems from '../test-data/shopItems.json';
import { ShoppingCartPage } from '../pages/ShoppingCartPage';

function expectedTotal(
  items: Array<{ price: number }>,
  quantities?: number[],
): number {
  const qty = quantities ?? items.map(() => 1);
  return items.reduce((sum, item, i) => sum + item.price * qty[i], 0);
}

test.describe('Shopping Cart', () => {
  test.describe('Cart empty state', () => {
    test('empty cart shows the expected state (no rows)', async ({ userInShoppingCartPage }) => {
      const shoppingCartPage = new ShoppingCartPage(userInShoppingCartPage.page);
      await expect(shoppingCartPage.cartRows).toHaveCount(0);
    });
  });

  test.describe('Adding items', () => {
    test('add one item by key', async ({
      userInShoppingCartPage,
    }) => {
      const shoppingCartPage = new ShoppingCartPage(userInShoppingCartPage.page);
      await shoppingCartPage.addItemToCart(shopItems.iphone12);
      await expect(shoppingCartPage.cartRows).toHaveCount(1);
      await expect(shoppingCartPage.cartTotalPrice).toContainText(
        expectedTotal([shopItems.iphone12]).toFixed(2),
      );
    });

    test('add several different items by key', async ({
      userInShoppingCartPage,
    }) => {
      const shoppingCartPage = new ShoppingCartPage(userInShoppingCartPage.page);
      await shoppingCartPage.addItemToCart(shopItems.iphone12);
      await shoppingCartPage.addItemToCart(shopItems.nokia);
      await shoppingCartPage.addItemToCart(shopItems.samsung);
      await expect(shoppingCartPage.cartRows).toHaveCount(3);
      const total = expectedTotal([shopItems.iphone12, shopItems.nokia, shopItems.samsung]);
      await expect(shoppingCartPage.cartTotalPrice).toContainText(total.toFixed(2));
    });

    test('add same item multiple times', async ({
      userInShoppingCartPage,
    }) => {
      const shoppingCartPage = new ShoppingCartPage(userInShoppingCartPage.page);
      await shoppingCartPage.addItemToCart(shopItems.iphone12);
      // Accept the native alert in a listener so it's dismissed as soon as it appears
      const dialogHandled = new Promise<void>((resolve, reject) => {
        shoppingCartPage.page.once('dialog', async (dialog) => {
          try {
            expect(dialog.message()).toMatch(/already added|already in cart/i);
            await dialog.accept();
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
      await shoppingCartPage.addItemToCart(shopItems.iphone12);
      await dialogHandled;
    });
  });

  test.describe('Quantity', () => {
    test('update quantity to a valid number', async ({
      userInShoppingCartPage,
    }) => {
      const shoppingCartPage = new ShoppingCartPage(userInShoppingCartPage.page);
      await shoppingCartPage.addItemToCart(shopItems.iphone12);
      await shoppingCartPage.updateItemQuantity(shopItems.iphone12, 2);
      await shoppingCartPage.page
        .locator('.cart-items .cart-row')
        .filter({ hasText: shopItems.iphone12.title })
        .locator('input')
        .blur();
      const total = expectedTotal([shopItems.iphone12], [2]);
      await expect(shoppingCartPage.cartTotalPrice).toContainText(total.toFixed(2));
    });

    test('update quantity to 0', async ({ userInShoppingCartPage }) => {
      const shoppingCartPage = new ShoppingCartPage(userInShoppingCartPage.page);
      await shoppingCartPage.addItemToCart(shopItems.nokia);
      await shoppingCartPage.updateItemQuantity(shopItems.nokia, 0);
      const quantityInput = shoppingCartPage.page
        .locator('.cart-items .cart-row')
        .filter({ hasText: shopItems.nokia.title })
        .locator('input');
      await shoppingCartPage.shoppingCartHeader.click();
      await expect(quantityInput).not.toHaveValue('0');
    });

    test('invalid quantity (empty, negative, non-numeric)', async ({
      userInShoppingCartPage,
    }) => {
      const shoppingCartPage = new ShoppingCartPage(userInShoppingCartPage.page);
      await shoppingCartPage.addItemToCart(shopItems.samsung);
      const row = shoppingCartPage.page
        .locator('.cart-items .cart-row')
        .filter({ hasText: shopItems.samsung.title });
      const quantityInput = row.locator('input');

      await quantityInput.fill('');
      await quantityInput.blur();
      await expect(quantityInput).not.toHaveValue('');

      await quantityInput.fill('-1');
      await quantityInput.blur();
      await expect(quantityInput).not.toHaveValue('-1');

      // input[type=number] rejects non-numeric text; Playwright throws when fill is used with non-numeric
      await expect(quantityInput.fill('abc')).rejects.toThrow(
        /Cannot type text into input\[type=number\]/,
      );
    });
  });

  test.describe('Removing items', () => {
    test('remove one item', async ({
      userInShoppingCartPage,
    }) => {
      const shoppingCartPage = new ShoppingCartPage(userInShoppingCartPage.page);
      await shoppingCartPage.addItemToCart(shopItems.iphone12);
      await shoppingCartPage.addItemToCart(shopItems.nokia);
      await shoppingCartPage.removeItem(shopItems.iphone12);
      
      await expect(shoppingCartPage.cartRows).toHaveCount(1);
      await expect(shoppingCartPage.cartTotalPrice).toContainText(
        shopItems.nokia.price.toFixed(2),
      );
    });

    test('remove all items', async ({ userInShoppingCartPage }) => {
      const shoppingCartPage = new ShoppingCartPage(userInShoppingCartPage.page);
      await shoppingCartPage.addItemToCart(shopItems.nokia);
      await shoppingCartPage.removeItem(shopItems.nokia);

      await expect(shoppingCartPage.cartRows).toHaveCount(0);
    });

    test('remove one of several items', async ({
      userInShoppingCartPage,
    }) => {
      const shoppingCartPage = new ShoppingCartPage(userInShoppingCartPage.page);
      await shoppingCartPage.addItemToCart(shopItems.iphone12);
      await shoppingCartPage.addItemToCart(shopItems.huawei);
      await shoppingCartPage.addItemToCart(shopItems.samsung);
      await shoppingCartPage.removeItem(shopItems.huawei);

      await expect(shoppingCartPage.cartRows).toHaveCount(2);
      const total = expectedTotal([shopItems.iphone12, shopItems.samsung]);
      await expect(shoppingCartPage.cartTotalPrice).toContainText(total.toFixed(2));
    });
  });
});
