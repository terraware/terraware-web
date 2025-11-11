import React from 'react';

import { Box, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import strings from 'src/strings';

type PlotActionsProps = {
  unrecognizedSpecies?: string[];
  onExportData: () => void;
  onMatchSpecies: () => void;
};

const PlotActions = ({ unrecognizedSpecies, onExportData, onMatchSpecies }: PlotActionsProps) => {
  const theme = useTheme();
  return (
    <Box
      display={'flex'}
      justifyContent={'end'}
      borderBottom={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
      paddingBottom={1.5}
    >
      <Button
        priority='ghost'
        label={strings.MATCH_UNRECOGNIZED_SPECIES}
        icon='iconSynced'
        onClick={onMatchSpecies}
        disabled={!unrecognizedSpecies || unrecognizedSpecies.length === 0}
        sx={{ fontWeight: '400 !important' }}
      />
      <Button
        priority='ghost'
        label={strings.EXPORT_DATA}
        icon='iconImport'
        onClick={onExportData}
        sx={{ fontWeight: '400 !important' }}
      />
    </Box>
  );
};

export default PlotActions;
