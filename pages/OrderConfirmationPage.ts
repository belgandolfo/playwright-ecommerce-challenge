import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class OrderConfirmationPage extends BasePage {
  readonly congratsMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.congratsMessage = page.locator('#message');
  }

  /**
   * Would navigate to the order confirmation page if the url changed like in an actual project.
   */
  async goto(): Promise<void> {
    await this.page.goto('/order_confirmation.html');
  }
}
