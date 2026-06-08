import { AxiosResponse } from 'axios';
import { expectGraphQLError } from '../helpers/assertions';
import { Product } from './api';

type ProductGraphQLErrorResponse = AxiosResponse<{
  data?: unknown;
  errors?: unknown[];
}>;

export function expectProductsForTenant(products: Product[], tenantId: string) {
  expect(products.length).toBeGreaterThan(0);

  for (const product of products) {
    expect(product.tenantId).toBe(tenantId);
  }
}

export function expectProductNotFound(
  response: ProductGraphQLErrorResponse,
  productId: string,
) {
  expectGraphQLError(response, `Product with ID ${productId} not found`);
}
