import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import strings from 'src/strings';

export type ProjectCheckSummaryProps = {
  projectName: string;
  countryName?: string;
  botanicalCountryName?: string;
  updates: number;
  speciesChecked: number;
  onEdit?: () => void;
};

const ProjectCheckSummary = ({
  projectName,
  countryName,
  botanicalCountryName,
  updates,
  speciesChecked,
  onEdit,
}: ProjectCheckSummaryProps): JSX.Element => {
  const theme = useTheme();

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
          {onEdit && (
            <Box
              component='button'
              onClick={onEdit}
              aria-label={strings.EDIT}
              sx={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Icon name='iconEdit' size='small' fillColor={theme.palette.TwClrIcnSecondary} />
            </Box>
          )}
        </Box>
        <Box display='flex' flexWrap='wrap' gap={theme.spacing(2)}>
          <Typography fontSize='16px' color={theme.palette.TwClrTxtSecondary}>
            {strings.COUNTRY}{' '}
            <Box component='span' color={theme.palette.TwClrTxt} fontWeight={500}>
              {countryName ?? '—'}
            </Box>
          </Typography>
          <Typography fontSize='16px' color={theme.palette.TwClrTxtSecondary}>
            {strings.BOTANICAL_COUNTRY}{' '}
            <Box component='span' color={theme.palette.TwClrTxt} fontWeight={500}>
              {botanicalCountryName ?? '—'}
            </Box>
          </Typography>
        </Box>
      </Box>
      <Box textAlign='right' whiteSpace='nowrap'>
        <Typography fontSize='16px' fontWeight={500} color={theme.palette.TwClrBaseBlack}>
          {strings.formatString(strings.SPECIES_CHECK_UPDATES, updates)}
        </Typography>
        <Typography fontSize='16px' color={theme.palette.TwClrBaseBlack}>
          {strings.formatString(strings.SPECIES_CHECK_SPECIES_CHECKED, speciesChecked)}
        </Typography>
      </Box>
    </Box>
  );
};

export default ProjectCheckSummary;
