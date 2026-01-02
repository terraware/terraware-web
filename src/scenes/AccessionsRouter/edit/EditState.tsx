import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, Icon } from '@terraware/web-components';

import { AccessionService } from 'src/services';
import strings from 'src/strings';
import { Accession, AccessionState, stateName } from 'src/types/Accession';

export interface EditStateProps {
  accession: Accession;
  record: Accession;
  onChange: (id: string, value: unknown) => void;
  error?: string;
}

export default function EditState(props: EditStateProps): JSX.Element {
  const theme = useTheme();
  const { accession, record, onChange, error } = props;

  const stateChanged = accession.state !== record.state;
  const options = AccessionService.getTransitionToStates(accession.state).map((state: AccessionState) => ({
    label: stateName(state),
    value: state,
  }));

  return (
    <>
      <Grid item xs={12} textAlign='left'>
        <Grid item xs={12}>
          <Dropdown
            id={'accession-status'}
            label={strings.STATUS}
            placeholder={strings.SELECT}
            options={options}
            onChange={(value: string) => onChange('state', value)}
            selectedValue={record?.state}
            fullWidth={true}
            errorText={error}
          />
        </Grid>
      </Grid>
      {stateChanged && (
        <Box
          sx={{
            background: '#FDE7C3',
            borderRadius: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing(2, 1),
            marginTop: theme.spacing(2),
            height: '74px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon name='warning' size='large' style={{ fill: theme.palette.TwClrIcn }} />
            <Typography sx={{ color: theme.palette.TwClrTxt, fontSize: '14px', paddingLeft: 0.5 }}>
              {strings.UPDATE_STATUS_WARNING}
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
}
