import { expectSuccessfulResponse } from '../helpers/assertions';
import { graphqlRequest } from '../helpers/graphqlClient';

export type Image = {
  id: string;
  url: string;
  priority: number;
  tenantId: string;
  productId: number | null;
};

export type ImageResponse = {
  image: Image | null;
};

type ImagesResponse = {
  images: Image[];
};

type CreateImageResponse = {
  createImage: Image;
};

type UpdateImageResponse = {
  updateImage: Image;
};

type DeleteImageResponse = {
  deleteImage: boolean;
};

export type ImageInput = {
  url?: string;
  priority?: number;
  productId?: string;
};

const IMAGE_FIELDS = `
  id
  url
  priority
  tenantId
  productId
`;

const IMAGES_QUERY = `
  query Images($productId: Int) {
    images(productId: $productId) {
      ${IMAGE_FIELDS}
    }
  }
`;

const IMAGE_QUERY = `
  query Image($id: Int!) {
    image(id: $id) {
      ${IMAGE_FIELDS}
    }
  }
`;

const CREATE_IMAGE_MUTATION = `
  mutation CreateImage($input: CreateImageInput!) {
    createImage(input: $input) {
      ${IMAGE_FIELDS}
    }
  }
`;

const UPDATE_IMAGE_MUTATION = `
  mutation UpdateImage($id: Int!, $input: UpdateImageInput!) {
    updateImage(id: $id, input: $input) {
      ${IMAGE_FIELDS}
    }
  }
`;

const DELETE_IMAGE_MUTATION = `
  mutation DeleteImage($id: Int!) {
    deleteImage(id: $id)
  }
`;

export async function getImages(tenantId: string, productId?: string): Promise<Image[]> {
  const response = await graphqlRequest<ImagesResponse>(
    IMAGES_QUERY,
    {
      productId: productId === undefined ? undefined : Number(productId),
    },
    tenantId,
  );
  const data = expectSuccessfulResponse(response);

  return data.images;
}

export async function requestImage(tenantId: string, id: string) {
  return graphqlRequest<ImageResponse>(
    IMAGE_QUERY,
    {
      id: Number(id),
    },
    tenantId,
  );
}

export async function requestCreateImageWithInput(
  tenantId: string,
  input: Record<string, unknown>,
) {
  return graphqlRequest<CreateImageResponse>(
    CREATE_IMAGE_MUTATION,
    {
      input,
    },
    tenantId,
  );
}

export async function requestCreateImage(tenantId: string, input: ImageInput) {
  return graphqlRequest<CreateImageResponse>(
    CREATE_IMAGE_MUTATION,
    {
      input: {
        url: input.url ?? `https://example.com/${Date.now()}.jpg`,
        priority: input.priority ?? 100,
        productId: input.productId === undefined ? undefined : Number(input.productId),
      },
    },
    tenantId,
  );
}

export async function requestUpdateImage(tenantId: string, id: string, input: ImageInput) {
  return graphqlRequest<UpdateImageResponse>(
    UPDATE_IMAGE_MUTATION,
    {
      id: Number(id),
      input: {
        url: input.url,
        priority: input.priority,
        productId: input.productId === undefined ? undefined : Number(input.productId),
      },
    },
    tenantId,
  );
}

export async function requestDeleteImage(tenantId: string, id: string) {
  return graphqlRequest<DeleteImageResponse>(
    DELETE_IMAGE_MUTATION,
    {
      id: Number(id),
    },
    tenantId,
  );
}

export async function createImage(tenantId: string, input: ImageInput = {}): Promise<Image> {
  const response = await requestCreateImage(tenantId, input);
  const data = expectSuccessfulResponse(response);

  if (data.createImage.tenantId !== tenantId) {
    throw new Error(`Expected created image to belong to tenant ${tenantId}.`);
  }

  return data.createImage;
}

export async function getImage(tenantId: string, id: string): Promise<Image> {
  const response = await requestImage(tenantId, id);
  const data = expectSuccessfulResponse(response);

  if (!data.image) {
    throw new Error(`Expected image with ID ${id} to be returned.`);
  }

  return data.image;
}

export async function updateImage(
  tenantId: string,
  id: string,
  input: ImageInput,
): Promise<Image> {
  const response = await requestUpdateImage(tenantId, id, input);
  const data = expectSuccessfulResponse(response);

  if (data.updateImage.tenantId !== tenantId) {
    throw new Error(`Expected updated image to belong to tenant ${tenantId}.`);
  }

  return data.updateImage;
}

export async function deleteImage(tenantId: string, id: string): Promise<boolean> {
  const response = await requestDeleteImage(tenantId, id);
  const data = expectSuccessfulResponse(response);

  return data.deleteImage;
}
