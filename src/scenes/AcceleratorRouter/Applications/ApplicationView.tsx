import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import TitleBar from 'src/components/common/TitleBar';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import strings from 'src/strings';

const ApplicationView = () => {
  const { activeLocale } = useLocalization();
  const { selectedApplication, setSelectedApplication } = useApplicationData();
  const pathParams = useParams<{ applicationId: string }>();

  useEffect(() => {
    setSelectedApplication(Number(pathParams.applicationId ?? -1));
  }, [setSelectedApplication, pathParams]);

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.APPLICATION_LIST : '',
        to: `${APP_PATHS.ACCELERATOR_APPLICATIONS}`,
      },
    ],
    [activeLocale]
  );

  const titleComponent = useMemo(() => {
    if (!selectedApplication || !activeLocale) {
      return undefined;
    }

    return (
      <TitleBar
        header={strings.formatString(strings.DELIVERABLE_PROJECT, selectedApplication.projectName ?? '').toString()}
        title={selectedApplication.internalName}
      />
    );
  }, [selectedApplication]);

  if (!selectedApplication) {
    return undefined;
  }

  return <Page crumbs={crumbs} title={titleComponent} contentStyle={{ display: 'block' }}></Page>;
};

export default ApplicationView;
