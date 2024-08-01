import React, { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Card, Typography, useTheme } from '@mui/material';
import { DateTime } from 'luxon';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import TitleBar from 'src/components/common/TitleBar';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import strings from 'src/strings';

import ApplicationDeliverableRow from './ApplicationDeliverableRow';

const ApplicationView = () => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { selectedApplication, setSelectedApplication, applicationSections, applicationDeliverables } =
    useApplicationData();
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
        {/* TODO add component for adding reveiw status, feedback, internal comments and link to project details */}

        <Box display={'flex'} flexDirection={'column'} justifyContent={'left'} width={'100%'}>
          <Typography fontSize={'24px'} fontWeight={600} lineHeight={'32px'} marginTop={theme.spacing(3)}>
            {strings.PRESCREEN}
          </Typography>

          {/* Add link to view boundary once exists */}
          <ApplicationDeliverableRow title={strings.PROPOSED_PROJECT_BOUNDARY} goToDeliverable={() => {}} />

          {sectionDeliverables(prescreenSection.moduleId).map((deliverable, index) => (
            // Add link to deliverable
            <ApplicationDeliverableRow
              title={deliverable.name}
              modifiedDate={
                deliverable.modifiedTime ? DateTime.fromISO(deliverable.modifiedTime).toFormat('yyyy/MM/dd') : undefined
              }
              goToDeliverable={() => {}}
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
                  goToDeliverable={() => {}}
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
