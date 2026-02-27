import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import shippingData from '../test-data/shippingData.json';

export class ShippingDetailsPage extends BasePage {
  readonly shippingDetailsHeader: Locator;
  readonly phoneNumberInput: Locator;
  readonly streetInput: Locator;
  readonly cityInput: Locator;
  readonly countrySelect: Locator;
  readonly submitOrderButton: Locator;

  constructor(page: Page) {
    super(page);

    this.shippingDetailsHeader = page.getByRole('heading', {
      name: 'Shipping Details',
      level: 2,
    });
    this.phoneNumberInput = page.locator('#phone');
    this.streetInput = page.locator('input[name="street"]');
    this.cityInput = page.locator('input[name="city"]');
    this.countrySelect = page.locator('#countries_dropdown_menu');
    this.submitOrderButton = page.getByRole('button', { name: 'Submit Order' });
  }

  /**
   * Would navigate to the shipping details page if the url changed like in an actual project.
   */
  async goto(): Promise<void> {
    await this.page.goto('https://qa-practice.netlify.app/shipping_details.html');
  }

  /**
   * Fills in the shipping details form using a record identified by alias
   * from `test-data/shippingData.json`.
   */
  async fillShippingDetails(alias: string): Promise<void> {
    const record = shippingData.find((entry) => entry.alias === alias);

    if (!record) {
      throw new Error(`No shipping data found for alias: ${alias}`);
    }

    await this.phoneNumberInput.fill(record.phoneNumber);
    await this.streetInput.fill(record.street);
    await this.cityInput.fill(record.city);
    await this.countrySelect.selectOption({ label: record.country });
    await this.submitOrderButton.click();
  }
  /**
   * Clicks the submit order button on the shipping details form.
   */
  async submitOrder(): Promise<void> {
    await this.submitOrderButton.click();
  }
}
