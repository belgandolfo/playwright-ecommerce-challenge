/* eslint-disable playwright/no-standalone-expect */
import { test, expect } from '../fixtures/fixtures';
import shopItems from '../test-data/shopItems.json';

function expectedTotal(items: Array<{ price: number }>, quantities?: number[]): number {
  const qty = quantities ?? items.map(() => 1);
  return items.reduce((sum, item, i) => sum + item.price * qty[i], 0);
}

test.describe('Shopping Cart', () => {
  test.describe('Cart empty state', () => {
    test('empty cart shows the expected state (no rows)', async ({ userInShoppingCartPage }) => {
      const shoppingCartPage = userInShoppingCartPage;
      await expect(shoppingCartPage.cartRows).toHaveCount(0);
    });
  });

  test.describe('Adding items', () => {
    test('add one item by key', async ({ userInShoppingCartPage }) => {
      const shoppingCartPage = userInShoppingCartPage;
      await shoppingCartPage.addItemToCart(shopItems.iphone12);
      await expect(shoppingCartPage.cartRows).toHaveCount(1);
      await expect(shoppingCartPage.cartTotalPrice).toContainText(
        expectedTotal([shopItems.iphone12]).toFixed(2),
      );
    });

    test('add several different items by key', async ({ userInShoppingCartPage }) => {
      const shoppingCartPage = userInShoppingCartPage;
      await shoppingCartPage.addItemToCart(shopItems.iphone12);
      await shoppingCartPage.addItemToCart(shopItems.nokia);
      await shoppingCartPage.addItemToCart(shopItems.samsung);
      await expect(shoppingCartPage.cartRows).toHaveCount(3);
      const total = expectedTotal([shopItems.iphone12, shopItems.nokia, shopItems.samsung]);
      await expect(shoppingCartPage.cartTotalPrice).toContainText(total.toFixed(2));
    });

    test('add same item multiple times', async ({ userInShoppingCartPage }) => {
      const dialogHandled = userInShoppingCartPage.waitForNextDialogAndAccept(
        /already added|already in cart/i,
      );
      await userInShoppingCartPage.addItemToCart(shopItems.iphone12);
      await userInShoppingCartPage.addItemToCart(shopItems.iphone12);
      const dialogMessage = await dialogHandled;
      expect(dialogMessage).toMatch(/already added|already in cart/i);
    });
  });

  test.describe('Quantity', () => {
    test('update quantity to a valid number', async ({ userInShoppingCartPage }) => {
      const shoppingCartPage = userInShoppingCartPage;
      await shoppingCartPage.addItemToCart(shopItems.iphone12);
      const cartRow = await shoppingCartPage.getCartRow(shopItems.iphone12);
      await cartRow.updateItemQuantity('2');
      const total = expectedTotal([shopItems.iphone12], [2]);
      await expect(shoppingCartPage.cartTotalPrice).toContainText(total.toFixed(2));
    });

    test('update quantity to 0', async ({ userInShoppingCartPage }) => {
      const shoppingCartPage = userInShoppingCartPage;
      await shoppingCartPage.addItemToCart(shopItems.nokia);

      const cartRow = await shoppingCartPage.getCartRow(shopItems.nokia);
      await cartRow.updateItemQuantity('0');
      await shoppingCartPage.shoppingCartHeader.click();
      expect(await cartRow.getQuantity()).not.toBe('0');
    });

    test('invalid quantity (empty, negative, non-numeric)', async ({ userInShoppingCartPage }) => {
      const shoppingCartPage = userInShoppingCartPage;
      await shoppingCartPage.addItemToCart(shopItems.samsung);
      const cartRow = await shoppingCartPage.getCartRow(shopItems.samsung);
      await cartRow.updateItemQuantity('');
      expect(await cartRow.getQuantity()).not.toBe('');

      await cartRow.updateItemQuantity('-1');
      expect(await cartRow.getQuantity()).not.toBe('-1');

      // input[type=number] rejects non-numeric text; Playwright throws when fill is used with non-numeric
      await expect(cartRow.updateItemQuantity('abc')).rejects.toThrow(
        /Cannot type text into input\[type=number\]/,
      );
    });
  });

  test.describe('Removing items', () => {
    test('remove one item', async ({ userInShoppingCartPage }) => {
      const shoppingCartPage = userInShoppingCartPage;
      await shoppingCartPage.addItemToCart(shopItems.iphone12);
      await shoppingCartPage.addItemToCart(shopItems.nokia);
      const cartRow = await shoppingCartPage.getCartRow(shopItems.iphone12);
      await cartRow.removeItem();

      await expect(shoppingCartPage.cartRows).toHaveCount(1);
      await expect(shoppingCartPage.cartTotalPrice).toContainText(shopItems.nokia.price.toFixed(2));
    });

    test('remove all items', async ({ userInShoppingCartPage }) => {
      const shoppingCartPage = userInShoppingCartPage;
      await shoppingCartPage.addItemToCart(shopItems.nokia);
      const cartRow = await shoppingCartPage.getCartRow(shopItems.nokia);
      await cartRow.removeItem();

      await expect(shoppingCartPage.cartRows).toHaveCount(0);
    });

    test('remove one of several items', async ({ userInShoppingCartPage }) => {
      const shoppingCartPage = userInShoppingCartPage;
      await shoppingCartPage.addItemToCart(shopItems.iphone12);
      await shoppingCartPage.addItemToCart(shopItems.huawei);
      await shoppingCartPage.addItemToCart(shopItems.samsung);
      const cartRow = await shoppingCartPage.getCartRow(shopItems.huawei);
      await cartRow.removeItem();

      await expect(shoppingCartPage.cartRows).toHaveCount(2);
      const total = expectedTotal([shopItems.iphone12, shopItems.samsung]);
      await expect(shoppingCartPage.cartTotalPrice).toContainText(total.toFixed(2));
    });
  });
});
