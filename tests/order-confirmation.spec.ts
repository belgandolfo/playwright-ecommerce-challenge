import { test, expect } from '../fixtures/fixtures';
import shippingData from '../test-data/shippingData.json';

test.describe('Order Confirmation', () => {
  test('confirmation message is shown and its contents are consistent with the order', async ({
    userInOrderConfirmationPage,
  }) => {
    const { orderConfirmationPage, cartTotal } = userInOrderConfirmationPage;
    const { street, city, country } = shippingData.validCustomer;

    await expect(orderConfirmationPage.congratsMessage).toBeVisible();
    await expect(orderConfirmationPage.hasAddressText(street)).toBeVisible();
    await expect(orderConfirmationPage.hasAddressText(city)).toBeVisible();
    await expect(orderConfirmationPage.hasAddressText(country)).toBeVisible();
    await expect(orderConfirmationPage.congratsMessage).toContainText(cartTotal.toFixed(2));
  });
});
