import React, { type JSX, useCallback } from 'react';

import { Box, Typography } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import { useLocalization } from 'src/providers/hooks';
import { SummarizePlantingSiteMapEditResponsePayload } from 'src/queries/generated/plantingSites';
import { NumberFormatter } from 'src/types/Number';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

export type MapEditSummaryItem = SummarizePlantingSiteMapEditResponsePayload['summary'][number];

export type MapEditSummaryModalProps = {
  onBackToEdit: () => void;
  onSave: () => void;
  summary: MapEditSummaryItem[];
};

const fullName = (stratumName: string, substratumName: string) => `${stratumName}-${substratumName}`;

const signedArea = (formatter: NumberFormatter, areaHa: number) =>
  `${areaHa > 0 ? '+' : ''}${formatter.format(areaHa, { decimals: 2 })}`;

const MapEditSummaryModal = ({ onBackToEdit, onSave, summary }: MapEditSummaryModalProps): JSX.Element => {
  const { strings } = useLocalization();
  const numberFormatter = useNumberFormatter();

  const summaryItemText = useCallback(
    (item: MapEditSummaryItem): string => {
      const format = (template: string, ...values: (string | number)[]) =>
        strings.formatString(template, ...values) as string;

      switch (item.type) {
        case 'ObservationsAbandoned':
          return format(
            strings.MAP_EDIT_SUMMARY_OBSERVATIONS_ABANDONED,
            numberFormatter.format(item.observationIds.length)
          );
        case 'PermanentPlotCreated':
          return format(
            item.inExistingArea
              ? strings.MAP_EDIT_SUMMARY_PERMANENT_PLOT_CREATED_EXISTING_AREA
              : strings.MAP_EDIT_SUMMARY_PERMANENT_PLOT_CREATED_NEW_AREA,
            item.stratumName
          );
        case 'PlotAccepted':
          return format(
            strings.MAP_EDIT_SUMMARY_PLOT_ACCEPTED,
            item.plotNumber,
            fullName(item.stratumName, item.substratumName)
          );
        case 'PlotAdopted':
          return format(
            strings.MAP_EDIT_SUMMARY_PLOT_ADOPTED,
            item.plotNumber,
            fullName(item.stratumName, item.substratumName)
          );
        case 'PlotEjected':
          return format(
            strings.MAP_EDIT_SUMMARY_PLOT_EJECTED,
            item.plotNumber,
            fullName(item.stratumName, item.substratumName)
          );
        case 'SiteAreaChanged':
          return format(strings.MAP_EDIT_SUMMARY_SITE_AREA_CHANGED, signedArea(numberFormatter, item.areaHaDifference));
        case 'StratumCreated':
          return format(
            strings.MAP_EDIT_SUMMARY_STRATUM_CREATED,
            item.stratumName,
            numberFormatter.format(item.numPermanentPlots)
          );
        case 'StratumDeleted':
          return format(strings.MAP_EDIT_SUMMARY_STRATUM_DELETED, item.stratumName);
        case 'StratumUpdated':
          return format(
            strings.MAP_EDIT_SUMMARY_STRATUM_UPDATED,
            item.stratumName,
            signedArea(numberFormatter, item.areaHaDifference),
            numberFormatter.format(item.overlapPercent, { decimals: 1 }),
            numberFormatter.format(item.numPermanentPlots)
          );
        case 'SubstratumCreated':
          return format(strings.MAP_EDIT_SUMMARY_SUBSTRATUM_CREATED, fullName(item.stratumName, item.substratumName));
        case 'SubstratumDeleted':
          return format(strings.MAP_EDIT_SUMMARY_SUBSTRATUM_DELETED, fullName(item.stratumName, item.substratumName));
        case 'SubstratumUpdated':
          return format(
            strings.MAP_EDIT_SUMMARY_SUBSTRATUM_UPDATED,
            fullName(item.stratumName, item.substratumName),
            signedArea(numberFormatter, item.areaHaDifference),
            numberFormatter.format(item.overlapPercent, { decimals: 1 })
          );
      }
    },
    [numberFormatter, strings]
  );

  return (
    <DialogBox
      onClose={onBackToEdit}
      open={true}
      title={strings.MAP_EDIT_SUMMARY_TITLE}
      size='medium'
      message={summary.length ? strings.MAP_EDIT_SUMMARY_MESSAGE : strings.MAP_EDIT_SUMMARY_NO_CHANGES}
      middleButtons={[
        <Button
          id='back-to-edit-map-edit-summary'
          key='back'
          label={strings.BACK_TO_EDIT}
          onClick={onBackToEdit}
          priority='secondary'
          type='passive'
        />,
        <Button id='save-map-edit-summary' key='save' label={strings.SAVE_CHANGES} onClick={onSave} />,
      ]}
    >
      {summary.length > 0 && (
        <Box component='ul' textAlign='left' marginBottom={0} marginTop={2}>
          {summary.map((item, index) => (
            <Typography component='li' key={index}>
              {summaryItemText(item)}
            </Typography>
          ))}
        </Box>
      )}
    </DialogBox>
  );
};

export default MapEditSummaryModal;
