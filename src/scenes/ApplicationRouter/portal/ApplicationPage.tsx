import React, { ReactNode, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import { useApplicationData } from 'src/providers/Application/Context';
import strings from 'src/strings';

import FeedbackMessage from './Prescreen/FeedbackMessage';

type Props = {
  children?: ReactNode;
  crumbs?: Crumb[];
  hierarchicalCrumbs?: boolean;
  rightComponent?: ReactNode;
  hideFeedback?: boolean;
};

const ApplicationPage = ({ children, crumbs, hierarchicalCrumbs, rightComponent, hideFeedback }: Props) => {
  const { allApplications, selectedApplication, setSelectedApplication } = useApplicationData();

  const pathParams = useParams<{ applicationId: string }>();
  const applicationId = Number(pathParams.applicationId);

  useEffect(() => {
    if (allApplications) {
      setSelectedApplication(applicationId);
    }
  }, [allApplications, applicationId, selectedApplication]);

  return (
    <Page
      crumbs={crumbs}
      rightComponent={rightComponent}
      hierarchicalCrumbs={hierarchicalCrumbs ?? true}
      // TODO: replace "Project Name" placeholder with actual project name once available in application data
      title={strings.formatString(strings.APPLICATION_FOR_PROJECT, selectedApplication?.projectName ?? '')}
      titleStyle={{ marginTop: '24px' }}
    >
      {hideFeedback !== true && selectedApplication?.status === 'Failed Pre-screen' && (
        <FeedbackMessage feedback={selectedApplication.feedback} />
      )}
      {children}
    </Page>
  );
};

export default ApplicationPage;
