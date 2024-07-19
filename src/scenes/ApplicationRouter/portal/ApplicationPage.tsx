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
};

const ApplicationPage = ({ children }: Prop) => {
  const { goToHome } = useNavigateTo();

  const { allApplications, selectedApplication, setSelectedApplication, reload } = useApplicationData();

  const pathParams = useParams<{ applicationId: string }>();
  const applicationId = Number(pathParams.applicationId);

  useEffect(() => {
    console.log(allApplications);
    if (allApplications) {
      setSelectedApplication(applicationId);
    } else {
      reload();
    }
  }, [allApplications, applicationId, selectedApplication]);

  return (
    <TfMain>
      <PageHeader
        title={strings.APPLICATION}
        rightComponent={<Button label={strings.EXIT_APPLICATION} onClick={goToHome} priority={'ghost'} />}
      />

      <Container maxWidth={false} sx={{ padding: 0 }}>
        {children}
      </Container>
    </TfMain>
  );
};

export default ApplicationPage;
