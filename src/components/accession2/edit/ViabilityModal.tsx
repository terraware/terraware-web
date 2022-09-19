import React, { useEffect } from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { Box, Grid, Link, Typography } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { Accession2, updateAccession2 } from 'src/api/accessions2/accession';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { preventDefaultEvent } from '@terraware/web-components/utils';

export interface ViabilityDialogProps {
  open: boolean;
  accession: Accession2;
  onClose: () => void;
  reload: () => void;
  setNewViabilityTestOpened: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ViabilityDialog(props: ViabilityDialogProps): JSX.Element {
  const { onClose, open, accession, reload, setNewViabilityTestOpened } = props;

  const [record, setRecord, onChange] = useForm(accession);
  const snackbar = useSnackbar();

  const saveQuantity = async () => {
    const response = await updateAccession2(record);
    if (response.requestSucceeded) {
      reload();
      onCloseHandler();
    } else {
      snackbar.toastError();
      setRecord(accession);
      onCloseHandler();
    }
  };

  useEffect(() => {
    setRecord(accession);
  }, [accession, setRecord]);

  const onCloseHandler = () => {
    setRecord(accession);
    onClose();
  };

  const onAddViabilityTest = () => {
    setNewViabilityTestOpened(true);
    onCloseHandler();
  };

  return (
    <>
      <DialogBox
        onClose={onCloseHandler}
        open={open}
        title={strings.VIABILITY}
        size='small'
        middleButtons={[
          <Button label={strings.CANCEL} type='passive' onClick={onCloseHandler} priority='secondary' key='button-1' />,
          <Button onClick={saveQuantity} label={strings.SAVE} key='button-2' />,
        ]}
      >
        <Grid container spacing={2} textAlign='left'>
          <Grid item xs={8} textAlign='left'>
            <Box sx={{ display: 'flex', alignItems: 'end', paddingBottom: '9px' }}>
              <Textfield
                label={strings.VIABILITY_RATE}
                id='viabilityPercent'
                onChange={onChange}
                type='text'
                value={record.viabilityPercent}
              />
              <Box paddingLeft={1}>
                <Typography>%</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Link
              href='#'
              id='addViabilityTestButton'
              onClick={(event: React.SyntheticEvent) => {
                preventDefaultEvent(event);
                onAddViabilityTest();
              }}
              sx={{ textDecoration: 'none' }}
            >
              {strings.ADD_A_VIABILITY_TESTING}
            </Link>
          </Grid>
        </Grid>
      </DialogBox>
    </>
  );
}
