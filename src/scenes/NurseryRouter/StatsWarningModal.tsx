import React, { type JSX } from 'react';

import { Typography, useTheme } from '@mui/material';

import strings from 'src/strings';

import DialogBox from '../../components/common/DialogBox/DialogBox';
import Button from '../../components/common/button/Button';

type CompleteUpdateProps = {
  id: number;
  val: boolean;
};

export interface StatsWarninigDialogProps {
  open: boolean;
  completeUpdateProps?: { id: number; val: boolean };
  onClose: () => void;
  onSubmit: (completeUpdateProps?: CompleteUpdateProps) => void;
}

export default function StatsWarninigDialog(props: StatsWarninigDialogProps): JSX.Element {
  const { onClose, open, completeUpdateProps, onSubmit } = props;
  const theme = useTheme();

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.UNDO_PLANTING_COMPLETE}
      size='medium'
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button
          id='confirm'
          onClick={() => onSubmit(completeUpdateProps)}
          label={strings.DELETE_STATISTICS}
          key='button-2'
          type='destructive'
        />,
      ]}
      skrim={true}
    >
      <Typography marginBottom={theme.spacing(3)} justifyContent='center'>
        {strings.STATS_WARNING_DESCRIPTION_1}
      </Typography>
      <Typography marginBottom={theme.spacing(3)} justifyContent='center'>
        {strings.STATS_WARNING_DESCRIPTION_2}
      </Typography>
    </DialogBox>
  );
}
