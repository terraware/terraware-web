import React from 'react';
import strings from 'src/strings';
import { Box, Grid, Theme, Typography, useTheme } from '@mui/material';
import { Dropdown, Icon } from '@terraware/web-components';
import { Accession, AccessionState, stateName } from 'src/types/Accession';
import { AccessionsService } from 'src/services';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  messageIcon: {
    fill: theme.palette.TwClrIcn,
  },
}));

export interface EditStateProps {
  accession: Accession;
  record: Accession;
  onChange: (id: string, value: unknown) => void;
  error?: string;
}

export default function EditState(props: EditStateProps): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();
  const { accession, record, onChange, error } = props;

  const stateChanged = accession.state !== record.state;
  const options = AccessionsService.getTransitionToStates(accession.state).map((state: AccessionState) => ({
    label: stateName(state),
    value: state,
  }));

  return (
    <>
      <Grid item xs={12} textAlign='left'>
        <Grid item xs={12}>
          <Dropdown
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
      <Box
        sx={{
          background: stateChanged ? '#FDE7C3' : 'initial',
          borderRadius: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: theme.spacing(2, 1),
          marginTop: theme.spacing(4),
          height: '74px',
        }}
      >
        {stateChanged && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon name='warning' className={classes.messageIcon} size='large' />
            <Typography sx={{ color: theme.palette.TwClrTxt, fontSize: '14px', paddingLeft: 0.5 }}>
              {strings.UPDATE_STATUS_WARNING}
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
}
