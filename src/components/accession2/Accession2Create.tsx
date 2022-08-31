import moment from 'moment';
import React, { Suspense, useEffect, useState } from 'react';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import useForm from 'src/utils/useForm';
import { getAllSeedBanks } from 'src/utils/organization';
import TfMain from 'src/components/common/TfMain';
import PanelTitle from 'src/components/PanelTitle';
import MainPaper from 'src/components/MainPaper';
import { CircularProgress, Fab, Container, Grid, Typography, Theme, useTheme } from '@mui/material';
import { Close } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type CreateAccessionProps = {
  organization: ServerOrganization;
};

const SubTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
};

export default function CreateAccession(props: CreateAccessionProps): JSX.Element {
  const { organization } = props;
  const theme = useTheme();

  return (
    <TfMain>
      <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 'bold', margin: '0 auto' }}>{strings.ADD_AN_ACCESSION}</Typography>
      <Container maxWidth={false} sx={
        {
          margin: '0 auto',
          width: '640px',
          paddingLeft: theme.spacing(4),
          paddingRight: theme.spacing(4),
          paddingTop: theme.spacing(5),
          paddingBottom: theme.spacing(5)
        }
      }>
        <Typography variant='h2' sx={SubTitleStyle}>{strings.SEED_COLLECTION_DETAIL}</Typography>
        <Typography variant='h2' sx={SubTitleStyle}>{strings.SEED_PROCESSING_DETAIL}</Typography>
      </Container>
    </TfMain>
  );
}
