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

  /**
   * Returns a promise that resolves with the dialog message when the next page dialog (alert/confirm/prompt) is accepted.
   * Call this before the action that triggers the dialog, then await the promise after.
   * If `messagePattern` is provided, the dialog message must match it or the promise rejects.
   */
  waitForNextDialogAndAccept(messagePattern?: RegExp): Promise<string> {
    return new Promise((resolve, reject) => {
      this.page.once('dialog', async (dialog) => {
        try {
          const message = dialog.message();
          if (messagePattern && !messagePattern.test(message)) {
            reject(new Error(`Dialog message did not match ${messagePattern}: "${message}"`));
            return;
          }
          await dialog.accept();
          resolve(message);
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}
