import React from 'react';

import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import PurposeAndDestinationStep from 'src/scenes/InventoryRouter/BatchWithdrawModal/PurposeAndDestinationStep';
import QuantitiesStep from 'src/scenes/InventoryRouter/BatchWithdrawModal/QuantitiesStep';
import {
  BatchInfo,
  BatchWithdrawDraft,
  PlantingDateForWithdrawal,
} from 'src/scenes/InventoryRouter/BatchWithdrawModal/types';
import strings from 'src/strings';
import { mockGet, renderWithProviders } from 'src/test-utils';
import { NurseryWithdrawalRequestPurposes } from 'src/types/Batch';

const PLANTING_SITE_ID = 10;
const PLANTING_SEASON_ID = 20;
const PLANTING_DATE_ID = 30;
const STRATUM_ID = 40;
const INCLUDED_SUBSTRATUM_ID = 50;
const EXCLUDED_SUBSTRATUM_ID = 51;

const batch = (overrides: Partial<BatchInfo> = {}): BatchInfo => ({
  batchId: 1,
  batchNumber: '24-1-001',
  speciesId: 100,
  scientificName: 'Acacia koa',
  facilityId: 100,
  facilityName: 'Test Nursery',
  germinatingQuantity: 0,
  activeGrowthQuantity: 0,
  hardeningOffQuantity: 0,
  readyQuantity: 100,
  totalQuantity: 100,
  ...overrides,
});

const draft = (overrides: Partial<BatchWithdrawDraft> = {}): BatchWithdrawDraft => ({
  purpose: NurseryWithdrawalRequestPurposes.OUTPLANT,
  fromFacilityId: 100,
  plantingSiteId: PLANTING_SITE_ID,
  plantingSeasonId: PLANTING_SEASON_ID,
  scheduledPlantingDateRequestId: PLANTING_DATE_ID,
  stratumId: STRATUM_ID,
  substratumId: INCLUDED_SUBSTRATUM_ID,
  withdrawnDate: '2027-01-01',
  notes: '',
  withdrawByBatch: {},
  photos: [],
  ...overrides,
});

const plantingDate = (overrides: Partial<PlantingDateForWithdrawal> = {}): PlantingDateForWithdrawal => ({
  scheduledPlantingDateId: PLANTING_DATE_ID,
  date: '2027-02-10',
  plantingSeasonId: PLANTING_SEASON_ID,
  plantingSeasonName: 'Wet Season',
  plantingSiteId: PLANTING_SITE_ID,
  plantingSiteName: 'North Site',
  status: 'Partial',
  speciesNames: ['Acacia koa'],
  speciesCount: 1,
  requestedPlants: 75,
  withdrawnPlants: 50,
  species: [],
  substrata: [
    {
      substratumId: INCLUDED_SUBSTRATUM_ID,
      substratumName: 'Included Substratum',
      stratumId: STRATUM_ID,
      stratumName: 'Included Stratum',
      species: [
        {
          speciesId: 100,
          scientificName: 'Acacia koa',
          quantity: 75,
          withdrawnQuantity: 50,
        },
      ],
    },
  ],
  ...overrides,
});

const mockPlantingDestinations = () => {
  mockGet('/api/v1/projects', { projects: [] });
  mockGet('/api/v1/tracking/sites', {
    sites: [
      {
        id: PLANTING_SITE_ID,
        name: 'North Site',
        organizationId: 1,
        adHocPlots: [],
        strata: [
          {
            id: STRATUM_ID,
            name: 'Included Stratum',
            areaHa: 1,
            boundary: { type: 'MultiPolygon', coordinates: [] },
            boundaryModifiedTime: '2027-01-01T00:00:00Z',
            initialPlantingDensity: 1,
            numPermanentPlots: 0,
            numTemporaryPlots: 0,
            substrata: [
              {
                id: INCLUDED_SUBSTRATUM_ID,
                name: 'Included Substratum',
                areaHa: 1,
                boundary: { type: 'MultiPolygon', coordinates: [] },
                boundaryModifiedTime: '2027-01-01T00:00:00Z',
                fullName: 'Included Stratum / Included Substratum',
                plantingCompleted: false,
              },
              {
                id: EXCLUDED_SUBSTRATUM_ID,
                name: 'Excluded Substratum',
                areaHa: 1,
                boundary: { type: 'MultiPolygon', coordinates: [] },
                boundaryModifiedTime: '2027-01-01T00:00:00Z',
                fullName: 'Included Stratum / Excluded Substratum',
                plantingCompleted: false,
              },
            ],
          },
          {
            id: 41,
            name: 'Excluded Stratum',
            areaHa: 1,
            boundary: { type: 'MultiPolygon', coordinates: [] },
            boundaryModifiedTime: '2027-01-01T00:00:00Z',
            initialPlantingDensity: 1,
            numPermanentPlots: 0,
            numTemporaryPlots: 0,
            substrata: [
              {
                id: 52,
                name: 'Other Substratum',
                areaHa: 1,
                boundary: { type: 'MultiPolygon', coordinates: [] },
                boundaryModifiedTime: '2027-01-01T00:00:00Z',
                fullName: 'Excluded Stratum / Other Substratum',
                plantingCompleted: false,
              },
            ],
          },
        ],
      },
    ],
  });
  mockGet('/api/v1/planting-seasons', {
    seasons: [
      {
        id: PLANTING_SEASON_ID,
        name: 'Wet Season',
        plantingSiteId: PLANTING_SITE_ID,
        startDate: '2027-01-01',
        endDate: '2027-06-01',
        status: 'Active',
        speciesTargets: [
          { speciesId: 100, substratumId: INCLUDED_SUBSTRATUM_ID, quantity: 75 },
          { speciesId: 100, substratumId: EXCLUDED_SUBSTRATUM_ID, quantity: 25 },
        ],
      },
    ],
  });
};

describe('PurposeAndDestinationStep planting date', () => {
  it('shows unfulfilled date options and limits strata and substrata to the selected date', async () => {
    mockPlantingDestinations();

    renderWithProviders(
      <PurposeAndDestinationStep
        batches={[batch()]}
        contributor={false}
        draft={draft()}
        plantingDates={[plantingDate()]}
        onChange={() => undefined}
      />
    );

    await waitFor(() =>
      expect(document.body).toHaveTextContent(`${strings.PLANTING_DATE} (${strings.OPTIONAL.toLowerCase()})`)
    );
    expect(screen.getByDisplayValue('Feb 10, 2027')).toBeInTheDocument();

    expect(await screen.findByDisplayValue('Included Stratum')).toBeInTheDocument();
    expect(screen.queryByText('Excluded Stratum')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Included Substratum')).toBeInTheDocument();
    expect(screen.queryByText('Excluded Substratum')).not.toBeInTheDocument();
  });

  it('does not show a planting date selector when the selected season has no unfulfilled dates', async () => {
    mockPlantingDestinations();

    renderWithProviders(
      <PurposeAndDestinationStep
        batches={[batch()]}
        contributor={false}
        draft={draft({ scheduledPlantingDateRequestId: undefined })}
        plantingDates={[]}
        onChange={() => undefined}
      />
    );

    await screen.findByText(strings.PLANTING_SEASON_OPTIONAL);
    expect(document.body).not.toHaveTextContent(`${strings.PLANTING_DATE} (${strings.OPTIONAL.toLowerCase()})`);
  });
});

describe('QuantitiesStep planting date', () => {
  it('shows remaining quantities for both requested and unrequested withdrawal species', () => {
    mockPlantingDestinations();
    const acacia = batch();
    const ficus = batch({
      batchId: 2,
      batchNumber: '24-1-002',
      speciesId: 101,
      scientificName: 'Ficus aurea',
    });

    renderWithProviders(
      <QuantitiesStep
        batches={[acacia, ficus]}
        draft={draft()}
        selectedPlantingDate={plantingDate()}
        setWithdrawByBatch={() => undefined}
      />
    );

    expect(screen.getByText('Feb 10, 2027')).toBeInTheDocument();
    const acaciaHeader = screen.getByText('Acacia koa').parentElement as HTMLElement;
    expect(within(acaciaHeader).getByText(strings.REMAINING_TO_WITHDRAW + ':')).toBeInTheDocument();
    expect(within(acaciaHeader).getByText('25')).toBeInTheDocument();

    const ficusHeader = screen.getByText('Ficus aurea').parentElement as HTMLElement;
    expect(within(ficusHeader).getByText(strings.REMAINING_TO_WITHDRAW + ':')).toBeInTheDocument();
    expect(within(ficusHeader).getByText('0')).toBeInTheDocument();
  });

  it('allows a ready-to-plant withdrawal larger than the planting date remainder', () => {
    mockPlantingDestinations();
    let quantities = draft().withdrawByBatch;

    renderWithProviders(
      <QuantitiesStep
        batches={[batch()]}
        draft={draft()}
        selectedPlantingDate={plantingDate()}
        setWithdrawByBatch={(updater) => {
          quantities = updater(quantities);
        }}
      />
    );

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '30' } });

    expect(quantities[1].readyQuantityWithdrawn).toBe(30);
    expect(screen.queryByText(strings.formatString(strings.EXCEEDS_READY_TO_PLANT, 30, 100).toString())).toBeNull();
  });
});
