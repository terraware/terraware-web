import React from 'react';
import { Container, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useUser } from 'src/providers';
import strings from 'src/strings';
import AcceleratorMain from 'src/scenes/AcceleratorRouter/AcceleratorMain';

const useStyles = makeStyles(() => ({
  mainContainer: {
    padding: 0,
  },
}));

const AcceleratorOverviewView = () => {
  const { user } = useUser();
  const classes = useStyles();

  return (
    <AcceleratorMain pageTitle={strings.ACCELERATOR_CONSOLE}>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Typography variant={'h4'}>Welcome{user ? `, ${user.firstName}` : ''}!</Typography>
      </Container>
    </AcceleratorMain>
  );
};

export default AcceleratorOverviewView;
