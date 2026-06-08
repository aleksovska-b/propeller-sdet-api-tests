import {
  createProduct,
  getProductPage,
} from './api';

describe('Products API pagination', () => {
  test('uses one-based pagination for product pages', async () => {
    const tenantId = `pagination-test-${Date.now()}`;

    await createProduct(tenantId, 'Pagination Test Product 1');
    await createProduct(tenantId, 'Pagination Test Product 2');
    await createProduct(tenantId, 'Pagination Test Product 3');

    const firstPageProducts = await getProductPage(tenantId, 1, 2);
    const secondPageProducts = await getProductPage(tenantId, 2, 2);

    expect(firstPageProducts).toHaveLength(2);
    expect(secondPageProducts).toHaveLength(1);

    for (const product of [...firstPageProducts, ...secondPageProducts]) {
      expect(product.tenantId).toBe(tenantId);
    }
  });
});
