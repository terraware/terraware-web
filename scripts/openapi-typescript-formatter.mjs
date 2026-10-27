import fs from 'fs';
import openapiTS, { astToString } from 'openapi-typescript';
import ts from 'typescript';
import url from 'url';

/** Parses a TypeScript type in string form and returns the TypeNode representation. */
const parseType = (typeString) => {
  const sourceFile = ts.createSourceFile(
    'inMemory.ts',
    `type X = ${typeString};`,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );

  const typeAliasDeclaration = sourceFile.statements.find((stmt) => ts.isTypeAliasDeclaration(stmt));

  if (!typeAliasDeclaration) {
    throw new Error('Failed to parse type string.');
  }

  return typeAliasDeclaration.type;
};

/**
 * Generates types from the server API schema and outputs them to generated-schema.ts.
 *
 * In order to use 'await', we need to wrap all the code in this lightweight async function that
 * is immediately invoked.
 */
(async function generateTypes() {
  // Get command-line arguments (skip first two elements: node and script path)
  const args = process.argv.slice(2);

  // Set default value "dev" if no argument is provided
  const mode = args[0] || 'dev';

  let root = 'http://localhost:8080';
  switch (mode) {
    case 'dev':
      root = 'http://localhost:8080';
      break;
    case 'staging':
      root = 'https://staging.terraware.io';
      break;
    case 'prod':
      root = 'https://terraware.io';
      break;
    default:
      console.log(`Unknown input "${input}". Input must be "dev", "staging", or "prod".`);
      return;
  }

  const types = await openapiTS(`${root}/v3/api-docs`, {
    postTransform(schemaObject, metadata) {
      // openapi-typescript generates the discriminator base instead of the union of its subtypes.
      if (metadata.path.endsWith('/SearchNodePayload')) {
        return parseType(
          'components["schemas"]["AndNodePayload"]' +
            ' | components["schemas"]["FieldNodePayload"]' +
            ' | components["schemas"]["NotNodePayload"]' +
            ' | components["schemas"]["OrNodePayload"]'
        );
      }

      // Work around https://github.com/openapi-ts/openapi-typescript/issues/1957
      if (metadata.path.endsWith('/CreateSavedDocumentVersionRequestPayload')) {
        return parseType('{isSubmitted?: boolean; name: string;}');
      }
    },
  });

  const path = url.fileURLToPath(new URL('../src/api/types/generated-schema.ts', import.meta.url));
  // Search node types extend SearchNodePayload, which is overridden above as their union, so
  // drop the base type to avoid a circular reference.
  const content = astToString(types).replace(
    /Omit<components\["schemas"\]\["SearchNodePayload"\], "operation"> & /g,
    ''
  );
  fs.writeFileSync(path, content);

  console.log(`SUCCESSFULLY completed type overrides and wrote to ${path}`);
})();
