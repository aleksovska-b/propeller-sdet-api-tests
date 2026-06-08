import { expectSuccessfulResponse } from '../helpers/assertions';
import { graphqlRequest } from '../helpers/graphqlClient';

export type Product = {
  id: string;
  name: string;
  price: number;
  status: string;
  tenantId: string;
};

export type ProductsResponse = {
  products: Product[];
};

export type ProductResponse = {
  product: Product | null;
};

export type ProductInput = {
  name?: string;
  price?: number;
  status?: 'ACTIVE' | 'INACTIVE';
};

type ProductFilterInput = {
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  minPrice?: number;
  maxPrice?: number;
};

type CreateProductResponse = {
  createProduct: Product;
};

type UpdateProductResponse = {
  updateProduct: Product;
};

type DeleteProductResponse = {
  deleteProduct: boolean;
};

const PRODUCT_FIELDS = `
  id
  name
  price
  status
  tenantId
`;

const PRODUCTS_QUERY = `
  query Products {
    products {
      ${PRODUCT_FIELDS}
    }
  }
`;

const PRODUCTS_PAGE_QUERY = `
  query ProductsPage($page: Int, $pageSize: Int) {
    products(page: $page, pageSize: $pageSize) {
      ${PRODUCT_FIELDS}
    }
  }
`;

const PRODUCTS_FILTER_QUERY = `
  query ProductsFilter($filter: ProductFilterInput, $page: Int, $pageSize: Int) {
    products(filter: $filter, page: $page, pageSize: $pageSize) {
      ${PRODUCT_FIELDS}
    }
  }
`;

const PRODUCT_QUERY = `
  query Product($id: Int!) {
    product(id: $id) {
      ${PRODUCT_FIELDS}
    }
  }
`;

const CREATE_PRODUCT_MUTATION = `
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      ${PRODUCT_FIELDS}
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = `
  mutation UpdateProduct($id: Int!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      ${PRODUCT_FIELDS}
    }
  }
`;

const DELETE_PRODUCT_MUTATION = `
  mutation DeleteProduct($id: Int!) {
    deleteProduct(id: $id)
  }
`;

export async function getProducts(tenantId: string): Promise<Product[]> {
  const response = await graphqlRequest<ProductsResponse>(PRODUCTS_QUERY, {}, tenantId);
  const data = expectSuccessfulResponse(response);

  return data.products;
}

export async function getProductPage(
  tenantId: string,
  page: number,
  pageSize: number,
): Promise<Product[]> {
  const response = await graphqlRequest<ProductsResponse>(
    PRODUCTS_PAGE_QUERY,
    {
      page,
      pageSize,
    },
    tenantId,
  );
  const data = expectSuccessfulResponse(response);

  return data.products;
}

export async function getProductsByFilter(
  tenantId: string,
  filter: ProductFilterInput,
  page = 1,
  pageSize = 20,
): Promise<Product[]> {
  const response = await graphqlRequest<ProductsResponse>(
    PRODUCTS_FILTER_QUERY,
    {
      filter,
      page,
      pageSize,
    },
    tenantId,
  );
  const data = expectSuccessfulResponse(response);

  return data.products;
}

export async function requestProduct(tenantId: string, id: string) {
  return graphqlRequest<ProductResponse>(
    PRODUCT_QUERY,
    {
      id: Number(id),
    },
    tenantId,
  );
}

export async function requestCreateProduct(tenantId: string, input: Record<string, unknown>) {
  return graphqlRequest<CreateProductResponse>(
    CREATE_PRODUCT_MUTATION,
    {
      input,
    },
    tenantId,
  );
}

export async function requestUpdateProduct(tenantId: string, id: string, input: ProductInput) {
  return graphqlRequest<UpdateProductResponse>(
    UPDATE_PRODUCT_MUTATION,
    {
      id: Number(id),
      input,
    },
    tenantId,
  );
}

export async function requestDeleteProduct(tenantId: string, id: string) {
  return graphqlRequest<DeleteProductResponse>(
    DELETE_PRODUCT_MUTATION,
    {
      id: Number(id),
    },
    tenantId,
  );
}

export async function getProduct(tenantId: string, id: string): Promise<Product> {
  const response = await requestProduct(tenantId, id);
  const data = expectSuccessfulResponse(response);

  if (!data.product) {
    throw new Error(`Expected product with ID ${id} to be returned.`);
  }

  return data.product;
}

export async function createProduct(
  tenantId: string,
  name: string,
  input: ProductInput = {},
): Promise<Product> {
  const response = await requestCreateProduct(tenantId, {
    name,
    price: input.price ?? 10,
    status: input.status ?? 'ACTIVE',
  });
  const data = expectSuccessfulResponse(response);

  if (data.createProduct.tenantId !== tenantId) {
    throw new Error(`Expected created product to belong to tenant ${tenantId}.`);
  }

  return data.createProduct;
}

export async function createProducts(
  tenantId: string,
  products: Array<{
    name: string;
    price: number;
    status: 'ACTIVE' | 'INACTIVE';
  }>,
): Promise<Product[]> {
  const createdProducts: Product[] = [];

  for (const product of products) {
    createdProducts.push(
      await createProduct(tenantId, product.name, {
        price: product.price,
        status: product.status,
      }),
    );
  }

  return createdProducts;
}

export async function updateProduct(
  tenantId: string,
  id: string,
  input: ProductInput,
): Promise<Product> {
  const response = await requestUpdateProduct(tenantId, id, input);
  const data = expectSuccessfulResponse(response);

  if (data.updateProduct.tenantId !== tenantId) {
    throw new Error(`Expected updated product to belong to tenant ${tenantId}.`);
  }

  return data.updateProduct;
}

export async function deleteProduct(tenantId: string, id: string): Promise<boolean> {
  const response = await requestDeleteProduct(tenantId, id);
  const data = expectSuccessfulResponse(response);

  return data.deleteProduct;
}
