import {
  requestDeleteImage,
  requestImage,
  requestUpdateImage,
} from './api';
import { expectImageNotFound } from './assertions';

describe('Images API error handling for invalid operations', () => {
  test('returns not found when requesting an image id that does not exist', async () => {
    const tenantId = createTenantId('image-not-found-test');
    const missingImageId = '999999999';

    const response = await requestImage(tenantId, missingImageId);

    expectImageNotFound(response, missingImageId);
  });

  test('returns not found when updating an image id that does not exist', async () => {
    const tenantId = createTenantId('image-update-missing-test');
    const missingImageId = '999999999';

    const response = await requestUpdateImage(tenantId, missingImageId, {
      url: 'https://example.com/updated-missing-image.jpg',
    });

    expectImageNotFound(response, missingImageId);
  });

  test('returns not found when deleting an image id that does not exist', async () => {
    const tenantId = createTenantId('image-delete-missing-test');
    const missingImageId = '999999999';

    const response = await requestDeleteImage(tenantId, missingImageId);

    expectImageNotFound(response, missingImageId);
  });
});

function createTenantId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}
