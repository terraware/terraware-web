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
```

## Reference

See [rtk-codegen.config.ts](../../../rtk-codegen.config.ts) for the configuration used around RTK Query.

## Additional guidelines

For lazy fetches, generally prefer a cached value by passing `true` as the second argument.

Only change one endpoint at a time in order to keep the changes small.
