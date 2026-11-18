import React, { useCallback, useState } from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw/http';

import { UpdatePlantingSiteRequestPayload } from 'src/queries/generated/plantingSites';
import DetailsInputForm from 'src/scenes/PlantingSitesRouter/edit/DetailsInputForm';
import strings from 'src/strings';
import { mockGet, renderWithProviders, selectDropdownOption, server } from 'src/test-utils';
import useForm from 'src/utils/useForm';

const SEARCH_URL = '/api/v1/search';
const PROJECTS_URL = '/api/v1/projects';

const SITE_ID = 1;

type NamedSite = { id: number; name: string };

/** Time zones the organization can choose from; the organization itself is in Los Angeles. */
const TIME_ZONES = [
  { id: 'America/Los_Angeles', longName: 'Pacific Time' },
  { id: 'Pacific/Honolulu', longName: 'Hawaii Time' },
];

const PROJECTS = [
  { id: 7, name: 'Hilo Forest', organizationId: 1 },
  { id: 8, name: 'Kona Slope', organizationId: 1 },
];

/**
 * Both name lookups go to the one search endpoint and are told apart by the `prefix` in the body.
 * Returns the prefixes asked for so far, so a test can wait for the mount searches to settle.
 */
const mockNameSearches = (sites: NamedSite[] = [], drafts: NamedSite[] = []) => {
  const prefixes: string[] = [];

  server.use(
    http.post(SEARCH_URL, async ({ request }) => {
      const body = (await request.json()) as { prefix: string };
      prefixes.push(body.prefix);
      const results = body.prefix === 'draftPlantingSites' ? drafts : sites;
      return HttpResponse.json({
        status: 'ok',
        results: results.map((site) => ({ id: `${site.id}`, name: site.name })),
      });
    })
  );

  return prefixes;
};

/**
 * `DetailsInputForm` is controlled: it sends nothing itself and only reports edits and validation
 * results to whoever renders it. This stands in for that parent, wired the way
 * `PlantingSiteDetailsCard` wires it, so a test can assert on the record a save would have sent.
 */
const DetailsFormHarness = ({
  onSave,
  plantingSiteId,
  site,
}: {
  onSave: (record: UpdatePlantingSiteRequestPayload) => void;
  plantingSiteId?: number;
  site: UpdatePlantingSiteRequestPayload;
}) => {
  const [record, setRecord, onChange] = useForm<UpdatePlantingSiteRequestPayload>(site);
  const [onValidate, setOnValidate] = useState<((hasErrors: boolean) => void) | undefined>();
  const [isLoadingNames, setIsLoadingNames] = useState(true);

  const handleSave = useCallback(() => {
    setOnValidate(() => (hasErrors: boolean) => {
      setOnValidate(undefined);
      if (!hasErrors) {
        onSave(record);
      }
    });
  }, [onSave, record]);

  return (
    <>
      <DetailsInputForm
        onChange={onChange}
        onLoadingChange={setIsLoadingNames}
        onValidate={onValidate}
        plantingSiteId={plantingSiteId}
        record={record}
        setRecord={setRecord}
      />
      <button disabled={isLoadingNames} onClick={handleSave}>
        {strings.SAVE}
      </button>
    </>
  );
};

type RenderOptions = {
  drafts?: NamedSite[];
  plantingSiteId?: number;
  projects?: typeof PROJECTS;
  site?: Partial<UpdatePlantingSiteRequestPayload>;
  sites?: NamedSite[];
};

const renderForm = ({ drafts, plantingSiteId = SITE_ID, projects, site, sites }: RenderOptions = {}) => {
  mockNameSearches(sites, drafts);
  mockGet(PROJECTS_URL, { projects: projects ?? PROJECTS });

  const onSave = rstest.fn();

  return {
    onSave,
    ...renderWithProviders(
      <DetailsFormHarness onSave={onSave} plantingSiteId={plantingSiteId} site={{ name: '', ...site }} />,
      { localization: { supportedTimeZones: TIME_ZONES } }
    ),
  };
};

/** `Textfield` points its `<label for>` at a wrapper div rather than the input it wraps. */
const nameField = () => document.querySelector('#name input') as HTMLInputElement;

/**
 * A `textarea` `Textfield` drops the `id` altogether, so its label reaches nothing and there is no
 * handle on the control either. The form renders exactly one textarea, which is the description.
 */
const descriptionField = () => document.querySelector('textarea') as HTMLTextAreaElement;

/** Saving is held until the existing names are known, so a duplicate can't slip through. */
const save = async (user: UserEvent) => {
  const button = screen.getByRole('button', { name: strings.SAVE });
  await waitFor(() => expect(button).toBeEnabled());
  await user.click(button);
};

/**
 * The autocomplete flavour of `Dropdown` puts its id on the input itself, so the shared
 * `selectDropdownOption` helper doesn't reach it and the options render as a listbox rather than a
 * list.
 */
const selectTimeZone = async (user: UserEvent, longName: string) => {
  await user.click(document.querySelector('#time-zone-selector') as HTMLElement);
  await user.click(within(await screen.findByRole('listbox')).getByText(longName));
};

const useOrganizationTimeZone = () => screen.getByRole('checkbox', { name: strings.USE_ORGANIZATION_TIME_ZONE });

describe('DetailsInputForm name validation', () => {
  it('will not save a site without a name', async () => {
    const { onSave, user } = renderForm();

    await save(user);

    expect(await screen.findByText(strings.REQUIRED_FIELD)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('will not save a site under a name another planting site already uses', async () => {
    const { onSave, user } = renderForm({ sites: [{ id: 2, name: 'Waikoloa' }] });

    await user.type(nameField(), 'Waikoloa');
    await save(user);

    expect(await screen.findByText(strings.SITE_WITH_NAME_EXISTS)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('will not save a site under a name a draft planting site already uses', async () => {
    const { onSave, user } = renderForm({ drafts: [{ id: 5, name: 'Waikoloa' }] });

    await user.type(nameField(), 'Waikoloa');
    await save(user);

    expect(await screen.findByText(strings.SITE_WITH_NAME_EXISTS)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('lets a site keep the name it already has', async () => {
    const { onSave, user } = renderForm({
      site: { name: 'Kaupulehu' },
      sites: [{ id: SITE_ID, name: 'Kaupulehu' }],
    });

    await save(user);

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Kaupulehu' })));
    expect(screen.queryByText(strings.SITE_WITH_NAME_EXISTS)).not.toBeInTheDocument();
  });

  it('drops the error as soon as a usable name is entered', async () => {
    const { user } = renderForm();

    await save(user);
    expect(await screen.findByText(strings.REQUIRED_FIELD)).toBeInTheDocument();

    await user.type(nameField(), 'Kaupulehu');

    await waitFor(() => expect(screen.queryByText(strings.REQUIRED_FIELD)).not.toBeInTheDocument());
  });
});

describe('DetailsInputForm reporting the details entered', () => {
  it('reports the name and description', async () => {
    const { onSave, user } = renderForm();

    await user.type(nameField(), 'Kaupulehu');
    await user.type(descriptionField(), 'North slope');
    await save(user);

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ description: 'North slope', name: 'Kaupulehu' }))
    );
  });

  it('reports the project the site belongs to', async () => {
    const { onSave, user } = renderForm({ site: { name: 'Kaupulehu' } });

    await selectDropdownOption(user, 'projectId', 'Kona Slope');
    await save(user);

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ projectId: 8 })));
  });

  it('reports no project once the site is taken out of one', async () => {
    const { onSave, user } = renderForm({ site: { name: 'Kaupulehu', projectId: 7 } });

    await selectDropdownOption(user, 'projectId', strings.NO_PROJECT);
    await save(user);

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ name: 'Kaupulehu' }));
  });

  it('reports the time zone chosen for the site', async () => {
    const { onSave, user } = renderForm({ site: { name: 'Kaupulehu' } });

    await user.click(useOrganizationTimeZone());
    await selectTimeZone(user, 'Hawaii Time');
    await save(user);

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ timeZone: 'Pacific/Honolulu' })));
  });

  it('reports no time zone once the site goes back to the organization time zone', async () => {
    const { onSave, user } = renderForm({ site: { name: 'Kaupulehu', timeZone: 'Pacific/Honolulu' } });

    expect(useOrganizationTimeZone()).not.toBeChecked();
    await user.click(useOrganizationTimeZone());
    await save(user);

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ name: 'Kaupulehu' }));
  });
});
