import { AxiosResponse } from 'axios';

type GraphQLResponse<TData> = AxiosResponse<{
  data?: TData;
  errors?: unknown[];
}>;

export function expectSuccessfulResponse<TData>(response: GraphQLResponse<TData>): TData {
  expect(response.status).toBe(200);
  expect(response.data.errors).toBeUndefined();

  const data = response.data.data;

  if (data === undefined) {
    throw new Error('Expected GraphQL response data to be returned.');
  }

  return data;
}

export function expectGraphQLError<TData>(response: GraphQLResponse<TData>, message: string) {
  expect(response.status).toBe(200);
  expect(response.data.errors).toBeDefined();
  expect(response.data.errors?.[0]).toEqual(
    expect.objectContaining({
      message,
    }),
  );
}
