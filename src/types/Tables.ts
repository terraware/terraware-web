/**
 * Every material-react-table table whose state is saved.
 *
 * A table's storageKey may change, at the cost of users losing the column, sorting and filter settings saved in
 * their browser. A table's stableId must NEVER change: saved views are stored by stableId, so changing one makes
 * users lose the views they have saved for that table.
 */
export type TableDefinition = {
  storageKey: string;
  stableId: string;
};

export const TABLES = {
  accessions: { storageKey: 'accessions-database-table', stableId: 'accessions' },
  accessionsBySpecies: { storageKey: 'accessions-database-species-table-v4', stableId: 'accessions-by-species' },
  adHocObservations: { storageKey: 'observations-ad-hoc-table', stableId: 'ad-hoc-observations' },
  assignedObservations: { storageKey: 'observations-assigned-table', stableId: 'assigned-observations' },
  inventoryBatchesForNursery: {
    storageKey: 'inventorySeedlingsTable_nursery',
    stableId: 'inventory-batches-for-nursery',
  },
  inventoryBatchesForSpecies: {
    storageKey: 'inventorySeedlingsTable_species',
    stableId: 'inventory-batches-for-species',
  },
  inventoryByBatch: { storageKey: 'inventoryTable_batches', stableId: 'inventory-by-batch' },
  inventoryByNursery: { storageKey: 'inventoryTable_nursery', stableId: 'inventory-by-nursery' },
  inventoryBySpecies: { storageKey: 'inventoryTable_species', stableId: 'inventory-by-species' },
  matrixView: { storageKey: 'matrixView', stableId: 'projects' },
  nurseryWithdrawals: { storageKey: 'nursery-withdrawals-table', stableId: 'nursery-withdrawals' },
  observationMonitoringPlots: {
    storageKey: 'observation-stratum-monitoring-plot-table',
    stableId: 'observation-monitoring-plots',
  },
  observationStrata: { storageKey: 'observation-site-stratum-table', stableId: 'observation-strata' },
  plantingProgressWithStrata: {
    storageKey: 'plantings-progress-table-with-strata',
    stableId: 'planting-progress-with-strata',
  },
  plantingProgressWithoutStrata: {
    storageKey: 'plantings-progress-table-without-strata',
    stableId: 'planting-progress-without-strata',
  },
  seedWithdrawals: { storageKey: 'seeds-withdrawals-table', stableId: 'seed-withdrawals' },
  species: { storageKey: 'species-list-table', stableId: 'species' },
  virtualWalkthroughs: { storageKey: 'virtual-walkthroughs-table', stableId: 'virtual-walkthroughs' },
} as const satisfies Record<string, TableDefinition>;
