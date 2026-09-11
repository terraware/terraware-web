import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import strings from 'src/strings';

export type ProjectCheckSummaryProps = {
  projectName: string;
  countryName?: string;
  botanicalCountryName?: string;
  showLocation?: boolean;
  updates?: number;
  updatesLabel?: React.ReactNode;
  speciesChecked?: number;
};

export const suggestionsCountLabel = (suggestions: number): React.ReactNode =>
  strings.formatString(
    suggestions === 1 ? strings.SPECIES_CHECK_SUGGESTION : strings.SPECIES_CHECK_SUGGESTIONS,
    suggestions
  );

const ProjectCheckSummary = ({
  projectName,
  countryName,
  botanicalCountryName,
  showLocation = true,
  updatesLabel,
  speciesChecked,
}: ProjectCheckSummaryProps): JSX.Element => {
  const theme = useTheme();
  const showSpeciesChecked = speciesChecked !== undefined;
  const showUpdatesLine = updatesLabel !== undefined;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: theme.spacing(2),
      }}
    >
      <Box>
        <Box display='flex' alignItems='center' gap={theme.spacing(1)} marginBottom={theme.spacing(0.5)}>
          <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrTxtSecondary}>
            {projectName}
          </Typography>
        </Box>
        {showLocation && (
          <Box display='flex' flexWrap='wrap' gap={theme.spacing(2)}>
            <Typography fontSize='16px' color={theme.palette.TwClrTxtSecondary}>
              {strings.COUNTRY}{' '}
              <Box component='span' color={theme.palette.TwClrBaseBlack}>
                {countryName ?? '—'}
              </Box>
            </Typography>
            <Typography fontSize='16px' color={theme.palette.TwClrTxtSecondary}>
              {strings.BOTANICAL_COUNTRY}{' '}
              <Box component='span' color={theme.palette.TwClrBaseBlack}>
                {botanicalCountryName ?? '—'}
              </Box>
            </Typography>
          </Box>
        )}
      </Box>
      {(showSpeciesChecked || showUpdatesLine) && (
        <Box textAlign='right' whiteSpace='nowrap'>
          {showSpeciesChecked && (
            <Typography fontSize='16px' color={theme.palette.TwClrBaseBlack}>
              {strings.formatString(strings.SPECIES_CHECK_SPECIES_CHECKED, speciesChecked)}
            </Typography>
          )}
          {showUpdatesLine && (
            <Typography fontSize='16px' fontWeight={500} color={theme.palette.TwClrBaseBlack}>
              {updatesLabel}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProjectCheckSummary;
