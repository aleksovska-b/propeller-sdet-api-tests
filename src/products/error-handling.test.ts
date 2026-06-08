import {
  requestDeleteProduct,
  requestProduct,
  requestUpdateProduct,
} from './api';
import { expectProductNotFound } from './assertions';

describe('Products API error handling for invalid operations', () => {
  test('returns not found when requesting a product id that does not exist', async () => {
    const tenantId = createTenantId('product-not-found-test');
    const missingProductId = '999999999';

    const response = await requestProduct(tenantId, missingProductId);

    expectProductNotFound(response, missingProductId);
  });

  test('returns not found when updating a product id that does not exist', async () => {
    const tenantId = createTenantId('product-update-missing-test');
    const missingProductId = '999999999';

    const response = await requestUpdateProduct(tenantId, missingProductId, {
      name: 'Updated Missing Product',
    });

    expectProductNotFound(response, missingProductId);
  });

  test('returns not found when deleting a product id that does not exist', async () => {
    const tenantId = createTenantId('product-delete-missing-test');
    const missingProductId = '999999999';

    const response = await requestDeleteProduct(tenantId, missingProductId);

    expectProductNotFound(response, missingProductId);
  });
});

function createTenantId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}
