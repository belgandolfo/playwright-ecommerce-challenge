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
  /** Message shown when required fields are missing (e.g. "Please submit this field"). */
  readonly validationMessage: Locator;
  /** Country select placeholder / first option (e.g. "Select a country") when in error state. */
  readonly countrySelectPlaceholder: Locator;

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
    this.validationMessage = page.getByText(/please submit this field/i);
    this.countrySelectPlaceholder = page.getByText(/select a country/i);
  }

  /**
   * Would navigate to the shipping details page if the url changed like in an actual project.
   */
  async goto(): Promise<void> {
    await this.page.goto('/shipping_details.html');
  }

  /**
   * Fills in the shipping details form using a record identified by key
   * from `test-data/shippingData.json`.
   */
  async fillShippingDetails(record: typeof shippingData[keyof typeof shippingData]): Promise<void> {
    record.phoneNumber && await this.phoneNumberInput.fill(record.phoneNumber);
    record.street && await this.streetInput.fill(record.street);
    record.city && await this.cityInput.fill(record.city);
    record.country && await this.countrySelect.selectOption({ label: record.country });
    await this.submitOrderButton.click();
  }
  /**
   * Clicks the submit order button on the shipping details form.
   */
  async submitOrder(): Promise<void> {
    await this.submitOrderButton.click();
  }

  /**
   * Returns the HTML5 validation message for the phone number input.
   */
  async getValidationMessageForPhoneNumber(): Promise<string> {
    return this.getValidationMessage(this.phoneNumberInput);
  }

  /**
   * Returns the HTML5 validation message for the street input.
   */
  async getValidationMessageForStreet(): Promise<string> {
    return this.getValidationMessage(this.streetInput);
  }

  /**
   * Returns the HTML5 validation message for the city input.
   */
  async getValidationMessageForCity(): Promise<string> {
    return this.getValidationMessage(this.cityInput);
  }

  /**
 * Returns the HTML5 validation message for a form control (the text the browser shows in the
 * tooltip when the field is invalid). Use after submit to assert the validation tooltip content.
 */
  private async getValidationMessage(locator: Locator): Promise<string> {
    return locator.evaluate((el) => {
      const formControl = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      return formControl.validationMessage ?? '';
    });
  }
}
