import React from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw/http';

import DraftSiteDetailsModal from 'src/scenes/PlantingSitesRouter/edit/DraftSiteDetailsModal';
import strings from 'src/strings';
import { buildDraftPlantingSite, dialogTitled, mockGet, renderWithProviders, server } from 'src/test-utils';
import { DraftPlantingSite } from 'src/types/PlantingSite';

const SEARCH_URL = '/api/v1/search';
const PROJECTS_URL = '/api/v1/projects';

const TITLE = 'Edit Planting Site';
const SAVE_LABEL = strings.SAVE;

type NamedSite = { id: number; name: string };

/**
 * The details form looks up both the existing planting sites and the existing drafts through the
 * one search endpoint, told apart by the `prefix` in the body.
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

type RenderOptions = {
  busy?: boolean;
  drafts?: NamedSite[];
  site?: Partial<DraftPlantingSite>;
  sites?: NamedSite[];
  withSaveAndClose?: boolean;
};

const renderModal = ({ busy = false, drafts, site, sites, withSaveAndClose }: RenderOptions = {}) => {
  mockNameSearches(sites, drafts);
  mockGet(PROJECTS_URL, { projects: [] });

  const onClose = rstest.fn();
  const onSave = rstest.fn();
  const onSaveAndClose = rstest.fn();

  return {
    onClose,
    onSave,
    onSaveAndClose,
    ...renderWithProviders(
      <DraftSiteDetailsModal
        busy={busy}
        onClose={onClose}
        onSave={onSave}
        onSaveAndClose={withSaveAndClose ? onSaveAndClose : undefined}
        saveLabel={SAVE_LABEL}
        site={buildDraftPlantingSite({ name: '', ...site })}
        title={TITLE}
      />
    ),
  };
};

const modal = () => dialogTitled(TITLE);

/** `Textfield` points its `<label for>` at a wrapper div rather than the input it wraps. */
const nameField = () => document.querySelector('#name input') as HTMLInputElement;

const buttonNamed = (name: string) => within(modal()).getByRole('button', { name });

/** Saving is held until the existing names are known, so a duplicate can't slip through. */
const clickWhenReady = async (user: UserEvent, name: string) => {
  const button = buttonNamed(name);
  await waitFor(() => expect(button).toBeEnabled());
  await user.click(button);
};

describe('DraftSiteDetailsModal', () => {
  it('hands the edited site to the caller to save', async () => {
    const { onSave, user } = renderModal({ site: { name: 'Kaupulehu' } });

    await user.clear(nameField());
    await user.type(nameField(), 'Waikoloa');
    await clickWhenReady(user, SAVE_LABEL);

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Waikoloa' })));
  });

  it('will not save a site without a name', async () => {
    const { onSave, user } = renderModal();

    await clickWhenReady(user, SAVE_LABEL);

    expect(await screen.findByText(strings.REQUIRED_FIELD)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('will not save a site under a name that is already taken', async () => {
    const { onSave, user } = renderModal({ sites: [{ id: 2, name: 'Waikoloa' }] });

    await user.type(nameField(), 'Waikoloa');
    await clickWhenReady(user, SAVE_LABEL);

    expect(await screen.findByText(strings.SITE_WITH_NAME_EXISTS)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('cannot be saved until the names it validates against have loaded', async () => {
    const { user } = renderModal({ site: { name: 'Kaupulehu' } });

    expect(buttonNamed(SAVE_LABEL)).toBeDisabled();

    await waitFor(() => expect(buttonNamed(SAVE_LABEL)).toBeEnabled());
    // Cancelling is never held up by the lookup.
    await user.click(buttonNamed(strings.CANCEL));
  });

  it('reports nothing when it is cancelled', async () => {
    const { onClose, onSave, user } = renderModal({ site: { name: 'Kaupulehu' } });

    await user.type(nameField(), ' North');
    await user.click(buttonNamed(strings.CANCEL));

    expect(onClose).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('holds both saving and cancelling while a save is in flight', async () => {
    renderModal({ busy: true, site: { name: 'Kaupulehu' }, withSaveAndClose: true });

    await waitFor(() => expect(buttonNamed(strings.CANCEL)).toBeDisabled());
    expect(buttonNamed(SAVE_LABEL)).toBeDisabled();
    expect(buttonNamed(strings.SAVE_AND_CLOSE)).toBeDisabled();
  });
});

describe('DraftSiteDetailsModal save and close', () => {
  it('is only offered when the caller can handle it', async () => {
    renderModal({ site: { name: 'Kaupulehu' } });

    await waitFor(() => expect(buttonNamed(SAVE_LABEL)).toBeEnabled());
    expect(within(modal()).queryByRole('button', { name: strings.SAVE_AND_CLOSE })).not.toBeInTheDocument();
  });

  it('closes the site out instead of carrying on with it', async () => {
    const { onSave, onSaveAndClose, user } = renderModal({ site: { name: 'Kaupulehu' }, withSaveAndClose: true });

    await clickWhenReady(user, strings.SAVE_AND_CLOSE);

    await waitFor(() => expect(onSaveAndClose).toHaveBeenCalledWith(expect.objectContaining({ name: 'Kaupulehu' })));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('will not close out a site that has no name', async () => {
    const { onSaveAndClose, user } = renderModal({ withSaveAndClose: true });

    await clickWhenReady(user, strings.SAVE_AND_CLOSE);

    expect(await screen.findByText(strings.REQUIRED_FIELD)).toBeInTheDocument();
    expect(onSaveAndClose).not.toHaveBeenCalled();
  });
});
