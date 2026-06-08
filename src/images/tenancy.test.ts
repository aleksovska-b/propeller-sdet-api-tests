import {
  createImage,
  getImage,
  getImages,
  requestDeleteImage,
  requestImage,
  requestUpdateImage,
} from './api';
import { expectImageNotFound } from './assertions';

describe('Images API tenancy', () => {
  test('does not list images from another tenant', async () => {
    const owningTenantId = createTenantId('image-owner-tenant');
    const otherTenantId = createTenantId('image-other-tenant');
    const owningTenantImage = await createImage(owningTenantId, {
      url: 'https://example.com/owner-tenant-image.jpg',
    });
    const otherTenantImage = await createImage(otherTenantId, {
      url: 'https://example.com/other-tenant-image.jpg',
    });

    const images = await getImages(otherTenantId);
    const imageIds = images.map((image) => image.id);

    expect(imageIds).toContain(otherTenantImage.id);
    expect(imageIds).not.toContain(owningTenantImage.id);

    for (const image of images) {
      expect(image.tenantId).toBe(otherTenantId);
    }
  });

  test('does not allow a tenant to read another tenant image', async () => {
    const owningTenantId = createTenantId('image-owner-tenant');
    const otherTenantId = createTenantId('image-other-tenant');
    const image = await createImage(owningTenantId, {
      url: 'https://example.com/private-image.jpg',
    });

    const response = await requestImage(otherTenantId, image.id);

    expect(response.status).toBe(200);
    expect(response.data.data?.image).toBeUndefined();
    expectImageNotFound(response, image.id);
  });

  test('does not allow a tenant to update another tenant image', async () => {
    const owningTenantId = createTenantId('image-owner-tenant');
    const otherTenantId = createTenantId('image-other-tenant');
    const image = await createImage(owningTenantId, {
      url: 'https://example.com/private-image-before-update.jpg',
    });

    const response = await requestUpdateImage(otherTenantId, image.id, {
      url: 'https://example.com/wrong-tenant-update.jpg',
    });

    expect(response.status).toBe(200);
    expect(response.data.data?.updateImage).toBeUndefined();
    expectImageNotFound(response, image.id);

    const unchangedImage = await getImage(owningTenantId, image.id);
    expect(unchangedImage.url).toBe('https://example.com/private-image-before-update.jpg');
  });

  test('does not allow a tenant to delete another tenant image', async () => {
    const owningTenantId = createTenantId('image-owner-tenant');
    const otherTenantId = createTenantId('image-other-tenant');
    const image = await createImage(owningTenantId, {
      url: 'https://example.com/private-image-to-delete.jpg',
    });

    const response = await requestDeleteImage(otherTenantId, image.id);

    expect(response.status).toBe(200);
    expect(response.data.data?.deleteImage).toBeUndefined();
    expectImageNotFound(response, image.id);

    const stillExistingImage = await getImage(owningTenantId, image.id);
    expect(stillExistingImage.id).toBe(image.id);
  });
});

function createTenantId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}
