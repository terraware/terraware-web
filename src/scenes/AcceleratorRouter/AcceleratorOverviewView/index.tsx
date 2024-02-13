import React from 'react';
import { Container, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PageHeader from 'src/components/seeds/PageHeader';
import TfMain from 'src/components/common/TfMain';
import strings from 'src/strings';
import { useUser } from 'src/providers';

const useStyles = makeStyles(() => ({
  mainContainer: {
    padding: 0,
  },
}));

const AcceleratorOverviewView = () => {
  const { user } = useUser();
  const classes = useStyles();

  return (
    <TfMain>
      <PageHeader title={strings.ACCELERATOR_CONSOLE} />
      <Container maxWidth={false} className={classes.mainContainer}>
        <Typography variant={'h4'}>Welcome{user ? `, ${user.firstName}` : ''}!</Typography>
      </Container>
    </TfMain>
  );
};

export default AcceleratorOverviewView;
