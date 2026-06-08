import {
  createProduct,
  requestCreateProduct,
  requestUpdateProduct,
} from './api';

describe('Products API validation and edge cases', () => {
  test('rejects creating a product without a required name', async () => {
    const tenantId = createTenantId('product-missing-name-test');

    const response = await requestCreateProduct(tenantId, {
      price: 10,
      status: 'ACTIVE',
    });

    expect(response.status).toBe(200);
    expect(response.data.data?.createProduct).toBeUndefined();
    expect(response.data.errors).toBeDefined();
  });

  test('rejects creating a product with an invalid status', async () => {
    const tenantId = createTenantId('product-invalid-status-test');

    const response = await requestCreateProduct(tenantId, {
      name: 'Invalid Status Product',
      price: 10,
      status: 'ARCHIVED',
    });

    expect(response.status).toBe(200);
    expect(response.data.data?.createProduct).toBeUndefined();
    expect(response.data.errors).toBeDefined();
  });

  test('rejects creating a product with an empty name', async () => {
    const tenantId = createTenantId('product-empty-name-test');

    const response = await requestCreateProduct(tenantId, {
      name: '',
      price: 10,
      status: 'ACTIVE',
    });

    expect(response.status).toBe(200);
    expect(response.data.data?.createProduct).toBeUndefined();
    expect(response.data.errors).toBeDefined();
  });

  test('rejects creating a product with a negative price', async () => {
    const tenantId = createTenantId('product-negative-price-test');

    const response = await requestCreateProduct(tenantId, {
      name: 'Negative Price Product',
      price: -1,
      status: 'ACTIVE',
    });

    expect(response.status).toBe(200);
    expect(response.data.data?.createProduct).toBeUndefined();
    expect(response.data.errors).toBeDefined();
  });

  test('rejects updating a product with a negative price', async () => {
    const tenantId = createTenantId('product-update-negative-price-test');
    const product = await createProduct(tenantId, 'Product Before Invalid Update');

    const response = await requestUpdateProduct(tenantId, product.id, {
      price: -1,
    });

    expect(response.status).toBe(200);
    expect(response.data.data?.updateProduct).toBeUndefined();
    expect(response.data.errors).toBeDefined();
  });
});

function createTenantId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}
