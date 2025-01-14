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
  const types = await openapiTS('http://localhost:8080/v3/api-docs', {
    postTransform(schemaObject, metadata) {
      // We need to override the type of SearchNodePayload because otherwise
      // typescript complains about a circular type reference.
      if (metadata.path.endsWith('/SearchNodePayload')) {
        return parseType('{operation: "and" | "field" | "not" | "or"; [key: string]: any;}');
      }

      if (metadata.path.endsWith('/SearchRequestPayload')) {
        return parseType(
          '{' +
            ' count?: number;' +
            ' cursor?: string;' +
            ' fields: string[];' +
            ' prefix?: string;' +
            ' search?: components["schemas"]["SearchNodePayload"];' +
            ' sortOrder?: components["schemas"]["SearchSortOrderElement"][];' +
            '}'
        );
      }

      // Work around https://github.com/openapi-ts/openapi-typescript/issues/1957
      if (metadata.path.endsWith('/SearchSortOrderElement')) {
        return parseType('{field: string; direction?: "Ascending"|"Descending";}');
      }
      if (metadata.path.endsWith('/CreateSavedDocumentVersionRequestPayload')) {
        return parseType('{isSubmitted?: boolean; name: string;}');
      }
    },
  });

  const path = url.fileURLToPath(new URL('../src/api/types/generated-schema.ts', import.meta.url));
  fs.writeFileSync(path, astToString(types));

  console.log(`SUCCESSFULLY completed type overrides and wrote to ${path}`);
})();
