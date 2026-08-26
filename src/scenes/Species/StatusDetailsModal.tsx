import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { DateTime } from 'luxon';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useBotanicalCountries } from 'src/hooks/useBotanicalCountries';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { Project } from 'src/types/Project';

import ProjectCheckSummary from './SpeciesCheck/ProjectCheckSummary';
import { Nativity } from './SpeciesCheck/types';
import SpeciesNativityBadge from './SpeciesNativityBadge';

export type StatusDetailsModalProps = {
  onClose: () => void;
  onEdit?: () => void;
  speciesName?: string;
  project?: Project;
  targetName?: string;
  countryCode?: string;
  botanicalCountryCode?: string;
  nativity?: Nativity;
  overriddenBy?: string;
  overriddenTime?: string;
  justification?: string;
};

const StatusDetailsModal = ({
  onClose,
  onEdit,
  speciesName,
  project,
  targetName,
  countryCode,
  botanicalCountryCode,
  nativity,
  overriddenBy,
  overriddenTime,
  justification,
}: StatusDetailsModalProps): JSX.Element => {
  const theme = useTheme();
  const { countries } = useLocalization();
  const { botanicalCountries } = useBotanicalCountries();

  const resolvedCountryCode = project?.countryCode ?? countryCode;
  const resolvedBotanicalCountryCode = project?.botanicalCountryCode ?? botanicalCountryCode;
  const resolvedTargetName = project?.name ?? targetName ?? '';

  const countryName = useMemo(
    () => countries?.find((country) => country.code === resolvedCountryCode)?.name,
    [countries, resolvedCountryCode]
  );
  const botanicalCountryName = useMemo(
    () => botanicalCountries.find((bc) => bc.code === resolvedBotanicalCountryCode)?.name,
    [botanicalCountries, resolvedBotanicalCountryCode]
  );

  const overriddenOn = (() => {
    if (!overriddenTime) {
      return undefined;
    }
    const parsed = DateTime.fromISO(overriddenTime);
    return parsed.isValid ? parsed.toFormat('yyyy-MM-dd') : overriddenTime;
  })();

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.STATUS_DETAILS}
      size='large'
      scrolled
      middleButtons={[
        <Button id='close' key='close' label={strings.CLOSE} onClick={onClose} priority='secondary' type='passive' />,
        ...(onEdit ? [<Button id='edit-status' key='edit' label={strings.EDIT} onClick={onEdit} />] : []),
      ]}
    >
      <Box display='flex' flexDirection='column' gap={theme.spacing(3)} textAlign='left'>
        <Box
          sx={{
            backgroundColor: theme.palette.TwClrBgSecondary,
            padding: theme.spacing(2),
          }}
        >
          <ProjectCheckSummary
            projectName={resolvedTargetName}
            countryName={countryName}
            botanicalCountryName={botanicalCountryName}
          />
        </Box>
        {speciesName && (
          <Typography fontSize='16px' color={theme.palette.TwClrTxt}>
            {speciesName}
          </Typography>
        )}
        <Box display='flex' alignItems='center'>
          <SpeciesNativityBadge nativity={nativity} />
        </Box>
        {justification && (
          <Typography fontSize='16px' color={theme.palette.TwClrTxt}>
            {strings.formatString(strings.SPECIES_OVERRIDE_JUSTIFICATION, justification)}
          </Typography>
        )}
        {overriddenBy && overriddenOn && (
          <Typography fontSize='16px' color={theme.palette.TwClrTxt}>
            {strings.formatString(strings.SPECIES_OVERRIDE_BY, overriddenBy, overriddenOn)}
          </Typography>
        )}
      </Box>
    </DialogBox>
  );
};

export default StatusDetailsModal;
