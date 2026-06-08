import { getProducts } from './api';
import { expectProductsForTenant } from './assertions';

describe('Products API listing', () => {
  test.each(['tenant-a', 'tenant-b'])('lists products for %s', async (tenantId) => {
    const products = await getProducts(tenantId);

    expectProductsForTenant(products, tenantId);
  });
});
