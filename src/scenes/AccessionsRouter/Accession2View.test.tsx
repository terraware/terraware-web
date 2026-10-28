import React from 'react';
import { useLocation } from 'react-router';

import { screen, waitFor } from '@testing-library/react';

import { VIABILITY_TEST_QUERY_PARAM } from 'src/constants';
import strings from 'src/strings';
import {
  buildAccession,
  buildOrganization,
  buildSeedBank,
  buildViabilityTest,
  mockGet,
  mockPost,
  renderWithProviders,
} from 'src/test-utils';
import { Accession } from 'src/types/Accession';

import Accession2View from './Accession2View';

const ACCESSION_ID = 42;
const ACCESSION_URL = `/api/v2/seedbank/accessions/${ACCESSION_ID}`;
const LAB_TEST_ID = 77;
const CUT_TEST_ID = 88;

const labTest = buildViabilityTest({
  accessionId: ACCESSION_ID,
  id: LAB_TEST_ID,
  testType: 'Lab',
  substrate: 'Agar',
  seedsTested: 25,
});

const cutTest = buildViabilityTest({
  accessionId: ACCESSION_ID,
  id: CUT_TEST_ID,
  testType: 'Cut',
  substrate: undefined,
  treatment: undefined,
  seedsFilled: 18,
  seedsTested: 20,
});

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid='location'>{`${location.pathname}${location.search}`}</div>;
};

const testTitle = (id: number) => strings.formatString(strings.VIABILITY_TEST_NUMBER, String(id)) as string;

const mockSupportingEndpoints = () => {
  mockGet('/api/v1/species', { species: [] });
  mockGet('/api/v1/organizations/:organizationId/users', { users: [] });
  mockPost('/api/v1/events/list', { events: [] });
  mockPost('/api/v1/search', { results: [] });
  mockGet('/api/v1/projects', { projects: [] });
};

const renderAccessionView = ({
  accession = buildAccession({ viabilityTests: [labTest, cutTest] }),
  search = '',
}: { accession?: Accession; search?: string } = {}) => {
  mockSupportingEndpoints();
  mockGet(ACCESSION_URL, { accession });

  return renderWithProviders(
    <>
      <Accession2View />
      <LocationProbe />
    </>,
    {
      route: `/accessions/${ACCESSION_ID}${search}`,
      path: '/accessions/:accessionId',
      organization: {
        selectedOrganization: buildOrganization({ facilities: [buildSeedBank({ id: accession.facilityId })] }),
      },
    }
  );
};

describe('Accession2View viability test deep link', () => {
  beforeEach(() => sessionStorage.clear());

  it('opens the viability test named by the query parameter once the accession has loaded', async () => {
    renderAccessionView({ search: `?${VIABILITY_TEST_QUERY_PARAM}=${LAB_TEST_ID}` });

    expect(await screen.findByText(testTitle(LAB_TEST_ID))).toBeInTheDocument();
    expect(screen.queryByText(testTitle(CUT_TEST_ID))).not.toBeInTheDocument();
  });

  it('shows the viability tests tab behind the deep-linked test', async () => {
    renderAccessionView({ search: `?${VIABILITY_TEST_QUERY_PARAM}=${CUT_TEST_ID}` });

    expect(await screen.findByText(testTitle(CUT_TEST_ID))).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('location').textContent).toContain('tab=viabilityTesting'));
    expect(screen.getByRole('tab', { name: strings.VIABILITY_TESTS })).toHaveAttribute('aria-selected', 'true');
  });

  it('does not open a viability test when no parameter is given', async () => {
    renderAccessionView();

    expect(await screen.findByText('24-1-1-001')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the accession without a test when the parameter names a test it does not have', async () => {
    renderAccessionView({ search: `?${VIABILITY_TEST_QUERY_PARAM}=999` });

    expect(await screen.findByText('24-1-1-001')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('drops the parameter from the URL so a refresh does not reopen the test', async () => {
    renderAccessionView({ search: `?${VIABILITY_TEST_QUERY_PARAM}=${LAB_TEST_ID}` });

    expect(await screen.findByText(testTitle(LAB_TEST_ID))).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('location').textContent).not.toContain(VIABILITY_TEST_QUERY_PARAM));
  });

  it('wins over the tab last viewed in this session', async () => {
    sessionStorage.setItem('tab-accession', 'history');

    renderAccessionView({ search: `?${VIABILITY_TEST_QUERY_PARAM}=${LAB_TEST_ID}` });

    expect(await screen.findByText(testTitle(LAB_TEST_ID))).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('location').textContent).toContain('tab=viabilityTesting'));
    expect(screen.getByRole('tab', { name: strings.VIABILITY_TESTS })).toHaveAttribute('aria-selected', 'true');
  });
});
