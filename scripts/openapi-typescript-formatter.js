import openapiTS from 'openapi-typescript';
import fs from 'fs';

// Generate types from the server API schema and output them to generated-types.ts
// In order to use 'await', we need to wrap all the code in this lightweight
// async function that is immediately invoked.
(async function generateTypes() {
  const types = await openapiTS('http://localhost:8080/v3/api-docs', {
    formatter(node) {
      // We need to override the type of SearchNodePayload because otherwise
      // typescript complains about a circular type reference. We cannot do the
      // override based on the name "SearchNodePayload" because we don't have
      // access to that within the formatter function. Instead, we check for a
      // keyword that's hardcoded on the server side.
      if (node.description != null && node.description.includes('TYPESCRIPT-OVERRIDE-TYPE-WITH-ANY')) {
        return '{operation: "and" | "field" | "not" | "or"; [key: string]: any;}';
      }
      if (node.description != null && node.description.includes('GEOMETRY-FIX-TYPE-ON-CLIENT-SIDE')) {
        console.log(node);
        return (
          '{' +
          'type: | "Point" | "LineString" | "Polygon" | "MultiPoint"' +
          ' | "MultiLineString" | "MultiPolygon" | "GeometryCollection";' +
          'coordinates: number[];' +
          'crs?: components["schemas"]["CRS"];' +
          '}'
        );

        // "type: components[\"schemas\"][\"LineString\"]" +
        // " | components[\"schemas\"][\"MultiLineString\"]" +
        // " | components[\"schemas\"][\"MultiPoint\"]" +
        // " | components[\"schemas\"][\"MultiPolygon\"]" +
        // " | components[\"schemas\"][\"Point\"]" +
        // " | components[\"schemas\"][\"Polygon\"];" +
      }
    },
  });
  const path = __dirname + '/../src/api/types/generated-schema.ts';
  fs.writeFileSync(path, types);
  console.log('SUCCESSFULLY completed type overrides and wrote to generated-types.ts');
})();
