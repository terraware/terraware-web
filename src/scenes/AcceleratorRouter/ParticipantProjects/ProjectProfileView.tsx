import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import ApplicationStatusLink from 'src/components/ProjectField/ApplicationStatusLink';
import CohortBadge from 'src/components/ProjectField/CohortBadge';
import ProjectProfileFooter from 'src/components/ProjectField/Footer';
import ProjectFieldInlineMeta from 'src/components/ProjectField/InlineMeta';
import InvertedCard from 'src/components/ProjectField/InvertedCard';
import LandUseModelTypeCard from 'src/components/ProjectField/LandUseModelTypeCard';
import ProjectFieldLink from 'src/components/ProjectField/Link';
import ProjectCertificationDisplay from 'src/components/ProjectField/ProjectCertificationDisplay';
import ProjectDataDisplay from 'src/components/ProjectField/ProjectDataDisplay';
import ProjectFigureLabel from 'src/components/ProjectField/ProjectFigureLabel';
import ProjectMap from 'src/components/ProjectField/ProjectMap';
import ProjectOverviewCard from 'src/components/ProjectField/ProjectOverviewCard';
import ProjectProfileImage from 'src/components/ProjectField/ProjectProfileImage';
import ProjectScoreLink from 'src/components/ProjectField/ProjectScoreLink';
import ProjectSdgDisplay from 'src/components/ProjectField/ProjectSdgDisplay';
import ReportMetricCard from 'src/components/ProjectField/ReportMetricCard';
import VotingDecisionLink from 'src/components/ProjectField/VotingDecisionLink';
import Co2HectareYear from 'src/components/Units/Co2HectareYear';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import useProjectFundingEntities from 'src/hooks/useProjectFundingEntities';
import { useLocalization, useUser } from 'src/providers';
import { useLazyListAcceleratorReportsQuery } from 'src/queries/generated/reports';
import { requestProjectInternalUsersList } from 'src/redux/features/projects/projectsAsyncThunks';
import { selectProjectInternalUsersListRequest } from 'src/redux/features/projects/projectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { PublishedReport, getReportPrefix } from 'src/types/AcceleratorReport';
import { Application } from 'src/types/Application';
import { FunderProjectDetails } from 'src/types/FunderProject';
import { ParticipantProject } from 'src/types/ParticipantProject';
import { Project, ProjectMeta, getProjectInternalUserRoleString } from 'src/types/Project';
import { Score } from 'src/types/Score';
import { PhaseVotes } from 'src/types/Votes';
import { getCountryByCode } from 'src/utils/country';
import { formatNumberScale } from 'src/utils/numbers';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

type ProjectProfileViewProps = {
  participantProject?: ParticipantProject;
  projectDetails?: ParticipantProject | FunderProjectDetails;
  project?: Project;
  projectMeta?: ProjectMeta;
  organization?: AcceleratorOrg;
  projectApplication?: Application | undefined;
  projectScore?: Score | undefined;
  phaseVotes?: PhaseVotes | undefined;
  funderView?: boolean;
  publishedReports: PublishedReport[];
};

const ProjectProfileView = ({
  participantProject,
  projectDetails,
  project,
  projectMeta,
  projectApplication,
  projectScore,
  phaseVotes,
  funderView,
  publishedReports,
}: ProjectProfileViewProps) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { isAllowed } = useUser();
  const { activeLocale, countries } = useLocalization();
  const numberFormatter = useNumberFormatter();
  const { fundingEntities } = useProjectFundingEntities(funderView ? undefined : projectDetails?.projectId);
  const { isMobile, isTablet } = useDeviceInfo();
  const [listInternalUsersRequestId, setListInternalUsersRequestId] = useState('');
  const listInternalUsersRequest = useAppSelector((state) =>
    selectProjectInternalUsersListRequest(state, listInternalUsersRequestId)
  );
  const isAllowedViewScoreAndVoting = isAllowed('VIEW_PARTICIPANT_PROJECT_SCORING_VOTING');

  const [listReports, listReportsResponse] = useLazyListAcceleratorReportsQuery();
  const acceleratorReports = useMemo(
    () => listReportsResponse.data?.reports ?? [],
    [listReportsResponse.data?.reports]
  );

  useEffect(() => {
    if (!project?.id) {
      return;
    }
    void listReports({ projectId: project.id }, true);
    const request = dispatch(requestProjectInternalUsersList({ projectId: project.id }));
    setListInternalUsersRequestId(request.requestId);
  }, [dispatch, listReports, project?.id]);

  const firstProjectLead = useMemo(() => {
    if (listInternalUsersRequest?.status !== 'success') {
      return undefined;
    }

    return listInternalUsersRequest.data?.users
      ?.filter((user) => user.role === 'Project Lead')
      ?.sort((a, b) => {
        // sort by modifiedTime ascending
        const timeA = a.modifiedTime ? new Date(a.modifiedTime).getTime() : 0;
        const timeB = b.modifiedTime ? new Date(b.modifiedTime).getTime() : 0;
        return timeA - timeB;
      })?.[0];
  }, [listInternalUsersRequest]);

  const moreUsersTooltip = useMemo(() => {
    if (listInternalUsersRequest?.status !== 'success') {
      return '';
    }

    return (listInternalUsersRequest?.data?.users || [])
      .filter((user) => (firstProjectLead ? user.userId !== firstProjectLead.userId : true))
      .map((user) => {
        const userRole = user.roleName ? user.roleName : getProjectInternalUserRoleString(user.role, strings);
        return { userRole, firstName: user.firstName || '', lastName: user.lastName || '' };
      })
      .sort((a, b) => {
        // first sort by user role alphabetically
        if (a.userRole !== b.userRole) {
          return a.userRole.localeCompare(b.userRole, activeLocale || undefined);
        }
        // then sort by first name alphabetically
        if (a.firstName !== b.firstName) {
          return a.firstName.localeCompare(b.firstName, activeLocale || undefined);
        }
        // finally sort by last name alphabetically
        return a.lastName.localeCompare(b.lastName, activeLocale || undefined);
      })
      .map((user) => `${user.userRole}: ${user.firstName} ${user.lastName}`)
      .join('\n');
  }, [activeLocale, firstProjectLead, listInternalUsersRequest]);

  const isProjectInPhase = useMemo(
    () => participantProject?.cohortPhase?.startsWith('Phase'),
    [participantProject?.cohortPhase]
  );

  const isPhaseZeroOrApplication = useMemo(
    () => [undefined, 'Phase 0 - Due Diligence', 'Application', 'Pre-Screen'].includes(participantProject?.cohortPhase),
    [participantProject?.cohortPhase]
  );

  const projectSize = useMemo(() => {
    const getCard = (label: string, value: number | undefined) => (
      <InvertedCard
        md={isTablet ? 6 : 12}
        backgroundColor={theme.palette.TwClrBaseGray100}
        label={label}
        value={value && strings.formatString(strings.X_HA, numberFormatter.format(value))?.toString()}
      />
    );
    switch (participantProject?.cohortPhase) {
      case 'Phase 1 - Feasibility Study':
        return getCard(strings.MIN_PROJECT_AREA, projectDetails?.minProjectArea);
      case 'Phase 2 - Plan and Scale':
      case 'Phase 3 - Implement and Monitor':
        return getCard(strings.PROJECT_AREA, projectDetails?.projectArea);
      case 'Application':
      case 'Pre-Screen':
      case 'Phase 0 - Due Diligence':
      default:
        return getCard(strings.ELIGIBLE_AREA, projectDetails?.confirmedReforestableLand);
    }
  }, [
    participantProject?.cohortPhase,
    projectDetails?.projectArea,
    projectDetails?.minProjectArea,
    projectDetails?.confirmedReforestableLand,
    isTablet,
    theme,
    numberFormatter,
  ]);

  const lastPublishedReport = useMemo(() => {
    if (publishedReports?.length > 0) {
      const sortedReports = publishedReports.toSorted((a, b) => {
        const timeA = a.endDate ? new Date(a.endDate).getTime() : 0;
        const timeB = b.endDate ? new Date(b.endDate).getTime() : 0;
        return timeB - timeA;
      });
      if (sortedReports.length > 0) {
        return sortedReports[0];
      }
    }
  }, [publishedReports]);

  const reportMetricCardFormatter = useCallback(
    (value: number | undefined) => (value ? formatNumberScale(value, value < 999 ? 0 : 1) : '0'),
    []
  );

  return (
    <Card
      flushMobile
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        marginBottom: theme.spacing(3),
        padding: `${theme.spacing(2, 1)}`,
        borderRadius: theme.spacing(1),
      }}
    >
      {!funderView && (
        <Grid container justifyContent={'space-between'}>
          <Box display={'flex'} alignItems={'center'}>
            {isProjectInPhase && (
              <>
                <CohortBadge label={participantProject?.cohortName} />
                <CohortBadge label={participantProject?.cohortPhase} />
              </>
            )}
            {!isProjectInPhase && projectApplication && (
              <ApplicationStatusLink applicationId={projectApplication.id} status={projectApplication.status} />
            )}
            {isAllowedViewScoreAndVoting && (
              <>
                <ProjectScoreLink projectId={projectDetails?.projectId} projectScore={projectScore?.overallScore} />
                <VotingDecisionLink projectId={projectDetails?.projectId} phaseVotes={phaseVotes} />
              </>
            )}
          </Box>
          <Box justifySelf={'flex-end'}>
            <ProjectFieldInlineMeta
              userLabel={strings.PROJECT_LEAD}
              userId={firstProjectLead?.userId}
              userName={firstProjectLead && `${firstProjectLead?.firstName} ${firstProjectLead?.lastName}`}
              fontSize={'16px'}
              lineHeight={'24px'}
              fontWeight={500}
              moreTooltip={moreUsersTooltip}
            />
          </Box>
        </Grid>
      )}

      <Grid container>
        <ProjectOverviewCard
          md={isMobile || isTablet ? 12 : 9}
          dealDescription={projectDetails?.dealDescription}
          projectName={project?.name}
        />
        <Grid item md={isMobile || isTablet ? 12 : 3} xs={12}>
          <Grid container>
            <InvertedCard
              md={isTablet ? 6 : 12}
              backgroundColor={theme.palette.TwClrBaseGray100}
              label={strings.COUNTRY}
              value={
                countries && projectDetails?.countryCode
                  ? getCountryByCode(countries, projectDetails?.countryCode)?.name
                  : projectDetails?.countryCode
              }
            />
            {projectSize}
          </Grid>
        </Grid>
      </Grid>

      <Grid container paddingTop={theme.spacing(2)}>
        {projectDetails?.projectHighlightPhotoValueId && (
          <ProjectProfileImage
            projectId={projectDetails.projectId}
            imageValueId={projectDetails.projectHighlightPhotoValueId}
            alt={strings.PROJECT_HIGHLIGHT_IMAGE}
          />
        )}
        {projectDetails?.projectZoneFigureValueId && (
          <ProjectProfileImage
            projectId={projectDetails.projectId}
            imageValueId={projectDetails.projectZoneFigureValueId}
            alt={strings.PROJECT_ZONE_FIGURE}
            label={!funderView && <ProjectFigureLabel labelText={strings.PROJECT_ZONE_FIGURE_VARIABLE} />}
          />
        )}
        {projectDetails && !projectDetails?.projectZoneFigureValueId && (
          <ProjectMap
            application={projectApplication}
            countryCode={projectDetails?.countryCode}
            includeLabel={!funderView}
            md={isMobile || isTablet ? 12 : projectDetails?.projectHighlightPhotoValueId ? 6 : 12}
            projectId={project?.id}
          />
        )}
      </Grid>

      <Grid container>
        <LandUseModelTypeCard
          selectedTypes={projectDetails?.landUseModelTypes}
          modelHectares={projectDetails?.landUseModelHectares}
          numberFormatter={numberFormatter}
        />
      </Grid>

      <Grid container>
        {!funderView && isPhaseZeroOrApplication && (
          <InvertedCard
            md={4}
            label={strings.MIN_MAX_CARBON_ACCUMULATION}
            value={
              participantProject?.minCarbonAccumulation &&
              participantProject?.maxCarbonAccumulation &&
              `${participantProject.minCarbonAccumulation}-${participantProject.maxCarbonAccumulation}`
            }
            backgroundColor={theme.palette.TwClrBaseGray050}
            units={<Co2HectareYear />}
          />
        )}
        {(funderView || !isPhaseZeroOrApplication) && (
          <InvertedCard
            md={4}
            label={strings.ACCUMULATION_RATE}
            value={projectDetails?.accumulationRate}
            backgroundColor={theme.palette.TwClrBaseGray050}
            units={<Co2HectareYear />}
          />
        )}
        <InvertedCard
          md={4}
          label={strings.TOTAL_VCU_40YRS}
          value={projectDetails?.totalVCU && numberFormatter.format(projectDetails.totalVCU)}
          units={'t'}
          backgroundColor={theme.palette.TwClrBaseGray050}
        />
        <InvertedCard
          md={4}
          label={strings.ESTIMATED_BUDGET}
          value={
            projectDetails?.perHectareBudget &&
            strings
              .formatString(strings.USD_PER_HECTARE, numberFormatter.format(projectDetails.perHectareBudget))
              ?.toString()
          }
          backgroundColor={theme.palette.TwClrBaseGray050}
        />
      </Grid>
      {projectDetails && projectDetails.metricProgress.length > 0 && (
        <>
          <Grid container>
            <ReportMetricCard
              label={strings.TOTAL_PLANTED}
              metricProgress={projectDetails.metricProgress}
              metricName={'Hectares Planted'}
              units={'ha'}
            />
            <ReportMetricCard
              label={strings.TOTAL_PLANTED}
              metricProgress={projectDetails.metricProgress}
              metricName={'Trees Planted'}
              units={strings.PLANTS}
              formatter={reportMetricCardFormatter}
            />
            <ReportMetricCard
              label={strings.TOTAL_PLANTED}
              metricProgress={projectDetails.metricProgress}
              metricName={'Species Planted'}
              units={strings.SPECIES}
            />
          </Grid>
        </>
      )}
      <Grid container marginY={theme.spacing(2)} marginLeft={theme.spacing(1)}>
        {((funderView && publishedReports?.length > 0) || (!funderView && acceleratorReports?.length > 0)) && (
          <>
            {lastPublishedReport && (
              <Grid item marginRight={theme.spacing(3)} marginLeft={theme.spacing(1)}>
                <Typography fontWeight={500}>
                  {strings.formatString(
                    strings.LAST_REPORT_PUBLISHED,
                    getReportPrefix(lastPublishedReport),
                    getDateDisplayValue(lastPublishedReport.publishedTime)
                  )}
                </Typography>
              </Grid>
            )}

            <Grid item marginLeft={isMobile ? theme.spacing(1) : 0}>
              <ProjectFieldLink
                value={
                  funderView
                    ? `${APP_PATHS.FUNDER_HOME}?tab=report`
                    : APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(
                        ':projectId',
                        (projectDetails?.projectId || '').toString()
                      )
                }
                label={strings.VIEW_REPORTS}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Grid container>
        <Box
          marginX={theme.spacing(1)}
          paddingX={theme.spacing(1)}
          borderTop={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
          width={'100%'}
        >
          <Grid item xs={12} margin={theme.spacing(2, 0, 1)}>
            <Typography fontSize='20px' fontWeight={600} lineHeight='28px'>
              {strings.LAND_DATA}
            </Typography>
          </Grid>
        </Box>
        <Grid item md={isMobile ? 12 : 4}>
          <Grid container>
            <ProjectDataDisplay
              label={strings.ELIGIBLE_AREA}
              md={12}
              value={
                projectDetails?.confirmedReforestableLand &&
                strings
                  .formatString(strings.X_HA, numberFormatter.format(projectDetails.confirmedReforestableLand))
                  ?.toString()
              }
              tooltip={strings.ELIGIBLE_AREA_DESCRIPTION}
            />
            <ProjectDataDisplay
              label={strings.MIN_PROJECT_AREA}
              md={12}
              value={
                projectDetails?.minProjectArea &&
                strings.formatString(strings.X_HA, numberFormatter.format(projectDetails.minProjectArea))?.toString()
              }
              tooltip={strings.MIN_PROJECT_AREA_DESCRIPTION}
            />
          </Grid>
        </Grid>
        <Grid item md={isMobile ? 12 : 4}>
          <Grid container>
            <ProjectDataDisplay
              label={strings.PROJECT_AREA}
              md={12}
              value={
                projectDetails?.projectArea &&
                strings.formatString(strings.X_HA, numberFormatter.format(projectDetails.projectArea))?.toString()
              }
              tooltip={strings.PROJECT_AREA_DESCRIPTION}
            />
            <ProjectDataDisplay
              label={strings.EXPANSION_POTENTIAL}
              md={12}
              value={
                projectDetails?.totalExpansionPotential &&
                strings
                  .formatString(strings.X_HA, numberFormatter.format(projectDetails.totalExpansionPotential))
                  ?.toString()
              }
              tooltip={strings.EXPANSION_POTENTIAL_DESCRIPTION}
            />
          </Grid>
        </Grid>
        <ProjectDataDisplay
          label={strings.NATIVE_SPECIES_TO_BE_PLANTED}
          md={4}
          value={projectDetails?.numNativeSpecies}
        />
      </Grid>

      <Grid container marginBottom={theme.spacing(2)}>
        {(!funderView ||
          (funderView &&
            (projectDetails?.standard ||
              projectDetails?.methodologyNumber ||
              (projectDetails?.carbonCertifications?.length ?? 0) > 0))) && (
          <Box marginX={theme.spacing(2)} width={'100%'}>
            <Grid item xs={12} margin={theme.spacing(2, 0, 1)}>
              <Typography fontSize='20px' fontWeight={600} lineHeight='28px'>
                {strings.CARBON_DATA}
              </Typography>
            </Grid>
          </Box>
        )}
        {!funderView && isPhaseZeroOrApplication && (
          <ProjectDataDisplay
            label={strings.ACCUMULATION_RATE}
            md={4}
            value={projectDetails?.accumulationRate}
            units={<Co2HectareYear />}
          />
        )}
        {(funderView || !isPhaseZeroOrApplication) && (
          <>
            {!funderView && (
              <ProjectDataDisplay
                label={strings.MIN_MAX_CARBON_ACCUMULATION}
                md={4}
                value={
                  participantProject?.minCarbonAccumulation &&
                  participantProject?.maxCarbonAccumulation &&
                  `${participantProject.minCarbonAccumulation}-${participantProject.maxCarbonAccumulation}`
                }
                units={<Co2HectareYear />}
              />
            )}
            <ProjectDataDisplay label={strings.STANDARD} md={4} value={projectDetails?.standard} />
            <ProjectDataDisplay label={strings.METHODOLOGY_NUMBER} md={4} value={projectDetails?.methodologyNumber} />
          </>
        )}
        <ProjectCertificationDisplay certifications={projectDetails?.carbonCertifications} />
      </Grid>

      {((funderView && projectDetails?.verraLink) || !funderView) && (
        <Grid container>
          <Box
            margin={theme.spacing(0, 1, 3)}
            border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
            borderRadius={theme.spacing(1)}
            width={'100%'}
            padding={theme.spacing(2)}
          >
            {!funderView && (
              <Box paddingBottom={theme.spacing(1)}>
                <Typography
                  fontSize='16px'
                  fontWeight={600}
                  lineHeight='24px'
                  component={'span'}
                  marginRight={theme.spacing(2)}
                >
                  {strings.PROJECT_LINKS}
                </Typography>
                {projectApplication && (
                  <ProjectFieldLink
                    value={APP_PATHS.ACCELERATOR_APPLICATION.replace(
                      ':applicationId',
                      projectApplication.id.toString()
                    )}
                    label={strings.APPLICATION}
                  />
                )}
                {participantProject?.dealName && (
                  <ProjectFieldLink
                    value={`${APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENTS}?dealName=${participantProject.dealName}`}
                    label={strings.DOCUMENTS}
                  />
                )}
                {project && (
                  <ProjectFieldLink
                    value={`${APP_PATHS.ACCELERATOR_DELIVERABLES}?projectId=${project.id}`}
                    label={strings.DELIVERABLES}
                  />
                )}
                {project && isAllowedViewScoreAndVoting && (
                  <ProjectFieldLink
                    value={APP_PATHS.ACCELERATOR_PROJECT_SCORES.replace(':projectId', project.id.toString())}
                    label={strings.SCORING}
                  />
                )}
                {project && (
                  <ProjectFieldLink
                    value={APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', project.id.toString())}
                    label={strings.REPORTS}
                  />
                )}
                {project && (
                  <ProjectFieldLink
                    value={APP_PATHS.ACCELERATOR_PROJECT_GIS_MAPS_VIEW.replace(':projectId', project.id.toString())}
                    label={strings.MAPS}
                  />
                )}
              </Box>
            )}

            <Box>
              <Typography
                fontSize='16px'
                fontWeight={600}
                lineHeight='24px'
                component={'span'}
                marginRight={theme.spacing(2)}
              >
                {strings.EXTERNAL_PROJECT_LINKS}
              </Typography>
              {!funderView && (
                <>
                  <ProjectFieldLink value={participantProject?.googleFolderUrl} label={strings.GDRIVE} />
                  <ProjectFieldLink value={participantProject?.hubSpotUrl} label={strings.HUBSPOT} />
                  <ProjectFieldLink value={participantProject?.gisReportsLink} label={strings.GIS_REPORT} />
                </>
              )}
              <ProjectFieldLink value={projectDetails?.verraLink} label={strings.VERRA} />
              {!funderView && (
                <>
                  <ProjectFieldLink value={participantProject?.riskTrackerLink} label={strings.RISK_TRACKER} />

                  <ProjectFieldLink value={participantProject?.clickUpLink} label={strings.CLICK_UP} />
                  <ProjectFieldLink value={participantProject?.slackLink} label={strings.SLACK} />
                </>
              )}
            </Box>
          </Box>
        </Grid>
      )}

      <Grid container>
        <Box margin={theme.spacing(0, 2, 1)} width={'100%'}>
          <Grid item xs={12} marginBottom={theme.spacing(2)}>
            <Typography fontSize='20px' fontWeight={600} lineHeight='28px'>
              {strings.UN_SDG}
            </Typography>
          </Grid>
          <ProjectSdgDisplay sdgList={projectDetails?.sdgList} />
        </Box>
      </Grid>

      {!funderView && fundingEntities?.length > 0 && (
        <Grid container>
          <Box marginX={theme.spacing(2)} width={'100%'}>
            <Grid item xs={12} marginY={theme.spacing(2)}>
              <Typography fontSize='20px' fontWeight={600} lineHeight='24px'>
                {strings.FUNDING_ENTITIES}
              </Typography>
            </Grid>
            {fundingEntities.map((e, i) => (
              <Typography
                key={`entity-${i}`}
                fontSize='24px'
                fontWeight={600}
                lineHeight='28px'
                paddingBottom={theme.spacing(1)}
              >
                {e.name}
              </Typography>
            ))}
          </Box>
        </Grid>
      )}

      {!funderView && <ProjectProfileFooter project={project} projectMeta={projectMeta} />}
    </Card>
  );
};

export default ProjectProfileView;
