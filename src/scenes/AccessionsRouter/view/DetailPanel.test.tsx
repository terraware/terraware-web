import React from 'react';

import { screen } from '@testing-library/react';

import strings from 'src/strings';
import { buildOrganization, buildSeedBank, mockGet, renderWithProviders } from 'src/test-utils';
import { Accession } from 'src/types/Accession';

import DetailPanel from './DetailPanel';

const ACCESSION_ID = 42;
const SEED_BANK_ID = 101;

describe('DetailPanel collection site fields', () => {
  it('shows the landowner as a separate field below Collection Site', async () => {
    const accession: Accession = {
      accessionNumber: '24-1-001',
      active: 'Active',
      collectionSiteLandowner: 'Jennifer Yim',
      collectionSiteName: 'Ridgewood',
      facilityId: SEED_BANK_ID,
      hasDeliveries: false,
      id: ACCESSION_ID,
      photoFilenames: [],
      speciesId: 50,
      speciesScientificName: 'Acacia koa',
      state: 'In Storage',
    };
    mockGet(`/api/v2/seedbank/accessions/${ACCESSION_ID}`, { accession });

    renderWithProviders(<DetailPanel />, {
      organization: {
        selectedOrganization: buildOrganization({ facilities: [buildSeedBank({ id: SEED_BANK_ID })] }),
      },
      route: `/accessions/${ACCESSION_ID}`,
      path: '/accessions/:accessionId',
    });

    const collectionSiteLabel = await screen.findByText(strings.COLLECTION_SITE);
    const landownerLabel = screen.getByText(strings.LANDOWNER);

    expect(screen.getByText('Ridgewood')).toBeVisible();
    expect(screen.getByText('Jennifer Yim')).toBeVisible();
    expect(collectionSiteLabel.compareDocumentPosition(landownerLabel)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.queryByText(/Owner:/)).not.toBeInTheDocument();
  });
});
