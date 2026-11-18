import React, { useCallback, useState } from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw/http';

import DraftSiteDetailsInputForm from 'src/scenes/PlantingSitesRouter/edit/editor/DraftSiteDetailsInputForm';
import strings from 'src/strings';
import { buildDraftPlantingSite, mockGet, renderWithProviders, selectDropdownOption, server } from 'src/test-utils';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import useForm from 'src/utils/useForm';

const SEARCH_URL = '/api/v1/search';
const PROJECTS_URL = '/api/v1/projects';

const DRAFT_ID = 1;

type NamedSite = { id: number; name: string };

/** Time zones the organization can choose from; the organization itself is in Los Angeles. */
const TIME_ZONES = [
  { id: 'America/Los_Angeles', longName: 'Pacific Time' },
  { id: 'Pacific/Honolulu', longName: 'Hawaii Time' },
];

const PROJECTS = [{ id: 7, name: 'Hilo Forest', organizationId: 1 }];

/**
 * Both name lookups go to the one search endpoint and are told apart by the `prefix` in the body.
 */
const mockNameSearches = (sites: NamedSite[] = [], drafts: NamedSite[] = []) => {
  server.use(
    http.post(SEARCH_URL, async ({ request }) => {
      const body = (await request.json()) as { prefix: string };
      const results = body.prefix === 'draftPlantingSites' ? drafts : sites;
      return HttpResponse.json({
        status: 'ok',
        results: results.map((site) => ({ id: `${site.id}`, name: site.name })),
      });
    })
  );
};

/**
 * The form is controlled: it sends nothing itself and only reports edits and validation results to
 * whoever renders it. This stands in for that parent, wired the way `DraftSiteDetailsModal` wires
 * it, so a test can assert on the draft a save would have handed on.
 */
const DraftDetailsFormHarness = ({
  onSave,
  site,
}: {
  onSave: (record: DraftPlantingSite) => void;
  site: DraftPlantingSite;
}) => {
  const [record, setRecord, onChange] = useForm<DraftPlantingSite>(site);
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
      <DraftSiteDetailsInputForm
        onChange={onChange}
        onLoadingChange={setIsLoadingNames}
        onValidate={onValidate}
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
  site?: Partial<DraftPlantingSite>;
  sites?: NamedSite[];
};

const renderForm = ({ drafts, site, sites }: RenderOptions = {}) => {
  mockNameSearches(sites, drafts);
  mockGet(PROJECTS_URL, { projects: PROJECTS });

  const onSave = rstest.fn();

  return {
    onSave,
    ...renderWithProviders(
      <DraftDetailsFormHarness onSave={onSave} site={buildDraftPlantingSite({ id: DRAFT_ID, name: '', ...site })} />,
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

describe('DraftSiteDetailsInputForm name validation', () => {
  it('will not save a draft without a name', async () => {
    const { onSave, user } = renderForm();

    await save(user);

    expect(await screen.findByText(strings.REQUIRED_FIELD)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('will not save a draft under a name a planting site already uses', async () => {
    const { onSave, user } = renderForm({ sites: [{ id: 2, name: 'Waikoloa' }] });

    await user.type(nameField(), 'Waikoloa');
    await save(user);

    expect(await screen.findByText(strings.SITE_WITH_NAME_EXISTS)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('will not save a draft under a name another draft already uses', async () => {
    const { onSave, user } = renderForm({ drafts: [{ id: 5, name: 'Waikoloa' }] });

    await user.type(nameField(), 'Waikoloa');
    await save(user);

    expect(await screen.findByText(strings.SITE_WITH_NAME_EXISTS)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('lets a draft keep the name it already has', async () => {
    const { onSave, user } = renderForm({
      drafts: [{ id: DRAFT_ID, name: 'Kaupulehu' }],
      site: { name: 'Kaupulehu' },
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

describe('DraftSiteDetailsInputForm reporting the details entered', () => {
  it('reports the name, description and time zone', async () => {
    const { onSave, user } = renderForm();

    await user.type(nameField(), 'Kaupulehu');
    await user.type(descriptionField(), 'North slope');
    await user.click(screen.getByRole('checkbox', { name: strings.USE_ORGANIZATION_TIME_ZONE }));
    await selectTimeZone(user, 'Hawaii Time');
    await save(user);

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'North slope',
          name: 'Kaupulehu',
          timeZone: 'Pacific/Honolulu',
        })
      )
    );
  });

  it('reports the project the draft belongs to', async () => {
    const { onSave, user } = renderForm({ site: { name: 'Kaupulehu' } });

    await selectDropdownOption(user, 'projectId', 'Hilo Forest');
    await save(user);

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ projectId: 7 })));
  });
});
