# Propeller SDET API Tests

Automated API tests for the Propeller Junior SDET assignment.

This is a separate Jest test project that exercises the NestJS GraphQL API through its public GraphQL endpoint.

## Tech Stack

- Jest
- TypeScript
- ts-jest
- Axios
- GraphQL over HTTP

## Prerequisites

- Node.js installed
- Docker Desktop running
- The API project cloned separately
- The API available at `http://localhost:3000/graphql`

## Install Dependencies

From this test project folder:

```bash
npm install
```

## Start the API

From the backend API project folder:

```bash
docker-compose up --build
```

In a separate terminal, seed the database:

```bash
docker-compose run --rm seed
```

The API should then be available at:

```text
http://localhost:3000/graphql
```

## Run Tests

From this test project folder:

```bash
npm test
```

On Windows PowerShell, this command also works:

```powershell
& "C:\Program Files\nodejs\node.exe" "C:\Projects\propeller-sdet-api-tests\node_modules\jest\bin\jest.js"
```

To run only image-related tests:

```bash
npm test -- src/images src/relationships/product-images.test.ts
```

To run only product-related tests:

```bash
npm test -- src/products
```

## API URL Configuration

By default, the tests call:

```text
http://localhost:3000/graphql
```

The endpoint can be changed with the `API_URL` environment variable:

```bash
API_URL=http://localhost:3000/graphql npm test
```

PowerShell example:

```powershell
$env:API_URL="http://localhost:3000/graphql"
npm test
```

## Test Coverage

The suite covers:

- Product CRUD operations
- Image CRUD operations
- Product filtering by name, status, and price
- Product pagination
- Product/image relationships
- Multi-tenant data isolation
- Input validation and edge cases
- Error handling for invalid operations

## Project Structure

```text
src/
  helpers/
    assertions.ts
    graphqlClient.ts
  products/
    api.ts
    assertions.ts
    crud.test.ts
    error-handling.test.ts
    filtering.test.ts
    listing.test.ts
    pagination.test.ts
    tenancy.test.ts
    validation.test.ts
  images/
    api.ts
    assertions.ts
    crud.test.ts
    error-handling.test.ts
    tenancy.test.ts
    validation.test.ts
  relationships/
    product-images.test.ts
```

## Bugs Found and Fixed

The tests exposed the following backend issues:

- Product status filtering returned the opposite status.
- Product pagination skipped the first page because the offset calculation was incorrect.
- Product lookup did not enforce tenant isolation.
- Product creation allowed an empty name.
- Product creation and update allowed negative prices.
- Image creation allowed an empty URL.
- Image creation allowed negative priority values.
- Images could be attached to products belonging to another tenant.

Each backend fix was committed separately in the API repository with a message explaining what was broken and why the fix is correct.

## Assumptions

- The API uses the `x-tenant-id` header to determine tenant context.
- Tests create their own tenant IDs and data so they do not depend on seeded data.
- GraphQL validation and domain validation errors are returned in the GraphQL `errors` array.
- The API must be running before the tests are executed.
- The default local API URL is `http://localhost:3000/graphql`.
