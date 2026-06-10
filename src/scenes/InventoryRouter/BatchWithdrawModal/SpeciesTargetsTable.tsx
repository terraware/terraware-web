import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { useLocalization } from 'src/providers';
import { SpeciesTargetForSubstratum } from 'src/queries/search/speciesTargetsForSubstratum';

export type SpeciesTargetsTableProps = {
  rows: SpeciesTargetForSubstratum[];
};

const SpeciesTargetsTable = ({ rows }: SpeciesTargetsTableProps): JSX.Element | null => {
  const theme = useTheme();
  const { strings } = useLocalization();

  if (rows.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography
        fontSize='14px'
        color={theme.palette.TwClrTxtSecondary}
        marginBottom={theme.spacing(1)}
        textAlign={'left'}
      >
        {strings.SPECIES_WITH_TARGETS_IN_SEASON_DESCRIPTION}
      </Typography>
      <Box sx={{ border: `1px solid ${theme.palette.TwClrBrdrTertiary}`, borderRadius: '8px' }}>
        <Box
          display='grid'
          gridTemplateColumns='2fr 1fr 1fr 1fr'
          gap={theme.spacing(1)}
          padding={theme.spacing(1, 2)}
          sx={{
            backgroundColor: theme.palette.TwClrBgSuccessTertiary,
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
          }}
        >
          <Typography fontSize='14px' fontWeight={600} textAlign='left'>
            {strings.SPECIES}
          </Typography>
          <Typography fontSize='14px' fontWeight={600} textAlign='right'>
            {strings.TARGET}
          </Typography>
          <Typography fontSize='14px' fontWeight={600} textAlign='right'>
            {strings.ALREADY_WITHDRAWN}
          </Typography>
          <Typography fontSize='14px' fontWeight={600} textAlign='right'>
            {strings.NOT_YET_WITHDRAWN}
          </Typography>
        </Box>
        {rows.map((row) => (
          <Box
            key={row.speciesId}
            display='grid'
            gridTemplateColumns='2fr 1fr 1fr 1fr'
            gap={theme.spacing(1)}
            padding={theme.spacing(1, 2)}
            sx={{ textAlign: 'left' }}
          >
            <Typography fontSize='14px'>
              {row.scientificName}
              {row.commonName ? ` (${row.commonName})` : ''}
            </Typography>
            <Typography fontSize='14px' textAlign='right'>
              {row.target.toLocaleString()}
            </Typography>
            <Typography fontSize='14px' textAlign='right'>
              {row.alreadyWithdrawn.toLocaleString()}
            </Typography>
            <Typography fontSize='14px' textAlign='right'>
              {row.notYetWithdrawn.toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SpeciesTargetsTable;
