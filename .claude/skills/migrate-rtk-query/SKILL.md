---
name: migrate-rtk-query
description: Moves code from using redux and/or direct queries/mutations to using RTK Query.
---

# Migrate to RTK Query

## Instructions

Copy this checklist and check off items as you complete them. Note that some items are conditional.

```
Task Progress:
- [ ] Create a new QueryTagType if needed.
- [ ] Add a new output file and filter to `rtk-codegen.config.ts` if needed. The filter will use the endpoints that are in the service.
- [ ] Run `yarn generate-queries` to create/update the generated file(s).
- [ ] Add or update the corresponding extension file for the queries/mutations, setting the provides and invalidates tags properly.
- [ ] Replace fetch or mutate usages for a single endpoint with the new RTK Query usage.
- [ ] Remove the redux dispatches and selectors.
- [ ] Remove the redux reducer if needed.
- [ ] Remove the redux slice if needed.
- [ ] Remove the redux store if needed.
- [ ] Remove the service methods used to do the old querying/mutating.
- [ ] Reroute related type declarations in `src/types/*` to use the RTK Query generated types (import from `src/queries/generated/*`) instead of `generated-schema`.
- [ ] Remove type declarations that become unused after the old service/redux code is deleted.
```

## Reference

See [rtk-codegen.config.ts](../../../rtk-codegen.config.ts) for the configuration used around RTK Query.

## Additional guidelines

For lazy fetches, generally prefer a cached value by passing `true` as the second argument.

Only change one endpoint at a time in order to keep the changes small.

### Known flaky generation: `GeometryCollection`

`yarn generate-queries` sometimes regenerates the `GeometryCollection` type (e.g. in
`src/queries/generated/observations.ts`) incorrectly. The bad output makes **two** changes at once:

1. `geometries` is typed as `object[]` instead of the proper recursive union.
2. The whole `GeometryCollection` block is **moved out of alphabetical order** — it gets placed
   right after `MergeOtherSpeciesRequestPayload` / before `LineString`, instead of its correct spot
   after `MultiPolygon` and before `export type Geometry = ...`.

Incorrect (flaky) output:

```ts
export type MergeOtherSpeciesRequestPayload = {
  /* ... */
};
export type GeometryCollection = {
  type: 'GeometryCollection';
} & GeometryBase & {
    geometries: object[];
    type: 'GeometryCollection';
  };
export type LineString = {
  /* ... */
};
// ... MultiPolygon ends here, and GeometryCollection is NO LONGER between it and Geometry ...
export type Geometry = GeometryCollection | LineString | MultiLineString | MultiPoint | MultiPolygon | Point | Polygon;
```

Correct output (block sits between `MultiPolygon` and `Geometry`, with the full union):

```ts
export type MultiPolygon = {
  type: 'MultiPolygon';
} & GeometryBase & {
    coordinates: number[][][][];
    type: 'MultiPolygon';
  };
export type GeometryCollection = {
  type: 'GeometryCollection';
} & GeometryBase & {
    geometries: (GeometryCollection | LineString | MultiLineString | MultiPoint | MultiPolygon | Point | Polygon)[];
    type: 'GeometryCollection';
  };
export type Geometry = GeometryCollection | LineString | MultiLineString | MultiPoint | MultiPolygon | Point | Polygon;
```

So reverting is more than a one-line edit — you must both restore the `geometries` union **and** move
the block back to its correct position. If the migration did not otherwise intend to change this
generated file, the simplest fix is `git checkout -- src/queries/generated/observations.ts`. If the
file has other intended changes, check `git diff` and manually revert only the two spurious
`GeometryCollection` hunks (the relocation and the `object[]` line).
