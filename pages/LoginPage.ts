import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly loginHeader: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly badCredentialsMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginHeader = page.getByRole('link', { name: 'Login - Shop' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.badCredentialsMessage = page.getByText(
      "Bad credentials! Please try again! Make sure that you've registered.",
    );
  }

  /**
   * Navigates to the login page.
   */
  async goto(): Promise<void> {
    await this.page.goto('/auth_ecommerce.html');
  }

  /**
   * Logs in the user.
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
