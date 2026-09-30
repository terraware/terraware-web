import React from 'react';

import { screen, within } from '@testing-library/react';

import { PlantingPayload } from 'src/queries/generated/nurseryWithdrawals';
import strings from 'src/strings';
import { buildPlantingSite, buildSpecies, mockGet, mockPost, renderWithProviders } from 'src/test-utils';

import OutplantReassignmentTable from './OutplantReassignmentTable';

describe('OutplantReassignmentTable', () => {
  beforeEach(() => {
    mockGet('/api/v1/tracking/sites', {
      sites: [buildPlantingSite({ id: 1, name: 'Original Site' }), buildPlantingSite({ id: 2, name: 'New Site' })],
    });
    mockPost('/api/v1/search', {
      results: [
        {
          id: '10',
          name: 'Original Substratum',
          plantingSite_id: '1',
          stratum_id: '1',
          stratum_name: 'Original Stratum',
        },
        { id: '20', name: 'New Substratum', plantingSite_id: '2', stratum_id: '2', stratum_name: 'New Stratum' },
        { id: '30', name: 'Other Substratum', plantingSite_id: '2', stratum_id: '2', stratum_name: 'New Stratum' },
      ],
    });
  });

  it.each([true, false])(
    'shows planting site columns only when the site changes (site changed: %s)',
    async (crossSite) => {
      const plantings: (PlantingPayload & { plantingSiteId: number })[] = [
        { id: 1, speciesId: 1, numPlants: 10, substratumId: 10, plantingSiteId: 1, type: 'Delivery' },
        { id: 2, speciesId: 1, numPlants: -6, substratumId: 10, plantingSiteId: 1, type: 'Reassignment From' },
        {
          id: 3,
          speciesId: 1,
          numPlants: 4,
          substratumId: 20,
          plantingSiteId: crossSite ? 2 : 1,
          type: 'Reassignment To',
          notes: 'First move',
        },
        {
          id: 4,
          speciesId: 1,
          numPlants: 2,
          substratumId: 30,
          plantingSiteId: crossSite ? 2 : 1,
          type: 'Reassignment To',
          notes: 'Second move',
        },
      ];
      renderWithProviders(<OutplantReassignmentTable plantings={plantings} species={[buildSpecies()]} />);

      expect(await screen.findByRole('cell', { name: 'Other Substratum' })).toBeInTheDocument();
      if (crossSite) {
        expect(screen.getByRole('columnheader', { name: strings.FROM_PLANTING_SITE })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: strings.TO_PLANTING_SITE })).toBeInTheDocument();
        const firstMove = screen.getByRole('row', { name: /First move/ });
        expect(await within(firstMove).findByRole('cell', { name: 'Original Site' })).toBeInTheDocument();
        expect(within(firstMove).getByRole('cell', { name: 'New Site' })).toBeInTheDocument();
        expect(within(firstMove).getByRole('cell', { name: '4' })).toBeInTheDocument();
        const secondMove = screen.getByRole('row', { name: /Second move/ });
        expect(within(secondMove).getByRole('cell', { name: 'New Site' })).toBeInTheDocument();
        expect(within(secondMove).getByRole('cell', { name: '2' })).toBeInTheDocument();
      } else {
        expect(screen.queryByRole('columnheader', { name: strings.FROM_PLANTING_SITE })).not.toBeInTheDocument();
        expect(screen.queryByRole('columnheader', { name: strings.TO_PLANTING_SITE })).not.toBeInTheDocument();
      }
    }
  );
});
