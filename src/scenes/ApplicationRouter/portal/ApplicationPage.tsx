import React, { ReactNode } from 'react';

import { skipToken } from '@reduxjs/toolkit/query';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import usePathApplicationId from 'src/hooks/usePathApplicationId';
import { useGetApplicationQuery } from 'src/queries/generated/applications';
import strings from 'src/strings';

import FeedbackMessage from './Prescreen/FeedbackMessage';

type Props = {
  children?: ReactNode;
  crumbs?: Crumb[];
  hierarchicalCrumbs?: boolean;
  isLoading?: boolean;
  rightComponent?: ReactNode;
  hideFeedback?: boolean;
};

const ApplicationPage = ({ children, crumbs, hierarchicalCrumbs, isLoading, rightComponent, hideFeedback }: Props) => {
  const pathApplicationId = usePathApplicationId();
  const { currentData: applicationData, isFetching: isFetchingApplication } = useGetApplicationQuery(
    pathApplicationId ?? skipToken
  );
  const selectedApplication = applicationData?.application;

  return (
    <Page
      crumbs={crumbs}
      rightComponent={rightComponent}
      hierarchicalCrumbs={hierarchicalCrumbs ?? true}
      isLoading={isLoading || isFetchingApplication}
      // TODO: replace "Project Name" placeholder with actual project name once available in application data
      title={strings.formatString(strings.APPLICATION_FOR_PROJECT, selectedApplication?.projectName ?? '')}
      titleStyle={{ marginTop: '24px' }}
      titleContainerStyle={{ flexFlow: 'nowrap' }}
    >
      {!hideFeedback && selectedApplication?.status === 'Failed Pre-screen' && (
        <FeedbackMessage feedback={selectedApplication.feedback} />
      )}
      {children}
    </Page>
  );
};

export default ApplicationPage;
