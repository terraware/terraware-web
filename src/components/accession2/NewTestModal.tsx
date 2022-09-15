import { Grid, Typography } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';
import { Accession2 } from 'src/api/accessions2/accession';
import strings from 'src/strings';

export interface NewTestModalProps {
  open: boolean;
  accession: Accession2;
  onClose: () => void;
  reload: () => void;
}

export default function NewTestModal(props: NewTestModalProps): JSX.Element {
  const { onClose, open } = props;

  const saveTest = () => {
    return true;
  };

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.VIABILITY_TEST}
      size='x-large'
      middleButtons={[
        <Button label={strings.CANCEL} type='passive' onClick={onClose} priority='secondary' key='button-1' />,
        <Button onClick={saveTest} label={strings.SAVE} key='button-2' />,
      ]}
    >
      <Grid container item xs={12} spacing={2} textAlign='left'>
        <Grid item xs={12}>
          <Typography>New test</Typography>
        </Grid>
      </Grid>
    </DialogBox>
  );
}
