import React, { ReactNode } from 'react';

import { Container } from '@mui/material';

import PageHeader from 'src/components/PageHeader';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import useNavigateTo from 'src/hooks/useNavigateTo';
import strings from 'src/strings';

type Prop = {
  children?: ReactNode;
  title: string;
};

const ApplicationPage = ({ children, title }: Prop) => {
  const { goToHome } = useNavigateTo();

  return (
    <TfMain>
      <PageHeader
        title={title}
        rightComponent={<Button label={strings.EXIT_APPLICATION} onClick={goToHome} priority={'ghost'} />}
      />

      <Container maxWidth={false} sx={{ padding: 0 }}>
        {children}
      </Container>
    </TfMain>
  );
};

export default ApplicationPage;
