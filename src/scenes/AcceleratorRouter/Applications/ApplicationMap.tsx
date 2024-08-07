import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '@terraware/web-components';

import ApplicationMapCard from 'src/components/Application/ApplicationMapCard';
import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import TitleBar from 'src/components/common/TitleBar';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import strings from 'src/strings';

const ApplicationMap = () => {
  const { activeLocale } = useLocalization();
  const { selectedApplication, setSelectedApplication } = useApplicationData();
  const { goToAcceleratorApplicationMapUpload } = useNavigateTo();

  const pathParams = useParams<{ applicationId: string }>();

  useEffect(() => {
    setSelectedApplication(Number(pathParams.applicationId ?? -1));
  }, [setSelectedApplication, pathParams]);

  const titleComponent = useMemo(() => {
    if (!selectedApplication || !activeLocale) {
      return undefined;
    }

    return (
      <TitleBar
        header={strings.formatString(strings.DELIVERABLE_PROJECT, selectedApplication.projectName ?? '').toString()}
        title={selectedApplication.internalName}
        subtitle={strings.PROPOSED_PROJECT_BOUNDARY}
      />
    );
  }, [selectedApplication]);

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale && selectedApplication?.id
        ? [
            {
              name: strings.PRESCREEN,
              to: APP_PATHS.ACCELERATOR_APPLICATION.replace(':applicationId', `${selectedApplication.id}`),
            },
          ]
        : [],
    [activeLocale, selectedApplication?.id]
  );

  if (!selectedApplication) {
    return <Page isLoading={true} />;
  }

  return (
    <Page
      crumbs={crumbs}
      title={titleComponent}
      contentStyle={{ display: 'block' }}
      rightComponent={
        <Button
          label={strings.REPLACE_BOUNDARY}
          onClick={() => goToAcceleratorApplicationMapUpload(selectedApplication.id)}
          priority={'secondary'}
        />
      }
    >
      <ApplicationMapCard application={selectedApplication} />
    </Page>
  );
};

export default ApplicationMap;
