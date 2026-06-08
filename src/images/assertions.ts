import { AxiosResponse } from 'axios';

import { expectGraphQLError } from '../helpers/assertions';

type ImageGraphQLErrorResponse = AxiosResponse<{
  data?: unknown;
  errors?: unknown[];
}>;

export function expectImageNotFound(response: ImageGraphQLErrorResponse, imageId: string) {
  expectGraphQLError(response, `Image with ID ${imageId} not found`);
}
