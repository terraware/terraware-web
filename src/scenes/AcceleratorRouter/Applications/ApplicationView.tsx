import React, { useCallback, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { DateTime } from 'luxon';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import TitleBar from 'src/components/common/TitleBar';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import usePathApplicationId from 'src/hooks/usePathApplicationId';
import { useLocalization } from 'src/providers';
import {
  useGetApplicationDeliverablesQuery,
  useGetApplicationModulesQuery,
  useGetApplicationQuery,
} from 'src/queries/generated/applications';
import strings from 'src/strings';

import ApplicationDeliverableRow from './ApplicationDeliverableRow';
import ApplicationReview from './ApplicationReview';

const ApplicationView = () => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const pathApplicationId = usePathApplicationId();
  const { currentData: applicationData, isFetching: isFetchingApplication } = useGetApplicationQuery(
    pathApplicationId ?? skipToken
  );
  const selectedApplication = applicationData?.application;
  const { currentData: modulesData } = useGetApplicationModulesQuery(pathApplicationId ?? skipToken);
  const applicationSections = useMemo(() => modulesData?.modules ?? [], [modulesData]);
  const { currentData: deliverablesData } = useGetApplicationDeliverablesQuery(pathApplicationId ?? skipToken);
  const applicationDeliverables = useMemo(() => deliverablesData?.deliverables ?? [], [deliverablesData]);

  const { goToAcceleratorApplicationDeliverable, goToAcceleratorApplicationMap } = useNavigateTo();

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
  }, [selectedApplication, activeLocale]);

  const prescreenSection = useMemo(
    () => applicationSections.find((section) => section.phase === 'Pre-Screen'),
    [applicationSections]
  );

  const nonPrescreenSections = useMemo(
    () => applicationSections.filter((section) => section.phase === 'Application'),
    [applicationSections]
  );

  const sectionDeliverables = useCallback(
    (sectionId: number) => {
      return applicationDeliverables.filter((deliverable) => deliverable.moduleId === sectionId);
    },
    [applicationDeliverables]
  );

  if (isFetchingApplication) {
    return <Page isLoading />;
  }

  if (!selectedApplication || !prescreenSection || !nonPrescreenSections) {
    return undefined;
  }

  return (
    <Page crumbs={crumbs} title={titleComponent} contentStyle={{ display: 'block' }}>
      <Card
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          alignItems: 'center',
          padding: theme.spacing(3),
        }}
      >
        <Box display={'flex'} flexDirection={'column'} justifyContent={'left'} width={'100%'}>
          <ApplicationReview application={selectedApplication} />

          <Typography fontSize={'24px'} fontWeight={600} lineHeight={'32px'} marginTop={theme.spacing(3)}>
            {strings.PRESCREEN}
          </Typography>

          {selectedApplication.boundary && (
            <ApplicationDeliverableRow
              title={strings.PROPOSED_PROJECT_BOUNDARY}
              goToDeliverable={() => {
                goToAcceleratorApplicationMap(selectedApplication.id);
              }}
            />
          )}

          {sectionDeliverables(prescreenSection.moduleId).map((deliverable, index) => (
            <ApplicationDeliverableRow
              title={deliverable.name}
              modifiedDate={
                deliverable.modifiedTime ? DateTime.fromISO(deliverable.modifiedTime).toFormat('yyyy/MM/dd') : undefined
              }
              goToDeliverable={() => {
                goToAcceleratorApplicationDeliverable(selectedApplication.id, deliverable.id);
              }}
              key={`prescreen-${index}`}
            />
          ))}

          <Typography fontSize={'24px'} fontWeight={600} lineHeight={'32px'} marginTop={theme.spacing(3)}>
            {strings.APPLICATION}
          </Typography>

          {nonPrescreenSections.map((section) => (
            <>
              <Typography fontSize={'20px'} fontWeight={600} lineHeight={'28px'} marginTop={theme.spacing(3)}>
                {section.name}
              </Typography>

              {sectionDeliverables(section.moduleId).map((deliverable, index) => (
                // Add link to deliverable
                <ApplicationDeliverableRow
                  title={deliverable.name}
                  modifiedDate={
                    deliverable.modifiedTime
                      ? DateTime.fromISO(deliverable.modifiedTime).toFormat('yyyy/MM/dd')
                      : undefined
                  }
                  goToDeliverable={() => {
                    goToAcceleratorApplicationDeliverable(selectedApplication.id, deliverable.id);
                  }}
                  key={`section-${section.moduleId}-${index}`}
                />
              ))}
            </>
          ))}
        </Box>
      </Card>
    </Page>
  );
};

export default ApplicationView;
