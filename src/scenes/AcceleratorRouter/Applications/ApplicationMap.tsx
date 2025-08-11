import React, { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Button } from '@terraware/web-components';

import ApplicationMapCard from 'src/components/Application/ApplicationMapCard';
import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import TitleBar from 'src/components/common/TitleBar';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import ApplicationService from 'src/services/ApplicationService';
import strings from 'src/strings';
import { downloadGeoJson } from 'src/utils/csv';

const ApplicationMap = () => {
  const { activeLocale } = useLocalization();
  const { selectedApplication, setSelectedApplication } = useApplicationData();

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
  }, [selectedApplication, activeLocale]);

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

  const onExport = useCallback(async () => {
    if (!selectedApplication) {
      return;
    }
    const response = await ApplicationService.exportBoundary(selectedApplication.id);
    if (response !== null) {
      const dataString = JSON.stringify(response.data);
      const filename = `${selectedApplication.internalName}`;
      downloadGeoJson(filename, dataString);
    }
  }, [selectedApplication]);

  const exportButton = useMemo(() => {
    if (!activeLocale || !selectedApplication) {
      return undefined;
    }
    return <Button label={strings.EXPORT_PROJECT_BOUNDARY} onClick={() => void onExport()} />;
  }, [activeLocale, selectedApplication, onExport]);

  if (!selectedApplication) {
    return <Page isLoading={true} />;
  }

  return (
    <Page crumbs={crumbs} title={titleComponent} contentStyle={{ display: 'block' }} rightComponent={exportButton}>
      <ApplicationMapCard application={selectedApplication} />
    </Page>
  );
};

export default ApplicationMap;
