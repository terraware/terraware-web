import React from 'react';
import { Container } from '@mui/material';
import { makeStyles } from '@mui/styles';
import TfMain from 'src/components/common/TfMain';

const useStyles = makeStyles(() => ({
  mainContainer: {
    padding: 0,
  },
}));

const AcceleratorModuleContentView = () => {
  const classes = useStyles();

  return (
    <TfMain>
      <Container maxWidth={false} className={classes.mainContainer}>
        {/* view content */}
      </Container>
    </TfMain>
  );
};

export default AcceleratorModuleContentView;
