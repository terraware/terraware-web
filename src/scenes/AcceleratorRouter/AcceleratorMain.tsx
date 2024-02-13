import { Container } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import TfMain from 'src/components/common/TfMain';
import PageHeader from 'src/components/seeds/PageHeader';

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
