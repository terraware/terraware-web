import strings from 'src/strings';
import Button from '../common/button/Button';
import DialogBox from '../common/DialogBox/DialogBox';
import { Typography, useTheme } from '@mui/material';

export interface StatsWarninigDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function StatsWarninigDialog(props: StatsWarninigDialogProps): JSX.Element {
  const { onClose, open, onSubmit } = props;
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
        <Button id='confirm' onClick={onSubmit} label={strings.DELETE_STATISTICS} key='button-2' type='destructive' />,
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
