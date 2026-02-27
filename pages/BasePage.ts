import type { Locator, Page } from '@playwright/test';

/**
 * Base page object for the QA Practice ecommerce auth flow.
 * Exposes the header navigation controls shared across pages and some reusable actions.
 */
export class BasePage {
  readonly page: Page;
  readonly homeButton: Locator;
  readonly contactButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.homeButton = page.getByRole('link', { name: 'Home' });
    this.contactButton = page.getByRole('link', { name: 'Contact' });
    this.logoutButton = page.getByRole('link', { name: 'Logout' });
  }

  /**
   * Navigates to the ecommerce auth homepage.
   */
  async goto(): Promise<void> {
    await this.page.goto('https://qa-practice.netlify.app/auth_ecommerce.html');
  }

  /**
   * Logs out the user.
   */
  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  /**
   * Navigates to the home page.
   */
  async gotoHome(): Promise<void> {
    await this.homeButton.click();
  }

  /**
   * Navigates to the contact page.
   */
  async gotoContact(): Promise<void> {
    await this.contactButton.click();
  }
}
