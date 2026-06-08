import { expectGraphQLError } from '../helpers/assertions';
import {
  createProduct,
  requestProduct,
  requestDeleteProduct,
  requestUpdateProduct,
} from './api';

describe('Products API tenancy', () => {
  test('does not allow a tenant to read another tenant product', async () => {
    const owningTenantId = createTenantId('product-owner-tenant');
    const otherTenantId = createTenantId('product-other-tenant');
    const product = await createProduct(owningTenantId, 'Private Product');

    const response = await requestProduct(otherTenantId, product.id);

    expect(response.status).toBe(200);
    expect(response.data.data?.product).toBeUndefined();
    expectGraphQLError(response, `Product with ID ${product.id} not found`);
  });

  test('does not allow a tenant to update another tenant product', async () => {
    const owningTenantId = createTenantId('product-owner-tenant');
    const otherTenantId = createTenantId('product-other-tenant');
    const product = await createProduct(owningTenantId, 'Private Product');

    const response = await requestUpdateProduct(otherTenantId, product.id, {
      name: 'Updated By Wrong Tenant',
    });

    expect(response.status).toBe(200);
    expect(response.data.data?.updateProduct).toBeUndefined();
    expectGraphQLError(response, `Product with ID ${product.id} not found`);
  });

  test('does not allow a tenant to delete another tenant product', async () => {
    const owningTenantId = createTenantId('product-owner-tenant');
    const otherTenantId = createTenantId('product-other-tenant');
    const product = await createProduct(owningTenantId, 'Private Product');

    const response = await requestDeleteProduct(otherTenantId, product.id);

    expect(response.status).toBe(200);
    expect(response.data.data?.deleteProduct).toBeUndefined();
    expectGraphQLError(response, `Product with ID ${product.id} not found`);
  });
});

function createTenantId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}
