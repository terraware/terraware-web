import React from 'react';
import { Container } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PageHeader from 'src/components/seeds/PageHeader';
import TfMain from 'src/components/common/TfMain';

const useStyles = makeStyles(() => ({
  mainContainer: {
    padding: 0,
  },
}));

const AcceleratorAdminView = () => {
  const classes = useStyles();

  return (
    <TfMain>
      <PageHeader subtitle={'Welcome to the accelerator admin dashboard'} page={'Accelerator Admin'} />
      <Container maxWidth={false} className={classes.mainContainer}>
        asdlfkjasldf
      </Container>
    </TfMain>
  );
};

export default AcceleratorAdminView;
