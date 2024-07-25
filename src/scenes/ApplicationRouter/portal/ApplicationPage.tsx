import React, { ReactNode, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import { useApplicationData } from 'src/scenes/ApplicationRouter/provider/Context';
import strings from 'src/strings';

type Props = {
  children?: ReactNode;
  crumbs?: Crumb[];
  hierarchicalCrumbs?: boolean;
  rightComponent?: ReactNode;
};

const ApplicationPage = ({ children, crumbs, hierarchicalCrumbs, rightComponent }: Props) => {
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
      rightComponent={rightComponent}
      hierarchicalCrumbs={hierarchicalCrumbs ?? true}
      // TODO: replace "Project Name" placeholder with actual project name once available in application data
      title={strings.PROJECT_NAME}
      titleStyle={{ marginTop: '24px' }}
    >
      {children}
    </Page>
  );
};

export default ApplicationPage;
