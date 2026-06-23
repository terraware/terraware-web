import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { useLocalization } from 'src/providers';
import { PlantingDateRequestSpeciesDetail } from 'src/queries/search/plantingDateRequests';

export type NurserySummaryRowProps = {
  species: PlantingDateRequestSpeciesDetail;
  ready: number;
  index: number;
};

type Coverage = 'COVERED' | 'PARTIALLY_COVERED' | 'NOT_COVERED';

const NurserySummaryRow = ({ species, ready, index }: NurserySummaryRowProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();

  const coverage: Coverage = useMemo(() => {
    if (ready === 0) {
      return 'NOT_COVERED';
    }
    return ready >= species.requestedQuantity ? 'COVERED' : 'PARTIALLY_COVERED';
  }, [ready, species.requestedQuantity]);

  const coverageColor =
    coverage === 'COVERED'
      ? theme.palette.TwClrTxtSuccess
      : coverage === 'PARTIALLY_COVERED'
        ? theme.palette.TwClrTxtWarning
        : theme.palette.TwClrTxtDanger;

  const coverageLabel =
    coverage === 'COVERED'
      ? strings.COVERED
      : coverage === 'PARTIALLY_COVERED'
        ? strings.PARTIALLY_COVERED
        : strings.NOT_COVERED;

  return (
    <Box display='grid' gridTemplateColumns='2fr 1fr 1fr 1fr' gap={theme.spacing(1)} padding={theme.spacing(1, 2)}>
      <Box>
        <Typography fontSize='16px' color={theme.palette.TwClrBaseBlack} textAlign='left' fontWeight={400}>
          {species.scientificName}
        </Typography>
        {species.commonName && (
          <Typography fontSize='16px' color={theme.palette.TwClrTxt} textAlign='left' fontWeight={400}>
            ({species.commonName})
          </Typography>
        )}
      </Box>
      <Typography fontSize='16px' textAlign='right' color={theme.palette.TwClrTxt}>
        {ready.toLocaleString()}
      </Typography>
      <Typography fontSize='16px' textAlign='right' color={theme.palette.TwClrTxt}>
        {species.requestedQuantity.toLocaleString()}
      </Typography>
      <Typography fontSize='16px' textAlign='right' color={coverageColor} fontWeight={600}>
        {coverageLabel}
      </Typography>
    </Box>
  );
};

export default NurserySummaryRow;
