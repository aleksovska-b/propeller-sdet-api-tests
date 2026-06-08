import { createProducts, getProductsByFilter, Product } from './api';

describe('Products API filtering', () => {
  test('filters products by partial name case-insensitively', async () => {
    const tenantId = createTenantId('product-name-filter-test');

    await createProducts(tenantId, [
      { name: 'Beta Product 1', price: 10, status: 'ACTIVE' },
      { name: 'Beta Product 2', price: 20, status: 'ACTIVE' },
      { name: 'Alpha Filter Product 1', price: 30, status: 'ACTIVE' },
      { name: 'Alpha Filter Product 2', price: 40, status: 'ACTIVE' },
    ]);

    const products = await getProductsByFilter(tenantId, { name: 'ALPHA filter' }, 1, 20);

    expect(products).toHaveLength(2);
    expectProductsBelongToTenant(products, tenantId);

    for (const product of products) {
      expect(product.name.toLowerCase()).toContain('alpha filter');
    }
  });

  test('returns no products when the name filter has no matches', async () => {
    const tenantId = createTenantId('product-name-no-match-test');

    await createManyProducts(tenantId, 25, 'Beta Only Product', 'ACTIVE', 10);

    const products = await getProductsByFilter(tenantId, { name: 'ALPHA filter' }, 1, 20);

    expect(products).toEqual([]);
  });

  test.each(['ACTIVE', 'INACTIVE'] as const)('filters products by %s status', async (status) => {
    const tenantId = createTenantId(`product-status-filter-test-${status.toLowerCase()}`);
    const oppositeStatus = status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    await createProducts(tenantId, [
      { name: `${status} Product 1`, price: 10, status },
      { name: `${status} Product 2`, price: 20, status },
      { name: `${oppositeStatus} Product 1`, price: 30, status: oppositeStatus },
      { name: `${oppositeStatus} Product 2`, price: 40, status: oppositeStatus },
    ]);

    const products = await getProductsByFilter(tenantId, { status }, 1, 20);

    expect(products).toHaveLength(2);
    expectProductsBelongToTenant(products, tenantId);

    for (const product of products) {
      expect(product.status).toBe(status);
    }
  });

  test.each(['ACTIVE', 'INACTIVE'] as const)(
    'returns no products when no product has %s status',
    async (status) => {
      const tenantId = createTenantId(`product-status-no-match-test-${status.toLowerCase()}`);
      const oppositeStatus = status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

      await createManyProducts(tenantId, 25, `${oppositeStatus} Product`, oppositeStatus, 10);

      const products = await getProductsByFilter(tenantId, { status }, 1, 20);

      expect(products).toEqual([]);
    },
  );

  test('filters products by minimum and maximum price', async () => {
    const tenantId = createTenantId('product-price-filter-test');

    await createProducts(tenantId, [
      { name: 'Low Price Product 1', price: 10, status: 'ACTIVE' },
      { name: 'Low Price Product 2', price: 20, status: 'ACTIVE' },
      { name: 'Matching Price Product 1', price: 40, status: 'ACTIVE' },
      { name: 'Matching Price Product 2', price: 50, status: 'ACTIVE' },
    ]);

    const products = await getProductsByFilter(
      tenantId,
      {
        minPrice: 40,
        maxPrice: 60,
      },
      1,
      20,
    );

    expect(products).toHaveLength(2);
    expectProductsBelongToTenant(products, tenantId);

    for (const product of products) {
      expect(product.price).toBeGreaterThanOrEqual(40);
      expect(product.price).toBeLessThanOrEqual(60);
    }
  });

  test('returns no products when the price filter has no matches', async () => {
    const tenantId = createTenantId('product-price-no-match-test');

    await createManyProducts(tenantId, 25, 'Outside Price Product', 'ACTIVE', 10);

    const products = await getProductsByFilter(
      tenantId,
      {
        minPrice: 40,
        maxPrice: 60,
      },
      1,
      20,
    );

    expect(products).toEqual([]);
  });
});

function createTenantId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

function expectProductsBelongToTenant(products: Product[], tenantId: string) {
  for (const product of products) {
    expect(product.tenantId).toBe(tenantId);
  }
}

async function createManyProducts(
  tenantId: string,
  count: number,
  namePrefix: string,
  status: 'ACTIVE' | 'INACTIVE',
  price: number,
) {
  await createProducts(
    tenantId,
    Array.from({ length: count }, (_, index) => ({
      name: `${namePrefix} ${index + 1}`,
      price,
      status,
    })),
  );
}
