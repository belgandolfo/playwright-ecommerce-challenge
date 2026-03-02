import type { Locator, Page } from '@playwright/test';
import shopItems from '../../test-data/shopItems.json';

export class CartRow {
  readonly root: Locator;
  readonly quantityInput: Locator;
  readonly removeButton: Locator;

  constructor(page: Page, item: (typeof shopItems)[keyof typeof shopItems]) {
    this.root = page.locator('.cart-items .cart-row').filter({ hasText: item.title });
    this.quantityInput = this.root.locator('input');
    this.removeButton = this.root.getByRole('button', { name: 'REMOVE' });
  }

  /**
   * Updates the quantity for a specific cart item (e.g. shopItems.samsung).
   */
  async updateItemQuantity(quantity: string): Promise<void> {
    await this.quantityInput.fill(quantity);
    await this.quantityInput.blur();
  }

  /**
   * Removes a specific cart item by key from `test-data/shopItems.json`.
   */
  async removeItem(): Promise<void> {
    await this.removeButton.click();
  }

  async getQuantity(): Promise<string> {
    return this.quantityInput.inputValue();
  }
}
