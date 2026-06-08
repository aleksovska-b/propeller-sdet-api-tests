import {
  createProduct,
  deleteProduct,
  getProduct,
  requestProduct,
  updateProduct,
} from './api';
import { expectProductNotFound } from './assertions';

describe('Products API CRUD', () => {
  test('creates a product for the request tenant', async () => {
    const tenantId = `product-create-test-${Date.now()}`;

    const product = await createProduct(tenantId, 'Created Product', {
      price: 25,
      status: 'ACTIVE',
    });

    expect(product.name).toBe('Created Product');
    expect(product.price).toBe(25);
    expect(product.status).toBe('ACTIVE');
    expect(product.tenantId).toBe(tenantId);
  });

  test('reads a product by id', async () => {
    const tenantId = `product-read-test-${Date.now()}`;
    const createdProduct = await createProduct(tenantId, 'Readable Product');

    const product = await getProduct(tenantId, createdProduct.id);

    expect(product).toEqual(
      expect.objectContaining({
        id: createdProduct.id,
        name: 'Readable Product',
        tenantId,
      }),
    );
  });

  test('updates a product by id', async () => {
    const tenantId = `product-update-test-${Date.now()}`;
    const createdProduct = await createProduct(tenantId, 'Product Before Update');

    const updatedProduct = await updateProduct(tenantId, createdProduct.id, {
      name: 'Product After Update',
      price: 35,
      status: 'INACTIVE',
    });

    expect(updatedProduct).toEqual(
      expect.objectContaining({
        id: createdProduct.id,
        name: 'Product After Update',
        price: 35,
        status: 'INACTIVE',
        tenantId,
      }),
    );
  });

  test('deletes a product by id', async () => {
    const tenantId = `product-delete-test-${Date.now()}`;
    const createdProduct = await createProduct(tenantId, 'Product To Delete');

    const wasDeleted = await deleteProduct(tenantId, createdProduct.id);

    expect(wasDeleted).toBe(true);
    const response = await requestProduct(tenantId, createdProduct.id);

    expectProductNotFound(response, createdProduct.id);
  });
});
