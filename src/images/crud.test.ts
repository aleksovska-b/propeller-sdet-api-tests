import {
  createImage,
  deleteImage,
  getImage,
  requestImage,
  updateImage,
} from './api';
import { expectImageNotFound } from './assertions';

describe('Images API CRUD', () => {
  test('creates an image for the request tenant', async () => {
    const tenantId = createTenantId('image-create-test');

    const image = await createImage(tenantId, {
      url: 'https://example.com/created-image.jpg',
      priority: 100,
    });

    expect(image.url).toBe('https://example.com/created-image.jpg');
    expect(image.priority).toBe(100);
    expect(image.tenantId).toBe(tenantId);
    expect(image.productId).toBeNull();
  });

  test('reads an image by id', async () => {
    const tenantId = createTenantId('image-read-test');
    const createdImage = await createImage(tenantId, {
      url: 'https://example.com/readable-image.jpg',
      priority: 100,
    });

    const image = await getImage(tenantId, createdImage.id);

    expect(image).toEqual(
      expect.objectContaining({
        id: createdImage.id,
        url: 'https://example.com/readable-image.jpg',
        tenantId,
      }),
    );
  });

  test('updates an image by id', async () => {
    const tenantId = createTenantId('image-update-test');
    const createdImage = await createImage(tenantId, {
      url: 'https://example.com/image-before-update.jpg',
      priority: 100,
    });

    const updatedImage = await updateImage(tenantId, createdImage.id, {
      url: 'https://example.com/image-after-update.jpg',
      priority: 200,
    });

    expect(updatedImage).toEqual(
      expect.objectContaining({
        id: createdImage.id,
        url: 'https://example.com/image-after-update.jpg',
        priority: 200,
        tenantId,
      }),
    );
  });

  test('deletes an image by id', async () => {
    const tenantId = createTenantId('image-delete-test');
    const createdImage = await createImage(tenantId, {
      url: 'https://example.com/image-to-delete.jpg',
      priority: 100,
    });

    const wasDeleted = await deleteImage(tenantId, createdImage.id);

    expect(wasDeleted).toBe(true);
    const response = await requestImage(tenantId, createdImage.id);

    expectImageNotFound(response, createdImage.id);
  });
});

function createTenantId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}
