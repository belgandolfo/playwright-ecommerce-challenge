import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly loginHeader: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly badCredentialsMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.loginHeader = page.getByRole('link', { name: 'Login - Shop' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.badCredentialsMessage = page.getByText(
      "Bad credentials! Please try again! Make sure that you've registered.",
    );
  }

  /**
   * Would navigate to the shopping cart page if the url changed like in an actual project.
   */
  async goto(): Promise<void> {
    await this.page.goto('https://qa-practice.netlify.app/auth_ecommerce.html');
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
