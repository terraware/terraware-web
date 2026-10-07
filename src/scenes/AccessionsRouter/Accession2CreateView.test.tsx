import React from 'react';
import { useLocation } from 'react-router';

import { afterAll, beforeAll } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import ToastSnackbar from 'src/components/ToastSnackbar';
import { FacilityPayload } from 'src/queries/generated/organizations';
import strings from 'src/strings';
import {
  type RenderWithProvidersOptions,
  buildOrganization,
  buildSeedBank,
  captureRequests,
  mockError,
  mockGet,
  mockPost,
  renderWithProviders,
  server,
} from 'src/test-utils';
import { Project } from 'src/types/Project';

import Accession2CreateView from './Accession2CreateView';

// The generated uploadPhoto mutation posts to this URL (see src/queries/generated/accessionsV1.ts).
const PHOTO_URL = '/api/v1/seedbank/accessions/:id/photos/:photoFilename';
const CREATE_ACCESSION_URL = '/api/v2/seedbank/accessions';
const SEED_BANK_ID = 101;
const OTHER_SEED_BANK_ID = 102;
const NEW_ACCESSION_ID = 999;
const SPECIES_ID = 50;

// The suite runs under TZ=America/Los_Angeles, so a zone assertion is only meaningful when the
// configured zone differs from it. Tokyo (+09:00) and Kolkata (+05:30) never observe DST, which
// keeps the offsets in these tests stable whatever the date.
const TOKYO = { id: 'Asia/Tokyo', longName: 'Japan Standard Time' };
const KOLKATA = { id: 'Asia/Kolkata', longName: 'India Standard Time' };
const LOS_ANGELES = { id: 'America/Los_Angeles', longName: 'Pacific Time' };

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
const mockSupportingEndpoints = ({ projects = [] }: { projects?: Project[] } = {}) => {
  // SpeciesSelector suggests species via the search endpoint.
  mockPost('/api/v1/search', { results: [{ id: String(SPECIES_ID), scientificName: 'Acacia koa' }] });
  // Collectors2 and CollectionSiteName read recent values from the search/values endpoint.
  mockPost('/api/v1/search/values', { results: {} });
  // useProjects lists the organization's projects.
  mockGet('/api/v1/projects', { projects });
  // SeedBank2Selector loads sub-locations once a seed bank is selected.
  mockGet('/api/v1/facilities/:facilityId/subLocations', { subLocations: [] });
};

const selectSpecies = async (user: ReturnType<typeof renderWithProviders>['user']) => {
  await user.click(document.querySelector('#speciesSelector') as Element);
  await user.click(await screen.findByText('Acacia koa'));
};

const choosePhotos = async (
  user: ReturnType<typeof renderWithProviders>['user'],
  container: HTMLElement,
  names: string[] = ['photo.jpg']
) => {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  const files = names.map((name) => new File(['x'], name, { type: 'image/jpeg' }));
  await user.upload(input, files);
  return files;
};

/** Renders the current location so a test can assert on where a save navigated. */
const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid='location'>{location.pathname}</div>;
};

type CreateViewOptions = {
  /** Seed banks the organization offers. A single one auto-populates the required location. */
  facilities?: FacilityPayload[];
  /** The organization's own zone, which the form falls back to before a seed bank is known. */
  orgTimeZone?: string;
  localization?: RenderWithProvidersOptions['localization'];
};

// ToastSnackbar is what puts an error toast on screen in the real app (see App.tsx); without it the
// toast has nothing to render into and the failure would be invisible to a test.
// A single seed bank auto-populates the required location, leaving only the species to pick.
const renderCreateView = ({
  facilities = [buildSeedBank({ id: SEED_BANK_ID })],
  orgTimeZone,
  localization,
}: CreateViewOptions = {}) =>
  renderWithProviders(
    <>
      <Accession2CreateView />
      <ToastSnackbar />
      <LocationProbe />
    </>,
    {
      organization: {
        selectedOrganization: buildOrganization(
          orgTimeZone === undefined ? { facilities } : { facilities, timeZone: orgTimeZone }
        ),
      },
      localization,
    }
  );

const selectSeedBank = async (user: ReturnType<typeof renderWithProviders>['user'], name: string) => {
  await user.click(document.querySelector('#location') as Element);
  await user.click(await screen.findByText(name));
};

/** Types `yyyy-MM-dd` into one of the form's date pickers, section by section. */
const enterDate = async (user: ReturnType<typeof renderWithProviders>['user'], id: string, date: string) => {
  await user.click(document.querySelector(`#${id}`) as Element);
  await user.keyboard(date.replace(/-/g, ''));
};

describe('Accession2CreateView', () => {
  it('uploads the chosen photo to the newly created accession when the form is saved', async () => {
    mockSupportingEndpoints();
    mockPost(CREATE_ACCESSION_URL, { accession: { id: NEW_ACCESSION_ID } });
    const uploads = captureRequests('post', PHOTO_URL);

    const { user, container } = renderCreateView();

    await selectSpecies(user);
    await choosePhotos(user, container);
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(uploads).toHaveLength(1));
    expect(uploads[0].url).toContain(`/accessions/${NEW_ACCESSION_ID}/photos/photo.jpg`);
  });

  it('creates the accession without any photo request when none was chosen', async () => {
    mockSupportingEndpoints();
    const creates = captureRequests('post', CREATE_ACCESSION_URL, { accession: { id: NEW_ACCESSION_ID } });
    const uploads = captureRequests('post', PHOTO_URL);

    const { user } = renderCreateView();

    await selectSpecies(user);
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(creates).toHaveLength(1));
    expect(uploads).toHaveLength(0);
  });

  it('flags the missing species and creates nothing when the form is saved incomplete', async () => {
    mockSupportingEndpoints();
    const creates = captureRequests('post', CREATE_ACCESSION_URL, { accession: { id: NEW_ACCESSION_ID } });

    const { user } = renderCreateView();

    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    expect(await screen.findByText(strings.REQUIRED_FIELD)).toBeInTheDocument();
    expect(creates).toHaveLength(0);
    expect(screen.getByTestId('location').textContent).toBe('/');
  });

  it('takes the user to the new accession once it has been created', async () => {
    mockSupportingEndpoints();
    mockPost(CREATE_ACCESSION_URL, { accession: { id: NEW_ACCESSION_ID } });

    const { user } = renderCreateView();

    await selectSpecies(user);
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe(`/accessions/${NEW_ACCESSION_ID}`));
  });

  it('keeps the user on the form and reports the failure when the accession cannot be created', async () => {
    mockSupportingEndpoints();
    mockError('post', CREATE_ACCESSION_URL);

    const { user } = renderCreateView();

    await selectSpecies(user);
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    expect(await screen.findByText(strings.GENERIC_ERROR)).toBeInTheDocument();
    // Navigating away would tell the user the accession exists when it does not.
    expect(screen.getByTestId('location').textContent).toBe('/');
    expect(screen.getByRole('button', { name: strings.SAVE })).toBeInTheDocument();
  });

  it('still takes the user to the new accession when a photo fails to upload', async () => {
    mockSupportingEndpoints();
    mockPost(CREATE_ACCESSION_URL, { accession: { id: NEW_ACCESSION_ID } });
    mockError('post', PHOTO_URL);

    const { user, container } = renderCreateView();

    await selectSpecies(user);
    await choosePhotos(user, container);
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    // The accession exists, so leaving the reader on the form would invite a duplicate.
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe(`/accessions/${NEW_ACCESSION_ID}`));
    expect(
      screen.getByText(strings.formatString(strings.ACCESSION_CREATED_PHOTOS_NOT_UPLOADED_ONE, 1) as string)
    ).toBeInTheDocument();
  });

  it('keeps the photos that uploaded and reports only the one that failed', async () => {
    mockSupportingEndpoints();
    mockPost(CREATE_ACCESSION_URL, { accession: { id: NEW_ACCESSION_ID } });
    const uploaded: string[] = [];
    server.use(
      http.post(PHOTO_URL, ({ params }) => {
        if (params.photoFilename === 'bad.jpg') {
          return HttpResponse.json({ status: 'error', error: { message: 'Test failure' } }, { status: 500 });
        }
        uploaded.push(params.photoFilename as string);
        return HttpResponse.json({ status: 'ok' });
      })
    );

    const { user, container } = renderCreateView();

    await selectSpecies(user);
    await choosePhotos(user, container, ['good.jpg', 'bad.jpg']);
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe(`/accessions/${NEW_ACCESSION_ID}`));
    expect(uploaded).toEqual(['good.jpg']);
    expect(
      screen.getByText(strings.formatString(strings.ACCESSION_CREATED_PHOTOS_NOT_UPLOADED_ONE, 1) as string)
    ).toBeInTheDocument();
  });

  it('submits the default state, the auto-filled seed bank and the chosen species for an untouched form', async () => {
    mockSupportingEndpoints();
    const creates = captureRequests('post', CREATE_ACCESSION_URL, { accession: { id: NEW_ACCESSION_ID } });

    const { user } = renderCreateView();

    await selectSpecies(user);
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(creates).toHaveLength(1));
    expect(await creates[0].json()).toMatchObject({
      state: 'Awaiting Check-In',
      facilityId: SEED_BANK_ID,
      speciesId: SPECIES_ID,
    });
  });

  it('records the collection time in the configured time zone rather than the browser time zone', async () => {
    mockSupportingEndpoints();
    const creates = captureRequests('post', CREATE_ACCESSION_URL, { accession: { id: NEW_ACCESSION_ID } });

    // Organization and seed bank share a zone on purpose: `collectedTime` is fixed at mount from
    // whichever zone has resolved by then, so a mismatch here would test the resolution order
    // rather than the zone the time is written in.
    const { user } = renderCreateView({
      facilities: [buildSeedBank({ id: SEED_BANK_ID, timeZone: TOKYO.id })],
      orgTimeZone: TOKYO.id,
      localization: { supportedTimeZones: [TOKYO, KOLKATA, LOS_ANGELES] },
    });

    await selectSpecies(user);
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(creates).toHaveLength(1));
    const { collectedTime } = (await creates[0].json()) as { collectedTime: string };
    // setZone keeps the instant and rewrites the offset, so the offset is what identifies the zone.
    expect(collectedTime).toMatch(/\+09:00$/);
  });

  // The received date re-defaults as the zone resolves, which used to overwrite what the reader had
  // already typed the moment they picked a seed bank in another zone.
  it('keeps a received date the user entered when the seed bank is changed afterwards', async () => {
    mockSupportingEndpoints();
    const creates = captureRequests('post', CREATE_ACCESSION_URL, { accession: { id: NEW_ACCESSION_ID } });

    const { user } = renderCreateView({
      facilities: [
        buildSeedBank({ id: SEED_BANK_ID, name: 'Kolkata Seed Bank', timeZone: KOLKATA.id }),
        buildSeedBank({ id: OTHER_SEED_BANK_ID, name: 'Tokyo Seed Bank', timeZone: TOKYO.id }),
      ],
      orgTimeZone: KOLKATA.id,
      localization: { supportedTimeZones: [TOKYO, KOLKATA, LOS_ANGELES] },
    });

    await selectSpecies(user);
    await enterDate(user, 'receivedDate', '2024-03-15');
    await selectSeedBank(user, 'Tokyo Seed Bank');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(creates).toHaveLength(1));
    expect(await creates[0].json()).toMatchObject({ receivedDate: '2024-03-15' });
  });

  // "No Project" clears the field to `undefined`, which is indistinguishable from never having
  // touched it, so a re-running auto-apply used to file the accession under a project the reader
  // had just declined.
  it('leaves the project off the accession once the user has chosen No Project', async () => {
    const project: Project = { id: 7, name: 'Only Project', organizationId: 1 };
    mockSupportingEndpoints({ projects: [project] });
    const creates = captureRequests('post', CREATE_ACCESSION_URL, { accession: { id: NEW_ACCESSION_ID } });

    const { user } = renderCreateView();

    await selectSpecies(user);
    await user.click(document.querySelector('#projectId') as Element);
    await user.click(await screen.findByText(strings.NO_PROJECT));
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(creates).toHaveLength(1));
    expect((await creates[0].json()) as { projectId?: number }).not.toHaveProperty('projectId', project.id);
  });

  it('applies the only project the organization has to an untouched form', async () => {
    const project: Project = { id: 7, name: 'Only Project', organizationId: 1 };
    mockSupportingEndpoints({ projects: [project] });
    const creates = captureRequests('post', CREATE_ACCESSION_URL, { accession: { id: NEW_ACCESSION_ID } });

    const { user } = renderCreateView();

    await selectSpecies(user);
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(creates).toHaveLength(1));
    expect(await creates[0].json()).toMatchObject({ projectId: project.id });
  });
});
