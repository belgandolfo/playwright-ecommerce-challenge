import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import shopItems from '../test-data/shopItems.json';
import { CartRow } from './components/CartRow';

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

  //Components
  async getCartRow(item: (typeof shopItems)[keyof typeof shopItems]): Promise<CartRow> {
    return new CartRow(this.page, item);
  }

  /**
   * Would navigate to the shopping cart page if the url changed like in an actual project.
   */
  async goto(): Promise<void> {
    await this.page.goto('/shopping_cart.html');
  }

  /**
   * Adds a specific shop item to the cart by key from `test-data/shopItems.json`.
   * If the item is already in the cart, the app shows a native alert(); handle it in tests with
   * page.waitForEvent('dialog') before calling this a second time for the same item.
   */
  async addItemToCart(item: (typeof shopItems)[keyof typeof shopItems]): Promise<void> {
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
}
