import React, { useCallback, useMemo } from 'react';

import { skipToken } from '@reduxjs/toolkit/query';
import { Button } from '@terraware/web-components';

import ApplicationMapCard from 'src/components/Application/ApplicationMapCard';
import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import TitleBar from 'src/components/common/TitleBar';
import { APP_PATHS } from 'src/constants';
import usePathApplicationId from 'src/hooks/usePathApplicationId';
import { useLocalization } from 'src/providers';
import { useGetApplicationQuery, useLazyGetApplicationGeoJsonQuery } from 'src/queries/generated/applications';
import strings from 'src/strings';
import { downloadGeoJson } from 'src/utils/csv';

const ApplicationMap = () => {
  const { activeLocale } = useLocalization();
  const pathApplicationId = usePathApplicationId();
  const { currentData: applicationData } = useGetApplicationQuery(pathApplicationId ?? skipToken);
  const selectedApplication = applicationData?.application;
  const [getApplicationGeoJson] = useLazyGetApplicationGeoJsonQuery();

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

  const selectedApplicationId = selectedApplication?.id;

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale && selectedApplicationId
        ? [
            {
              name: strings.PRESCREEN,
              to: APP_PATHS.ACCELERATOR_APPLICATION.replace(':applicationId', `${selectedApplicationId}`),
            },
          ]
        : [],
    [activeLocale, selectedApplicationId]
  );

  const onExport = useCallback(async () => {
    if (!selectedApplication) {
      return;
    }
    const response = await getApplicationGeoJson(selectedApplication.id);
    if (response.data !== undefined) {
      const filename = `${selectedApplication.internalName}`;
      downloadGeoJson(filename, await response.data.text());
    }
  }, [getApplicationGeoJson, selectedApplication]);

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
