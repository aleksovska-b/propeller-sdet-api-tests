import {
  requestCreateImage,
  requestCreateImageWithInput,
} from './api';

describe('Images API validation and edge cases', () => {
  test('rejects creating an image without a required url', async () => {
    const tenantId = createTenantId('image-missing-url-test');

    const response = await requestCreateImageWithInput(tenantId, {
      priority: 100,
    });

    expect(response.status).toBe(200);
    expect(response.data.data?.createImage).toBeUndefined();
    expect(response.data.errors).toBeDefined();
  });

  test('rejects creating an image with an empty url', async () => {
    const tenantId = createTenantId('image-empty-url-test');

    const response = await requestCreateImageWithInput(tenantId, {
      url: '',
      priority: 100,
    });

    expect(response.status).toBe(200);
    expect(response.data.data?.createImage).toBeUndefined();
    expect(response.data.errors).toBeDefined();
  });

  test('rejects creating an image with a negative priority', async () => {
    const tenantId = createTenantId('image-negative-priority-test');

    const response = await requestCreateImageWithInput(tenantId, {
      url: 'https://example.com/negative-priority-image.jpg',
      priority: -1,
    });

    expect(response.status).toBe(200);
    expect(response.data.data?.createImage).toBeUndefined();
    expect(response.data.errors).toBeDefined();
  });

  test('rejects attaching an image to a product id that does not exist', async () => {
    const tenantId = createTenantId('image-missing-product-test');
    const missingProductId = '999999999';

    const response = await requestCreateImage(tenantId, {
      productId: missingProductId,
      url: 'https://example.com/missing-product-image.jpg',
    });

    expect(response.status).toBe(200);
    expect(response.data.data?.createImage).toBeUndefined();
    expect(response.data.errors).toBeDefined();
  });
});

function createTenantId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}
