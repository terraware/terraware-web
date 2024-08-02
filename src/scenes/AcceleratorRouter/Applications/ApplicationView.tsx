import React, { useCallback, useEffect, useMemo } from 'react';
import { Property } from 'csstype';
import { useParams } from 'react-router-dom';

import { Box, Grid, Theme, Typography, useTheme } from '@mui/material';
import { DateTime } from 'luxon';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import TitleBar from 'src/components/common/TitleBar';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import strings from 'src/strings';

import ApplicationDeliverableRow from './ApplicationDeliverableRow';
import { Application, ApplicationStatus } from 'src/types/Application';
import Card from 'src/components/common/Card';
import { Button } from '@terraware/web-components';
import useNavigateTo from 'src/hooks/useNavigateTo';
import ProjectFieldTextAreaDisplay from 'src/components/ProjectField/TextAreaDisplay';

const getApplicationStatusColor = (
  status: ApplicationStatus,
  theme: Theme
): Property.Color | string | undefined => {
  switch (status) {
    case 'Accepted':
    case 'Carbon Eligible':
    case 'Issue Resolved':
      return theme.palette.TwClrTxtSuccess;
    case 'In Review':
    case 'Issue Active':
    case 'Needs Follow-up':
    case 'Waitlist':
      return theme.palette.TwClrTxtWarning;
    case 'Not Accepted':
      return theme.palette.TwClrTxtDanger;
    case 'Issue Pending':
    case 'PL Review':
    case 'Pre-check':
    case 'Ready for Review':
    case 'Submitted':
      return theme.palette.TwClrTxtInfo;
    case 'Not Submitted':
    case 'Failed Pre-screen':
    case 'Passed Pre-screen':
    default:
      return theme.palette.TwClrTxtWarning;
  }
};

type ApplicationReviewProps = {
  application: Application;
}


const ApplicationReview = ({application} : ApplicationReviewProps) => {
  const theme = useTheme();
  const { goToParticipantProject } = useNavigateTo();

  const color = getApplicationStatusColor(application.status, theme);
  return <Box 
      borderRadius={theme.spacing(1)}
      display={'flex'} 
      flexDirection={'column'} 
      justifyContent={'left'} 
      width={'100%'} 
      sx={{
        backgroundColor: theme.palette.TwClrBgSecondary,
      }}
      >
        <Box
          display={'flex'} 
          flexDirection={'row'} 
          justifyContent={'start'} 
          width={'100%'} 
          alignItems={'center'}
          sx={{
            padding: theme.spacing(2),
          }}
        >
        <Typography fontSize={'24px'} fontWeight={600} lineHeight={'32px'}>
          {strings.APPLICATION_STATUS}
        </Typography>
        <Typography fontSize={'20px'} lineHeight={'28px'} fontWeight={600} color={color || 'black'} marginLeft={theme.spacing(2)}>
          {application.status}
        </Typography>

        <Button 
          label={strings.SEE_PROJECT_DETAILS} 
          onClick={() => { goToParticipantProject(application.projectId) }} 
          size={'small'}
          priority={'ghost'}
          style={{
            marginLeft: 'auto',
          }}
        />
      </Box>

      <Grid container>
        <ProjectFieldTextAreaDisplay
          label={strings.FEEDBACK}
          value={application.feedback}
        />
        <ProjectFieldTextAreaDisplay
          label={strings.INTERNAL_COMMENTS}
          value={application.internalComment}
        />
      </Grid>
    </Box>
}

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
        <Box display={'flex'} flexDirection={'column'} justifyContent={'left'} width={'100%'}>
          <ApplicationReview application={selectedApplication} />

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
