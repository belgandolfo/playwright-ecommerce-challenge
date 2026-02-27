import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import shopItems from '../test-data/shopItems.json';

export class ShoppingCartPage extends BasePage {
  readonly cartTotalTitle: Locator;
  readonly cartTotalPrice: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly addToCartButton: Locator;
  readonly shopItems: Locator;
  readonly quantityInput: Locator;
  readonly removeButton: Locator;

  constructor(page: Page) {
    super(page);

    this.cartTotalTitle = page.locator('.cart-total-title');
    this.cartTotalPrice = page.locator('.cart-total-price');
    this.proceedToCheckoutButton = page.locator('button.btn-purchase');
    this.addToCartButton = page.locator('button.shop-item-button');
    this.shopItems = page.locator('.shop-items');
    this.quantityInput = page.locator('.cart-items .cart-quantity input');
    this.removeButton = page.getByRole('button', { name: 'REMOVE' });
  }

  /**
   * Would navigate to the shopping cart page if the url changed like in an actual project.
   */
  async goto(): Promise<void> {
    await this.page.goto('https://qa-practice.netlify.app/shopping_cart.html');
  }

  /**
   * Adds a specific shop item to the cart by its title.
   */
  async addItemToCart(itemTitle: string): Promise<void> {
    const itemCard = this.shopItems.locator('.shop-item', {
      has: this.page.locator('.shop-item-title', { hasText: itemTitle }),
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
   * Updates the quantity for a specific cart item, looked up by alias
   * from `test-data/shopItems.json`.
   */
  async updateItemQuantity(alias: string, quantity: number): Promise<void> {
    const item = shopItems.find((entry) => entry.alias === alias);

    if (!item) {
      throw new Error(`No shop item found for alias: ${alias}`);
    }

    const cartRow = this.page
      .locator('.cart-items .cart-row')
      .filter({ hasText: item.title });

    await cartRow.locator('input').fill(quantity.toString());
  }
}
