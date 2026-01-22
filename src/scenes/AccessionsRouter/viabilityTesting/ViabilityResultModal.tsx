import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import AccessionService from 'src/services/AccessionService';
import strings from 'src/strings';
import { Accession } from 'src/types/Accession';
import { ViabilityTest } from 'src/types/Accession';
import useSnackbar from 'src/utils/useSnackbar';

import { getCutTestViabilityPercent } from './utils';

export interface ViabilityResultModalProps {
  open: boolean;
  accession: Accession;
  onClose: () => void;
  reload: () => void;
  viabilityTest: ViabilityTest;
}

export default function ViabilityResultModal(props: ViabilityResultModalProps): JSX.Element {
  const { onClose, open, accession, reload, viabilityTest } = props;
  const theme = useTheme();

  const snackbar = useSnackbar();

  const saveResult = async () => {
    if (accession) {
      const newAccession = { ...accession, viabilityPercent: getViabilityPercent() };
      const response = await AccessionService.updateAccession(newAccession);

      if (response.requestSucceeded) {
        reload();
        onClose();
      } else {
        snackbar.toastError();
      }
    }
  };

  const getViabilityPercent = () => {
    if (viabilityTest?.testType === 'Cut') {
      return getCutTestViabilityPercent(viabilityTest);
    }

    let sum = 0;
    viabilityTest?.testResults?.forEach((tr) => {
      sum = sum + Number(tr.seedsGerminated);
    });
    const result = (sum / Number(viabilityTest.seedsTested)) * 100;
    // eslint-disable-next-line no-bitwise
    return isNaN(result) ? 0 : ~~result;
  };

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.VIABILITY_TEST}
      size='large'
      middleButtons={[
        <Button
          id='cancelViabilityResult'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button
          id='saveViabilityResult'
          onClick={() => void saveResult()}
          label={strings.APPLY_RESULT}
          key='button-2'
        />,
      ]}
      scrolled={true}
    >
      <Box padding={3}>
        <Typography color={theme.palette.TwClrTxtSecondary}>{strings.VIABILITY_RESULT}</Typography>
        <Typography fontSize='24px'>{getViabilityPercent()}%</Typography>
      </Box>

      <Typography marginBottom={3}>{strings.APPLY_RESULT_QUESTION}</Typography>
    </DialogBox>
  );
}
