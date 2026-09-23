import React from 'react';

import { afterAll, beforeAll } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';

import strings from 'src/strings';
import {
  buildOrganization,
  buildSeedBank,
  captureRequests,
  mockGet,
  mockPost,
  renderWithProviders,
} from 'src/test-utils';

import Accession2CreateView from './Accession2CreateView';

// The generated uploadPhoto mutation posts to this URL (see src/queries/generated/accessionsV1.ts).
const PHOTO_URL = '/api/v1/seedbank/accessions/:id/photos/:photoFilename';
const CREATE_ACCESSION_URL = '/api/v2/seedbank/accessions';
const SEED_BANK_ID = 101;
const NEW_ACCESSION_ID = 999;

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

// API endpoints called by the create form and its property fields while rendering and completing the form.
// They aren't under test, but must be mocked because unhandled requests fail the test.
const mockSupportingEndpoints = () => {
  // SpeciesSelector suggests species via the search endpoint.
  mockPost('/api/v1/search', { results: [{ id: '50', scientificName: 'Acacia koa' }] });
  // Collectors2 and CollectionSiteName read recent values from the search/values endpoint.
  mockPost('/api/v1/search/values', { results: {} });
  // useProjects lists the organization's projects.
  mockGet('/api/v1/projects', { projects: [] });
  // SeedBank2Selector loads sub-locations once a seed bank is selected.
  mockGet(`/api/v1/facilities/${SEED_BANK_ID}/subLocations`, { subLocations: [] });
};

const selectSpecies = async (user: ReturnType<typeof renderWithProviders>['user']) => {
  await user.click(document.querySelector('#speciesSelector') as Element);
  await user.click(await screen.findByText('Acacia koa'));
};

const choosePhoto = async (user: ReturnType<typeof renderWithProviders>['user'], container: HTMLElement) => {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
  await user.upload(input, file);
  return file;
};

describe('Accession2CreateView', () => {
  it('uploads the chosen photo to the newly created accession when the form is saved', async () => {
    mockSupportingEndpoints();
    mockPost(CREATE_ACCESSION_URL, { accession: { id: NEW_ACCESSION_ID } });
    const uploads = captureRequests('post', PHOTO_URL);

    // A single seed bank auto-populates the required location, leaving only the species to pick.
    const { user, container } = renderWithProviders(<Accession2CreateView />, {
      organization: { selectedOrganization: buildOrganization({ facilities: [buildSeedBank({ id: SEED_BANK_ID })] }) },
    });

    await selectSpecies(user);
    await choosePhoto(user, container);
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(uploads).toHaveLength(1));
    expect(uploads[0].url).toContain(`/accessions/${NEW_ACCESSION_ID}/photos/photo.jpg`);
  });

  it('creates the accession without any photo request when none was chosen', async () => {
    mockSupportingEndpoints();
    const creates = captureRequests('post', CREATE_ACCESSION_URL, { accession: { id: NEW_ACCESSION_ID } });
    const uploads = captureRequests('post', PHOTO_URL);

    const { user } = renderWithProviders(<Accession2CreateView />, {
      organization: { selectedOrganization: buildOrganization({ facilities: [buildSeedBank({ id: SEED_BANK_ID })] }) },
    });

    await selectSpecies(user);
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(creates).toHaveLength(1));
    expect(uploads).toHaveLength(0);
  });
});
