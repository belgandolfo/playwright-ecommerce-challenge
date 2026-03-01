import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import shopItems from '../test-data/shopItems.json';

export class ShoppingCartPage extends BasePage {
  readonly shoppingCartHeader: Locator;
  readonly cartTotalTitle: Locator;
  readonly cartTotalPrice: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly addToCartButton: Locator;
  readonly shopItems: Locator;
  readonly quantityInput: Locator;
  readonly removeButton: Locator;
  readonly cartRows: Locator;

  constructor(page: Page) {
    super(page);

    this.shoppingCartHeader = page.getByRole('heading', {
      name: 'SHOPPING CART',
    });
    this.cartTotalTitle = page.locator('.cart-total-title');
    this.cartTotalPrice = page.locator('.cart-total-price');
    this.proceedToCheckoutButton = page.locator('button.btn-purchase');
    this.addToCartButton = page.locator('button.shop-item-button');
    this.shopItems = page.locator('.shop-items');
    this.quantityInput = page.locator('.cart-items .cart-quantity input');
    this.removeButton = page.getByRole('button', { name: 'REMOVE' });
    this.cartRows = page.locator('.cart-items .cart-row');
  }

  /**
   * Would navigate to the shopping cart page if the url changed like in an actual project.
   */
  async goto(): Promise<void> {
    await this.page.goto('https://qa-practice.netlify.app/shopping_cart.html');
  }

  /**
   * Adds a specific shop item to the cart by key from `test-data/shopItems.json`.
   * If the item is already in the cart, the app shows a native alert(); handle it in tests with
   * page.waitForEvent('dialog') before calling this a second time for the same item.
   */
  async addItemToCart(key: keyof typeof shopItems): Promise<void> {
    const item = shopItems[key];
    const itemCard = this.shopItems.locator('.shop-item', {
      has: this.page.locator('.shop-item-title', { hasText: item.title }),
    });

    await itemCard.getByRole('button', { name: 'ADD TO CART' }).click();
  }

  /**
   * Proceeds to checkout.
   */
  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutButton.click();
  }

  /**
   * Updates the quantity for a specific cart item, looked up by key
   * from `test-data/shopItems.json`.
   */
  async updateItemQuantity(key: keyof typeof shopItems, quantity: number): Promise<void> {
    const item = shopItems[key];
    if (!item) {
      throw new Error(`No shop item found for key: ${key}`);
    }

    const cartRow = this.page
      .locator('.cart-items .cart-row')
      .filter({ hasText: item.title });

    await cartRow.locator('input').fill(quantity.toString());
  }

  /**
   * Removes a specific cart item by key from `test-data/shopItems.json`.
   */
  async removeItem(key: keyof typeof shopItems): Promise<void> {
    const item = shopItems[key];
    const cartRow = this.page
      .locator('.cart-items .cart-row')
      .filter({ hasText: item.title });
    await cartRow.getByRole('button', { name: 'REMOVE' }).click();
  }
}
