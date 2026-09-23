import React from 'react';

import { afterAll, beforeAll } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';

import strings from 'src/strings';
import {
  buildOrganization,
  buildSeedBank,
  captureRequests,
  mockGet,
  mockPost,
  mockPut,
  renderWithProviders,
} from 'src/test-utils';
import { Accession } from 'src/types/Accession';

import Accession2EditModal from './Accession2EditModal';

const ACCESSION_ID = 42;
const SEED_BANK_ID = 101;
const ACCESSION_URL = `/api/v2/seedbank/accessions/${ACCESSION_ID}`;
const PHOTO_URL = '/api/v1/seedbank/accessions/:id/photos/:photoFilename';

const originalCreateObjectURL = URL.createObjectURL.bind(URL);
const originalRevokeObjectURL = URL.revokeObjectURL.bind(URL);
beforeAll(() => {
  URL.createObjectURL = () => 'blob:stub';
  URL.revokeObjectURL = () => undefined;
});
afterAll(() => {
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
});

const buildAccession = (overrides: Partial<Accession> = {}): Accession => ({
  accessionNumber: '24-1-001',
  active: 'Active',
  collectedTime: '2024-01-01T12:00:00Z',
  facilityId: SEED_BANK_ID,
  hasDeliveries: false,
  id: ACCESSION_ID,
  photoFilenames: [],
  speciesId: 50,
  speciesScientificName: 'Acacia koa',
  state: 'In Storage',
  ...overrides,
});

const mockDependencies = (accession: Accession) => {
  mockGet(ACCESSION_URL, { accession });
  mockPut(ACCESSION_URL, { accession });
  mockPost('/api/v1/search', { results: [] });
  mockPost('/api/v1/search/values', { results: {} });
};

const renderModal = () =>
  renderWithProviders(<Accession2EditModal open onClose={() => undefined} />, {
    organization: {
      selectedOrganization: buildOrganization({ facilities: [buildSeedBank({ id: SEED_BANK_ID })] }),
    },
    route: `/accessions/${ACCESSION_ID}`,
    path: '/accessions/:accessionId',
  });

describe('Accession2EditModal photos', () => {
  it('uploads a newly selected photo when the accession is saved', async () => {
    mockDependencies(buildAccession());
    const uploads = captureRequests('post', PHOTO_URL);
    const { container, user } = renderModal();

    await screen.findByDisplayValue('24-1-001');
    const file = new File(['x'], 'new-photo.jpg', { type: 'image/jpeg' });
    await user.upload(container.querySelector('input[type="file"]') as HTMLInputElement, file);
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(uploads).toHaveLength(1));
    expect(uploads[0].url).toContain(`/accessions/${ACCESSION_ID}/photos/new-photo.jpg`);
  });

  it('deletes an existing photo when it is removed and the accession is saved', async () => {
    mockDependencies(buildAccession({ photoFilenames: ['existing.jpg'] }));
    const deletes = captureRequests('delete', PHOTO_URL);
    const { user } = renderModal();

    const existingPhoto = await screen.findByAltText('0');
    await user.click(within(existingPhoto.parentElement as HTMLElement).getByRole('button'));
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(deletes).toHaveLength(1));
    expect(deletes[0].url).toContain(`/accessions/${ACCESSION_ID}/photos/existing.jpg`);
  });
});
