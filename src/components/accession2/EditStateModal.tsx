import React, { useEffect } from 'react';
import strings from 'src/strings';
import Button from '../common/button/Button';
import DialogBox from '../common/DialogBox/DialogBox';
import { Box, Grid, Typography } from '@mui/material';
import { Icon, Select } from '@terraware/web-components';
import { Accession2 } from 'src/api/accessions2/accession';
import useForm from 'src/utils/useForm';
import { updateAccession2 } from 'src/api/accessions2/accession';
import { ACCESSION_2_STATES } from 'src/types/Accession';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  messageIcon: {
    fill: '#3A4445',
  },
}));

export interface EditStateDialogProps {
  open: boolean;
  accession: Accession2;
  onClose: () => void;
  reload: () => void;
}

export default function EditLocationDialog(props: EditStateDialogProps): JSX.Element {
  const classes = useStyles();
  const { onClose, open, accession, reload } = props;
  const [record, setRecord, onChange] = useForm(accession);

  useEffect(() => {
    setRecord(accession);
  }, [accession, setRecord]);

  const saveState = async () => {
    if (record) {
      const response = await updateAccession2(record);
      if (response.requestSucceeded) {
        reload();
      }
      onClose();
    }
  };

  const getStatesForCurrentState = () => {
    switch (accession.state) {
      case 'Awaiting Check-In': {
        return ['Awaiting Processing', 'Cleaning', 'Drying', 'In Storage', 'Used Up'];
      }
      case 'Awaiting Processing':
      case 'Cleaning':
      case 'Drying':
      case 'In Storage': {
        return ['Awaiting Check-In', 'Awaiting Processing', 'Cleaning', 'Drying', 'In Storage', 'Used Up'];
      }
      default:
        return ACCESSION_2_STATES;
    }
  };

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.STATUS}
      size='small'
      middleButtons={[
        <Button label={strings.CANCEL} type='passive' onClick={onClose} priority='secondary' key='button-1' />,
        <Button onClick={saveState} label={strings.UPDATE} key='button-2' />,
      ]}
    >
      <Grid item xs={12} textAlign='left'>
        <Grid item xs={12}>
          <Select
            label={strings.STATUS}
            placeholder={strings.SELECT}
            options={getStatesForCurrentState()}
            onChange={(value: string) => onChange('state', value)}
            selectedValue={record?.state}
            fullWidth={true}
            readonly={true}
          />
        </Grid>
      </Grid>
      <Box
        sx={{
          background: '#FDE7C3',
          borderRadius: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: (theme) => theme.spacing(2, 1),
          marginTop: (theme) => theme.spacing(4),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Icon name='warning' className={classes.messageIcon} size='large' />
          <Typography sx={{ color: '#000000', fontSize: '14px', paddingLeft: 1 }}>
            {strings.UPDATE_STATUS_WARNING}
          </Typography>
        </Box>
      </Box>
    </DialogBox>
  );
}
