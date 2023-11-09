import openapiTS from 'openapi-typescript';
import fs from 'fs';
import url from 'url';

// Generate types from the server API schema and output them to generated-schema.ts
// In order to use 'await', we need to wrap all the code in this lightweight
// async function that is immediately invoked.
(async function generateTypes() {
  const types = await openapiTS('http://localhost:8080/v3/api-docs', {
    transform(schemaObject, metadata) {
      // We need to override the type of SearchNodePayload because otherwise
      // typescript complains about a circular type reference.
      if (metadata.path.endsWith('/SearchNodePayload')) {
        return '{operation: "and" | "field" | "not" | "or"; [key: string]: any;}';
      }
    },
  });

  const path = url.fileURLToPath(new URL('../src/api/types/generated-schema.ts', import.meta.url));
  fs.writeFileSync(path, types);

  console.log(`SUCCESSFULLY completed type overrides and wrote to ${path}`);
})();
