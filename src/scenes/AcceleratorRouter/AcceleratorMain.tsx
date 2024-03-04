import React from 'react';

import { Container } from '@mui/material';
import { makeStyles } from '@mui/styles';

import PageHeader from 'src/components/PageHeader';
import TfMain from 'src/components/common/TfMain';

type AcceleratorMainProps = {
  children?: React.ReactNode;
  pageTitle?: string;
};

const useStyles = makeStyles(() => ({
  mainContainer: {
    padding: 0,
  },
}));

const AcceleratorMain = ({ children, pageTitle }: AcceleratorMainProps) => {
  const classes = useStyles();

  return (
    <TfMain>
      {pageTitle && <PageHeader title={pageTitle} />}

      <Container maxWidth={false} className={classes.mainContainer}>
        {children}
      </Container>
    </TfMain>
  );
};

export default AcceleratorMain;
