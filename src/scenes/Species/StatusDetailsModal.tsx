import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { DateTime } from 'luxon';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

import { Nativity } from './SpeciesCheck/types';
import SpeciesNativityBadge from './SpeciesNativityBadge';

export type StatusDetailsModalProps = {
  onClose: () => void;
  onEdit?: () => void;
  nativity?: Nativity;
  overriddenBy?: string;
  overriddenTime?: string;
  justification?: string;
};

const StatusDetailsModal = ({
  onClose,
  onEdit,
  nativity,
  overriddenBy,
  overriddenTime,
  justification,
}: StatusDetailsModalProps): JSX.Element => {
  const theme = useTheme();

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
      title={strings.STATUS}
      size='medium'
      middleButtons={[<Button id='close' key='close' label={strings.CLOSE} onClick={onClose} />]}
    >
      <Box display='flex' flexDirection='column' gap={theme.spacing(2)} textAlign='left'>
        <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
          <SpeciesNativityBadge nativity={nativity} />
          {onEdit && (
            <Button id='edit-override' label={strings.EDIT} priority='secondary' type='passive' onClick={onEdit} />
          )}
        </Box>
        {overriddenBy && overriddenOn && (
          <Typography fontSize='16px' color={theme.palette.TwClrTxt}>
            {strings.formatString(strings.SPECIES_OVERRIDE_BY, overriddenBy, overriddenOn)}
          </Typography>
        )}
        {justification && (
          <Typography fontSize='16px' color={theme.palette.TwClrTxt}>
            {strings.formatString(strings.SPECIES_OVERRIDE_JUSTIFICATION, justification)}
          </Typography>
        )}
      </Box>
    </DialogBox>
  );
};

export default StatusDetailsModal;
