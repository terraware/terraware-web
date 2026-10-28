import React from 'react';

import { screen } from '@testing-library/react';

import MapEditSummaryModal, {
  MapEditSummaryItem,
} from 'src/scenes/PlantingSitesRouter/edit/editor/MapEditSummaryModal';
import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

const sentence = (template: string, ...values: (string | number)[]) =>
  strings.formatString(template, ...values) as string;

const renderModal = (summary: MapEditSummaryItem[], onBackToEdit = () => undefined, onSave = () => undefined) =>
  renderWithProviders(<MapEditSummaryModal onBackToEdit={onBackToEdit} onSave={onSave} summary={summary} />);

describe('MapEditSummaryModal', () => {
  it('describes each change, with signed areas and stratum-substratum names', () => {
    renderModal([
      { type: 'SiteAreaChanged', areaHaDifference: 1.5 },
      {
        type: 'StratumUpdated',
        areaHaDifference: -0.25,
        numPermanentPlots: 3,
        overlapPercent: 87.5,
        stratumName: 'West',
      },
      { type: 'SubstratumCreated', stableId: 'a', stratumName: 'East', substratumName: '2' },
      { type: 'PermanentPlotCreated', inExistingArea: true, stratumName: 'West' },
      { type: 'PermanentPlotCreated', inExistingArea: false, stratumName: 'East' },
    ]);

    expect(screen.getByText(strings.MAP_EDIT_SUMMARY_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText(sentence(strings.MAP_EDIT_SUMMARY_SITE_AREA_CHANGED, '+1.5'))).toBeInTheDocument();
    expect(
      screen.getByText(sentence(strings.MAP_EDIT_SUMMARY_STRATUM_UPDATED, 'West', '-0.25', '87.5', '3'))
    ).toBeInTheDocument();
    expect(screen.getByText(sentence(strings.MAP_EDIT_SUMMARY_SUBSTRATUM_CREATED, 'East-2'))).toBeInTheDocument();
    expect(
      screen.getByText(sentence(strings.MAP_EDIT_SUMMARY_PERMANENT_PLOT_CREATED_EXISTING_AREA, 'West'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(sentence(strings.MAP_EDIT_SUMMARY_PERMANENT_PLOT_CREATED_NEW_AREA, 'East'))
    ).toBeInTheDocument();
  });

  it('says nothing will change when the summary is empty', () => {
    renderModal([]);

    expect(screen.getByText(strings.MAP_EDIT_SUMMARY_NO_CHANGES)).toBeInTheDocument();
    expect(screen.queryByText(strings.MAP_EDIT_SUMMARY_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('goes back to editing or saves depending on the button', async () => {
    const calls: string[] = [];
    const { user } = renderModal(
      [{ type: 'SiteAreaChanged', areaHaDifference: -2 }],
      () => void calls.push('back'),
      () => void calls.push('save')
    );

    await user.click(screen.getByRole('button', { name: strings.BACK_TO_EDIT }));
    expect(calls).toEqual(['back']);

    await user.click(screen.getByRole('button', { name: strings.SAVE_CHANGES }));
    expect(calls).toEqual(['back', 'save']);
  });
});
