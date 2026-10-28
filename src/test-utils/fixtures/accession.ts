import { Accession, ViabilityTest } from 'src/types/Accession';

export const buildViabilityTest = (overrides: Partial<ViabilityTest> = {}): ViabilityTest => ({
  accessionId: 42,
  id: 1,
  seedsTested: 25,
  startDate: '2024-02-01',
  testType: 'Lab',
  seedType: 'Fresh',
  substrate: 'Agar',
  treatment: 'Soak',
  withdrawnByName: 'Test Collector',
  ...overrides,
});

export const buildAccession = (overrides: Partial<Accession> = {}): Accession => ({
  id: 42,
  accessionNumber: '24-1-1-001',
  active: 'Active',
  facilityId: 101,
  hasDeliveries: false,
  state: 'In Storage',
  speciesId: 1,
  speciesScientificName: 'Acacia koa',
  collectedDate: '2024-01-01',
  receivedDate: '2024-01-02',
  remainingQuantity: { quantity: 100, units: 'Seeds' },
  viabilityTests: [],
  withdrawals: [],
  ...overrides,
});
