import React, { ReactNode, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Container } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Button from 'src/components/common/button/Button';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useApplicationData } from 'src/scenes/ApplicationRouter/provider/Context';
import strings from 'src/strings';

type Props = {
  children?: ReactNode;
  crumbs?: Crumb[];
  hierarchicalCrumbs?: boolean;
};

const ApplicationPage = ({ children, crumbs, hierarchicalCrumbs }: Props) => {
  const { goToHome } = useNavigateTo();

  const { allApplications, selectedApplication, setSelectedApplication, reload } = useApplicationData();

  const pathParams = useParams<{ applicationId: string }>();
  const applicationId = Number(pathParams.applicationId);

  useEffect(() => {
    if (allApplications) {
      setSelectedApplication(applicationId);
    } else {
      reload();
    }
  }, [allApplications, applicationId, selectedApplication]);

  return (
    <Page
      crumbs={crumbs}
      rightComponent={<Button label={strings.EXIT_APPLICATION} onClick={goToHome} priority={'ghost'} />}
      hierarchicalCrumbs={hierarchicalCrumbs ?? true}
      // TODO: replace "Project Name" placeholder with actual project name once available in application data
      title={strings.PROJECT_NAME}
    >
      {children}
    </Page>
  );
};

export default ApplicationPage;
