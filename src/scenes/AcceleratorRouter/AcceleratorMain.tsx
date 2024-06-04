import React from 'react';

import { Container } from '@mui/material';

import PageHeader from 'src/components/PageHeader';
import TfMain from 'src/components/common/TfMain';

type AcceleratorMainProps = {
  children?: React.ReactNode;
  pageTitle?: string;
};

const AcceleratorMain = ({ children, pageTitle }: AcceleratorMainProps) => {
  return (
    <TfMain>
      {pageTitle && <PageHeader title={pageTitle} />}

      <Container maxWidth={false} sx={{ padding: 0 }}>
        {children}
      </Container>
    </TfMain>
  );
};

export default AcceleratorMain;
