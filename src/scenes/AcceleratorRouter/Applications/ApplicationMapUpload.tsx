import React, { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import ApplicationMapUploadCard from 'src/components/Application/ApplicationMapUploadCard';
import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import TitleBar from 'src/components/common/TitleBar';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import strings from 'src/strings';

const ApplicationMapUpload = () => {
  const { activeLocale } = useLocalization();
  const { selectedApplication, setSelectedApplication, reload } = useApplicationData();
  const { goToAcceleratorApplicationMap } = useNavigateTo();

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
        subtitle={strings.ADD_PROPOSED_PROJECT_BOUNDARY}
      />
    );
  }, [selectedApplication]);

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale && selectedApplication?.id
        ? [
            {
              name: strings.PROPOSED_PROJECT_BOUNDARY,
              to: APP_PATHS.ACCELERATOR_APPLICATION_MAP.replace(':applicationId', `${selectedApplication.id}`),
            },
          ]
        : [],
    [activeLocale, selectedApplication?.id]
  );

  const navigateToMap = useCallback(() => {
    if (selectedApplication) {
      goToAcceleratorApplicationMap(selectedApplication.id);
    }
  }, [goToAcceleratorApplicationMap, selectedApplication]);

  return (
    <Page crumbs={crumbs} title={titleComponent} contentStyle={{ display: 'block' }}>
      {selectedApplication && (
        <ApplicationMapUploadCard application={selectedApplication} onSuccess={() => reload(navigateToMap)} />
      )}
    </Page>
  );
};

export default ApplicationMapUpload;
