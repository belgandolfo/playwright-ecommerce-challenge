import { test, testNoAuth, expect } from './fixtures';
import shippingData from '../test-data/shippingData.json';

test.describe('Shipping Details', () => {
  test('fill all fields with valid data', async ({
    userInShippingDetailsPage,
    shippingDetailsPage, 
    orderConfirmationPage,
  }) => {
    await shippingDetailsPage.fillShippingDetails(shippingData.validCustomer);
    await expect(orderConfirmationPage.congratsMessage).toBeVisible();
  });

  // HTML5 validation tooltip text is not in the DOM; assert via input.validationMessage.
  const validationTooltipRegex = /(please\s+)?(submit|fill out|fill in) this field/i;

  test('submit with no phone shows error modal', async ({
    userInShippingDetailsPage, shippingDetailsPage,
  }) => {
    await shippingDetailsPage.fillShippingDetails(shippingData.noPhoneCustomer);
    await expect(shippingDetailsPage.shippingDetailsHeader).toBeVisible();
    const message = await shippingDetailsPage.getValidationMessageForPhoneNumber();
    expect(message).toMatch(validationTooltipRegex);
  });

  test('submit with no street shows error modal', async ({
    userInShippingDetailsPage, shippingDetailsPage
  }) => {
    await shippingDetailsPage.fillShippingDetails(shippingData.noAddressCustomer);
    await expect(shippingDetailsPage.shippingDetailsHeader).toBeVisible();
    const message = await shippingDetailsPage.getValidationMessageForStreet();
    expect(message).toMatch(validationTooltipRegex);
  });

  test('submit with no city shows error modal', async ({
    userInShippingDetailsPage, shippingDetailsPage
  }) => {
    await shippingDetailsPage.fillShippingDetails(shippingData.noCityCustomer);
    await expect(shippingDetailsPage.shippingDetailsHeader).toBeVisible();
    const message = await shippingDetailsPage.getValidationMessageForCity();
    expect(message).toMatch(validationTooltipRegex);
  });

  test('submit with no country changes the color of the country select', async ({
    userInShippingDetailsPage, shippingDetailsPage
  }) => {
    await shippingDetailsPage.fillShippingDetails(shippingData.noCountryCustomer);
    await expect(shippingDetailsPage.shippingDetailsHeader).toBeVisible();
    await expect(shippingDetailsPage.countrySelectPlaceholder).toHaveCSS(
      'color',
      /rgb\s*\(\s*255\s*,\s*0\s*,\s*0\s*\)|red/,
    );
  });

  test('submit with all fields empty shows error modal', async ({
    userInShippingDetailsPage, shippingDetailsPage  
  }) => {
    await shippingDetailsPage.submitOrder();
    await expect(shippingDetailsPage.shippingDetailsHeader).toBeVisible();
    const message = await shippingDetailsPage.getValidationMessageForPhoneNumber();
    expect(message).toMatch(validationTooltipRegex);
  });

  /** 
   * This test is failing because the phone input currently allows non-numeric text,
   * which is not consistent with the rest of the app's behavior.
   */
  test('invalid phone format (letters, too short)', async ({
    userInShippingDetailsPage, shippingDetailsPage  
  }) => {
    // Phone input rejects non-numeric text; Playwright throws when fill is used with letters
    await expect(
      shippingDetailsPage.phoneNumberInput.fill('abc'),
    ).rejects.toThrow(/Cannot type text into input/);
    await shippingDetailsPage.phoneNumberInput.fill('12');
    await expect(shippingDetailsPage.phoneNumberInput).not.toHaveValue('12');
  });
});
