import { expectSuccessfulResponse } from '../helpers/assertions';
import { graphqlRequest } from '../helpers/graphqlClient';
import { createImage, getImages, Image, requestCreateImage } from '../images/api';
import { createProduct, Product } from '../products/api';

type ProductWithImages = Product & {
  images: Image[];
};

type ProductWithImagesResponse = {
  product: ProductWithImages | null;
};

const PRODUCT_WITH_IMAGES_QUERY = `
  query ProductWithImages($id: Int!) {
    product(id: $id) {
      id
      name
      price
      status
      tenantId
      images {
        id
        url
        priority
        tenantId
        productId
      }
    }
  }
`;

describe('Product image relationships', () => {
  test('returns images attached to a product', async () => {
    const tenantId = createTenantId('product-images-test');
    const product = await createProduct(tenantId, 'Product With Images');
    const firstImage = await createImage(tenantId, {
      productId: product.id,
      url: 'https://example.com/product-image-1.jpg',
      priority: 100,
    });
    const secondImage = await createImage(tenantId, {
      productId: product.id,
      url: 'https://example.com/product-image-2.jpg',
      priority: 200,
    });

    const productWithImages = await getProductWithImages(tenantId, product.id);
    const imageIds = productWithImages.images.map((image) => image.id);

    expect(productWithImages.id).toBe(product.id);
    expect(productWithImages.tenantId).toBe(tenantId);
    expect(imageIds).toEqual(expect.arrayContaining([firstImage.id, secondImage.id]));

    for (const image of productWithImages.images) {
      expect(image.tenantId).toBe(tenantId);
      expect(image.productId).toBe(Number(product.id));
    }
  });

  test('filters images by product id', async () => {
    const tenantId = createTenantId('images-product-filter-test');
    const firstProduct = await createProduct(tenantId, 'First Product');
    const secondProduct = await createProduct(tenantId, 'Second Product');
    const firstProductImage = await createImage(tenantId, {
      productId: firstProduct.id,
      url: 'https://example.com/first-product-image.jpg',
    });

    await createImage(tenantId, {
      productId: secondProduct.id,
      url: 'https://example.com/second-product-image.jpg',
    });

    const images = await getImages(tenantId, firstProduct.id);

    expect(images).toHaveLength(1);
    expect(images[0]).toEqual(
      expect.objectContaining({
        id: firstProductImage.id,
        tenantId,
        productId: Number(firstProduct.id),
      }),
    );
  });

  test('does not allow an image to be attached to another tenant product', async () => {
    const owningTenantId = createTenantId('image-owner-tenant');
    const otherTenantId = createTenantId('image-other-tenant');
    const product = await createProduct(owningTenantId, 'Other Tenant Product');

    const response = await requestCreateImage(otherTenantId, {
      productId: product.id,
      url: 'https://example.com/cross-tenant-image.jpg',
    });

    expect(response.status).toBe(200);
    expect(response.data.data?.createImage).toBeUndefined();
    expect(response.data.errors).toBeDefined();
  });
});

async function getProductWithImages(
  tenantId: string,
  productId: string,
): Promise<ProductWithImages> {
  const response = await graphqlRequest<ProductWithImagesResponse>(
    PRODUCT_WITH_IMAGES_QUERY,
    {
      id: Number(productId),
    },
    tenantId,
  );
  const data = expectSuccessfulResponse(response);

  if (!data.product) {
    throw new Error(`Expected product with ID ${productId} to be returned.`);
  }

  return data.product;
}

function createTenantId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}
