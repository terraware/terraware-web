import React, { type JSX, useEffect } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { preventDefaultEvent } from '@terraware/web-components/utils';

import AddLink from 'src/components/common/AddLink';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import AccessionService from 'src/services/AccessionService';
import strings from 'src/strings';
import { Accession } from 'src/types/Accession';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

export interface ViabilityDialogProps {
  open: boolean;
  accession: Accession;
  onClose: () => void;
  reload: () => void;
  setNewViabilityTestOpened: React.Dispatch<React.SetStateAction<boolean>>;
  changeTab: (newValue: string) => void;
  title: string;
}

export default function ViabilityDialog(props: ViabilityDialogProps): JSX.Element {
  const { onClose, open, accession, reload, setNewViabilityTestOpened, changeTab } = props;

  const [record, setRecord, , onChangeCallback] = useForm(accession);
  const [error, setError] = useForm('');
  const snackbar = useSnackbar();

  const saveQuantity = async () => {
    if (record.viabilityPercent) {
      if (record.viabilityPercent > 100) {
        setError(strings.VALUE_CANT_EXCEED_100);
        return;
      }
    } else {
      setError(strings.REQUIRED_FIELD);
      return;
    }
    setError('');
    const response = await AccessionService.updateAccession(record);
    if (response.requestSucceeded) {
      reload();
      onCloseHandler();
    } else {
      snackbar.toastError();
    }
  };

  useEffect(() => {
    setRecord(accession);
  }, [accession, setRecord]);

  const onCloseHandler = () => {
    setError('');
    setRecord(accession);
    onClose();
  };

  const onAddViabilityTest = () => {
    changeTab('viabilityTesting');
    setNewViabilityTestOpened(true);
    onCloseHandler();
  };

  return (
    <>
      <DialogBox
        onClose={onCloseHandler}
        open={open}
        title={props.title}
        size='small'
        middleButtons={[
          <Button
            id='cancelEditViabilityTest'
            label={strings.CANCEL}
            type='passive'
            onClick={onCloseHandler}
            priority='secondary'
            key='button-1'
          />,
          <Button id='saveEditViabilityTest' onClick={() => void saveQuantity()} label={strings.SAVE} key='button-2' />,
        ]}
      >
        <Grid container spacing={2} textAlign='left'>
          <Grid item xs={10} textAlign='left'>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Textfield
                label={strings.VIABILITY_RATE}
                id='viabilityPercent'
                onChange={onChangeCallback('viabilityPercent')}
                type='text'
                value={record.viabilityPercent?.toString()}
                errorText={error}
              />
              <Box paddingLeft={2} sx={{ paddingTop: error === '' ? 3 : 0 }}>
                <Typography>%</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <AddLink
              id='addViabilityTestButton'
              onClick={(event: any) => {
                if (event) {
                  preventDefaultEvent(event);
                }
                onAddViabilityTest();
              }}
              large={true}
              text={strings.ADD_A_VIABILITY_TEST}
            />
          </Grid>
        </Grid>
      </DialogBox>
    </>
  );
}
