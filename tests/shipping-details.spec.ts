import { test, expect } from '../fixtures/fixtures';
import shippingData from '../test-data/shippingData.json';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage';
import type { ShippingDetailsPage } from '../pages/ShippingDetailsPage';

test.describe('Shipping Details', () => {
  test('fill all fields with valid data', async ({ userInShippingDetailsPage }) => {
    const shippingDetailsPage = userInShippingDetailsPage;
    await shippingDetailsPage.fillShippingDetails(shippingData.validCustomer);
    await shippingDetailsPage.submitOrder();
    const orderConfirmationPage = new OrderConfirmationPage(shippingDetailsPage.page);
    await expect(orderConfirmationPage.congratsMessage).toBeVisible();
  });

  // HTML5 validation tooltip text is not in the DOM; assert via input.validationMessage.
  const validationTooltipRegex = /(please\s+)?(submit|fill out|fill in) this field/i;

  const validationCases: Array<{
    label: string;
    customer: (typeof shippingData)['noPhoneCustomer' | 'noAddressCustomer' | 'noCityCustomer'];
    getMessage: (page: ShippingDetailsPage) => Promise<string>;
  }> = [
    {
      label: 'phone',
      customer: shippingData.noPhoneCustomer,
      getMessage: (p) => p.getValidationMessageForPhoneNumber(),
    },
    {
      label: 'street',
      customer: shippingData.noAddressCustomer,
      getMessage: (p) => p.getValidationMessageForStreet(),
    },
    {
      label: 'city',
      customer: shippingData.noCityCustomer,
      getMessage: (p) => p.getValidationMessageForCity(),
    },
  ];

  for (const { label, customer, getMessage } of validationCases) {
    test(`submit with no ${label} shows error modal`, async ({ userInShippingDetailsPage }) => {
      const shippingDetailsPage = userInShippingDetailsPage;
      await shippingDetailsPage.fillShippingDetails(customer);
      await shippingDetailsPage.submitOrder();
      await expect(shippingDetailsPage.shippingDetailsHeader).toBeVisible();
      const message = await getMessage(shippingDetailsPage);
      expect(message).toMatch(validationTooltipRegex);
    });
  }

  test('submit with no country changes the color of the country select', async ({
    userInShippingDetailsPage,
  }) => {
    const shippingDetailsPage = userInShippingDetailsPage;
    await shippingDetailsPage.fillShippingDetails(shippingData.noCountryCustomer);
    await shippingDetailsPage.submitOrder();
    await expect(shippingDetailsPage.shippingDetailsHeader).toBeVisible();
    await expect(shippingDetailsPage.countrySelectPlaceholder).toHaveCSS(
      'color',
      /rgb\s*\(\s*255\s*,\s*0\s*,\s*0\s*\)|red/,
    );
  });

  test('submit with all fields empty shows error modal', async ({ userInShippingDetailsPage }) => {
    const shippingDetailsPage = userInShippingDetailsPage;
    await shippingDetailsPage.submitOrder();
    await expect(shippingDetailsPage.shippingDetailsHeader).toBeVisible();
    const message = await shippingDetailsPage.getValidationMessageForPhoneNumber();
    expect(message).toMatch(validationTooltipRegex);
  });

  /**
   * This test is failing because the phone input currently allows non-numeric text,
   * which is not consistent with the rest of the app's behavior.
   */
  test('invalid phone format (letters, too short)', async ({ userInShippingDetailsPage }) => {
    const shippingDetailsPage = userInShippingDetailsPage;
    // Phone input rejects non-numeric text; Playwright throws when fill is used with letters
    await expect(shippingDetailsPage.fillPhoneNumber('abc')).rejects.toThrow(
      /Cannot type text into input/,
    );
    await shippingDetailsPage.fillPhoneNumber('12');
    await expect(shippingDetailsPage.phoneNumberInput).not.toHaveValue('12');
  });
});
