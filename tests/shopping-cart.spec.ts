/* eslint-disable playwright/no-standalone-expect */
import { test, expect } from './fixtures';
import shopItems from '../test-data/shopItems.json';

function expectedTotal(keys: (keyof typeof shopItems)[], quantities?: number[]): number {
  const qty = quantities ?? keys.map(() => 1);
  return keys.reduce((sum, key, i) => sum + shopItems[key].price * qty[i], 0);
}

test.describe('Shopping Cart', () => {
  test.describe('Cart empty state', () => {
    test('empty cart shows the expected state (no rows)', async ({ shoppingCartPage }) => {
      await expect(shoppingCartPage.cartRows).toHaveCount(0);
    });
  });

  test.describe('Adding items', () => {
    test('add one item by key', async ({
      shoppingCartPage,
    }) => {
      await shoppingCartPage.addItemToCart('iphone12');
      await expect(shoppingCartPage.cartRows).toHaveCount(1);
      await expect(shoppingCartPage.cartTotalPrice).toContainText(
        expectedTotal(['iphone12']).toFixed(2),
      );
    });

    test('add several different items by key', async ({
      shoppingCartPage,
    }) => {
      await shoppingCartPage.addItemToCart('iphone12');
      await shoppingCartPage.addItemToCart('nokia');
      await shoppingCartPage.addItemToCart('samsung');
      await expect(shoppingCartPage.cartRows).toHaveCount(3);
      const total = expectedTotal(['iphone12', 'nokia', 'samsung']);
      await expect(shoppingCartPage.cartTotalPrice).toContainText(total.toFixed(2));
    });

    test('add same item multiple times', async ({
      shoppingCartPage,
    }) => {
      await shoppingCartPage.addItemToCart('iphone12');
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
      await shoppingCartPage.addItemToCart('iphone12');
      await dialogHandled;
    });
  });

  test.describe('Quantity', () => {
    test('update quantity to a valid number', async ({
      shoppingCartPage,
    }) => {
      await shoppingCartPage.addItemToCart('iphone12');
      await shoppingCartPage.updateItemQuantity('iphone12', 2);
      await shoppingCartPage.page
        .locator('.cart-items .cart-row')
        .filter({ hasText: shopItems.iphone12.title })
        .locator('input')
        .blur();
      const total = expectedTotal(['iphone12'], [2]);
      await expect(shoppingCartPage.cartTotalPrice).toContainText(total.toFixed(2));
    });

    test('update quantity to 0', async ({ shoppingCartPage }) => {
      await shoppingCartPage.addItemToCart('nokia');
      await shoppingCartPage.updateItemQuantity('nokia', 0);
      const quantityInput = shoppingCartPage.page
        .locator('.cart-items .cart-row')
        .filter({ hasText: shopItems.nokia.title })
        .locator('input');
      await shoppingCartPage.shoppingCartHeader.click();
      await expect(quantityInput).not.toHaveValue('0');
    });

    test('invalid quantity (empty, negative, non-numeric)', async ({
      shoppingCartPage,
    }) => {
      await shoppingCartPage.addItemToCart('samsung');
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
      shoppingCartPage,
    }) => {
      await shoppingCartPage.addItemToCart('iphone12');
      await shoppingCartPage.addItemToCart('nokia');
      await shoppingCartPage.removeItem('iphone12');
      
      await expect(shoppingCartPage.cartRows).toHaveCount(1);
      await expect(shoppingCartPage.cartTotalPrice).toContainText(
        shopItems.nokia.price.toFixed(2),
      );
    });

    test('remove all items', async ({ shoppingCartPage }) => {
      await shoppingCartPage.addItemToCart('nokia');
      await shoppingCartPage.removeItem('nokia');

      await expect(shoppingCartPage.cartRows).toHaveCount(0);
    });

    test('remove one of several items', async ({
      shoppingCartPage,
    }) => {
      await shoppingCartPage.addItemToCart('iphone12');
      await shoppingCartPage.addItemToCart('huawei');
      await shoppingCartPage.addItemToCart('samsung');
      await shoppingCartPage.removeItem('huawei');

      await expect(shoppingCartPage.cartRows).toHaveCount(2);
      const total = expectedTotal(['iphone12', 'samsung']);
      await expect(shoppingCartPage.cartTotalPrice).toContainText(total.toFixed(2));
    });
  });
});
