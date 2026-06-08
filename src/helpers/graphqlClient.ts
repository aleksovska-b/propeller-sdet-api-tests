import axios from 'axios';

const API_URL = process.env.API_URL ?? 'http://localhost:3000/graphql';

export async function graphqlRequest<TData = unknown>(
  query: string,
  variables: Record<string, unknown> = {},
  tenantId = 'tenant-a',
) {
  return axios.post<{ data?: TData; errors?: unknown[] }>(
    API_URL,
    {
      query,
      variables,
    },
    {
      headers: {
        'x-tenant-id': tenantId,
      },
    },
  );
}
