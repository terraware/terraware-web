import React from 'react';
import strings from 'src/strings';
import { Box, Grid, Typography } from '@mui/material';
import { Icon, Select } from '@terraware/web-components';
import { Accession2 } from 'src/api/accessions2/accession';
import { ACCESSION_2_STATES } from 'src/types/Accession';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  messageIcon: {
    fill: '#3A4445',
  },
}));

export interface EditStateProps {
  accession: Accession2;
  record: Accession2;
  onChange: (id: string, value: unknown) => void;
  error?: string;
}

export default function EditState(props: EditStateProps): JSX.Element {
  const classes = useStyles();
  const { accession, record, onChange, error } = props;

  const getStatesForCurrentState = () => {
    switch (accession.state) {
      case 'Awaiting Check-In': {
        return ['Awaiting Processing', 'Processing', 'Drying', 'In Storage', 'Used Up'];
      }
      case 'Awaiting Processing':
      case 'Processing':
      case 'Drying':
      case 'In Storage': {
        return ['Awaiting Processing', 'Processing', 'Drying', 'In Storage'];
      }
      default:
        return ACCESSION_2_STATES;
    }
  };

  return (
    <>
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
            errorText={error}
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
    </>
  );
}
