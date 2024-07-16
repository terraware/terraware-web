import React, { ReactNode, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Container } from '@mui/material';

import PageHeader from 'src/components/PageHeader';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useApplicationData } from 'src/scenes/ApplicationRouter/provider/Context';
import strings from 'src/strings';

type Prop = {
  children?: ReactNode;
  title: string;
};

const ApplicationPage = ({ children, title }: Prop) => {
  const { goToHome } = useNavigateTo();

  const { allApplications, setSelectedApplication: setSelectedApplitcation } = useApplicationData();

  const pathParams = useParams<{ applicationId: string }>();
  const applicationId = Number(pathParams.applicationId);

  useEffect(() => {
    if (allApplications.length > 0) {
      setSelectedApplitcation(applicationId);
    }
  }, [allApplications, applicationId]);

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
