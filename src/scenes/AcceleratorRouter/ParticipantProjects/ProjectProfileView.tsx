import React, { useMemo } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import ApplicationStatusLink from 'src/components/ProjectField/ApplicationStatusLink';
import CohortBadge from 'src/components/ProjectField/CohortBadge';
import ProjectFieldDisplay from 'src/components/ProjectField/Display';
import ProjectProfileFooter from 'src/components/ProjectField/Footer';
import ProjectFieldInlineMeta from 'src/components/ProjectField/InlineMeta';
import InvertedCard from 'src/components/ProjectField/InvertedCard';
import LandUseModelTypeCard from 'src/components/ProjectField/LandUseModelTypeCard';
import ProjectFieldLink from 'src/components/ProjectField/Link';
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
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useProjectFundingEntities from 'src/hooks/useProjectFundingEntities';
import useProjectReports from 'src/hooks/useProjectReports';
import { useLocalization, useUser } from 'src/providers';
import strings from 'src/strings';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { PublishedReport } from 'src/types/AcceleratorReport';
import { Application } from 'src/types/Application';
import { FunderProjectDetails } from 'src/types/FunderProject';
import { ParticipantProject } from 'src/types/ParticipantProject';
import { Project, ProjectMeta } from 'src/types/Project';
import { Score } from 'src/types/Score';
import { PhaseVotes } from 'src/types/Votes';
import { getCountryByCode } from 'src/utils/country';
import { formatNumberScale } from 'src/utils/numbers';
import { useNumberFormatter } from 'src/utils/useNumber';

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
  publishedReports?: PublishedReport[];
};

const ProjectProfileView = ({
  participantProject,
  projectDetails,
  project,
  projectMeta,
  organization,
  projectApplication,
  projectScore,
  phaseVotes,
  funderView,
  publishedReports = [],
}: ProjectProfileViewProps) => {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();
  const { isAllowed } = useUser();
  const { activeLocale, countries } = useLocalization();
  const { acceleratorReports } = useProjectReports(projectDetails?.projectId);
  const { fundingEntities } = useProjectFundingEntities(funderView ? undefined : projectDetails?.projectId);

  const numericFormatter = useMemo(() => numberFormatter(activeLocale), [activeLocale, numberFormatter]);
  const isAllowedViewScoreAndVoting = isAllowed('VIEW_PARTICIPANT_PROJECT_SCORING_VOTING');

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
        md={12}
        backgroundColor={theme.palette.TwClrBaseGray100}
        label={label}
        value={value && strings.formatString(strings.X_HA, numericFormatter.format(value))?.toString()}
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
  ]);

  const lastSubmittedReport = useMemo(() => {
    if (acceleratorReports?.length > 0) {
      const submittedReports = acceleratorReports
        .filter((r) => ['Submitted', 'Approved'].includes(r.status) && !!r.submittedTime)
        .toSorted((a, b) => {
          const timeA = a.submittedTime ? new Date(a.submittedTime).getTime() : 0;
          const timeB = b.submittedTime ? new Date(b.submittedTime).getTime() : 0;
          return timeB - timeA;
        });
      if (submittedReports.length > 0) {
        return submittedReports[0];
      }
    }
  }, [acceleratorReports]);

  const lastPublishedReport = useMemo(() => {
    if (publishedReports?.length > 0) {
      const sortedReports = publishedReports.toSorted((a, b) => {
        const timeA = a.publishedTime ? new Date(a.publishedTime).getTime() : 0;
        const timeB = b.publishedTime ? new Date(b.publishedTime).getTime() : 0;
        return timeB - timeA;
      });
      if (sortedReports.length > 0) {
        return sortedReports[0];
      }
    }
  }, [publishedReports]);

  const lastReportTime = useMemo(
    () => (funderView ? lastPublishedReport?.publishedTime : lastSubmittedReport?.submittedTime),
    [funderView, lastPublishedReport, lastSubmittedReport]
  );

  const strippedDealName = useMemo(() => {
    if (projectDetails?.dealName?.startsWith(`${projectDetails?.countryAlpha3}_`)) {
      return projectDetails?.dealName?.replace(`${projectDetails?.countryAlpha3}_`, '');
    } else {
      return projectDetails?.dealName;
    }
  }, [projectDetails?.dealName, projectDetails?.countryAlpha3]);

  return (
    <Card
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
              userId={organization?.tfContactUser?.userId}
              userName={
                organization?.tfContactUser &&
                `${organization?.tfContactUser?.firstName} ${organization?.tfContactUser?.lastName}`
              }
              fontSize={'16px'}
              lineHeight={'24px'}
              fontWeight={500}
            />
          </Box>
        </Grid>
      )}

      {funderView && (
        <Grid container>
          <InvertedCard md={12} backgroundColor={theme.palette.TwClrBaseGray050} value={strippedDealName} />
        </Grid>
      )}

      <Grid container>
        <ProjectOverviewCard md={9} dealDescription={projectDetails?.dealDescription} projectName={project?.name} />
        <Grid item md={3}>
          <Box>
            <InvertedCard
              md={12}
              backgroundColor={theme.palette.TwClrBaseGray100}
              label={strings.COUNTRY}
              value={
                countries && projectDetails?.countryCode
                  ? getCountryByCode(countries, projectDetails?.countryCode)?.name
                  : projectDetails?.countryCode
              }
            />
            {projectSize}
          </Box>
        </Grid>
      </Grid>

      <Grid container paddingTop={theme.spacing(2)}>
        {projectDetails && projectDetails?.projectHighlightPhotoValueId && (
          <ProjectProfileImage
            projectId={projectDetails.projectId}
            imageValueId={projectDetails.projectHighlightPhotoValueId}
            alt={strings.PROJECT_HIGHLIGHT_IMAGE}
          />
        )}
        {projectDetails && projectDetails?.projectZoneFigureValueId && (
          <ProjectProfileImage
            projectId={projectDetails.projectId}
            imageValueId={projectDetails.projectZoneFigureValueId}
            alt={strings.PROJECT_ZONE_FIGURE}
            label={<ProjectFigureLabel labelText={strings.PROJECT_ZONE_FIGURE_VARIABLE} />}
          />
        )}
        {projectDetails && !projectDetails?.projectZoneFigureValueId && (
          <ProjectMap
            application={projectApplication}
            countryCode={projectDetails?.countryCode}
            md={projectDetails?.projectHighlightPhotoValueId ? 6 : 12}
          />
        )}
      </Grid>

      <Grid container>
        <LandUseModelTypeCard
          selectedTypes={projectDetails?.landUseModelTypes}
          modelHectares={projectDetails?.landUseModelHectares}
          numericFormatter={numericFormatter}
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
        {!isPhaseZeroOrApplication && (
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
          value={projectDetails?.totalVCU && numericFormatter.format(projectDetails.totalVCU)}
          units={'t'}
          backgroundColor={theme.palette.TwClrBaseGray050}
        />
        <InvertedCard
          md={4}
          label={strings.ESTIMATED_BUDGET}
          value={
            projectDetails?.perHectareBudget &&
            strings
              .formatString(strings.USD_PER_HECTARE, numericFormatter.format(projectDetails.perHectareBudget))
              ?.toString()
          }
          backgroundColor={theme.palette.TwClrBaseGray050}
        />
      </Grid>

      {lastSubmittedReport && (
        <>
          <Grid container>
            <ReportMetricCard
              label={strings.TOTAL_PLANTED}
              metrics={lastSubmittedReport.systemMetrics}
              metricName={'Hectares Planted'}
              units={'ha'}
            />
            <ReportMetricCard
              label={strings.TOTAL_PLANTED}
              metrics={lastSubmittedReport.systemMetrics}
              metricName={'Trees Planted'}
              units={strings.PLANTS}
              formatter={(value) => formatNumberScale(value, 1)}
            />
            <ReportMetricCard
              label={strings.TOTAL_PLANTED}
              metrics={lastSubmittedReport.systemMetrics}
              metricName={'Species Planted'}
              units={strings.SPECIES}
            />
          </Grid>
        </>
      )}
      {lastPublishedReport && (
        <>
          <Grid container>
            <ReportMetricCard
              label={strings.TOTAL_PLANTED}
              publishedMetrics={lastPublishedReport.systemMetrics}
              metricName={'Hectares Planted'}
              units={'ha'}
            />
            <ReportMetricCard
              label={strings.TOTAL_PLANTED}
              publishedMetrics={lastPublishedReport.systemMetrics}
              metricName={'Trees Planted'}
              units={strings.PLANTS}
              formatter={(value) => formatNumberScale(value, 1)}
            />
            <ReportMetricCard
              label={strings.TOTAL_PLANTED}
              publishedMetrics={lastPublishedReport.systemMetrics}
              metricName={'Species Planted'}
              units={strings.SPECIES}
            />
          </Grid>
        </>
      )}
      <Grid container marginY={theme.spacing(2)} marginLeft={theme.spacing(1)}>
        {((funderView && publishedReports?.length > 0) || (!funderView && acceleratorReports?.length > 0)) && (
          <>
            {lastReportTime && (
              <Grid item marginRight={theme.spacing(3)} marginLeft={theme.spacing(1)}>
                <Typography fontWeight={500}>
                  {strings.formatString(
                    funderView ? strings.LAST_REPORT_PUBLISHED : strings.LAST_REPORT_SUBMITTED,
                    getDateDisplayValue(lastReportTime)
                  )}
                </Typography>
              </Grid>
            )}

            <Grid item>
              <Link
                to={
                  funderView
                    ? `${APP_PATHS.FUNDER_HOME}?tab=report`
                    : APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(
                        ':projectId',
                        (projectDetails?.projectId || '').toString()
                      )
                }
              >
                {strings.VIEW_REPORTS}
              </Link>
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
          <Grid item xs={12} marginTop={theme.spacing(2)}>
            <Typography fontSize='20px' fontWeight={600} lineHeight='28px'>
              {strings.LAND_DATA}
            </Typography>
          </Grid>
        </Box>
        <ProjectFieldDisplay
          label={strings.ELIGIBLE_AREA}
          height={'64px'}
          md={4}
          value={
            projectDetails?.confirmedReforestableLand &&
            strings
              .formatString(strings.X_HA, numericFormatter.format(projectDetails.confirmedReforestableLand))
              ?.toString()
          }
          tooltip={strings.ELIGIBLE_AREA_DESCRIPTION}
        />
        <ProjectFieldDisplay
          label={strings.PROJECT_AREA}
          height={'64px'}
          md={4}
          value={
            projectDetails?.projectArea &&
            strings.formatString(strings.X_HA, numericFormatter.format(projectDetails.projectArea))?.toString()
          }
          tooltip={strings.PROJECT_AREA_DESCRIPTION}
        />
        <ProjectFieldDisplay
          label={strings.NATIVE_SPECIES_TO_BE_PLANTED}
          height={'64px'}
          md={4}
          value={projectDetails?.numNativeSpecies}
        />
        <ProjectFieldDisplay
          label={strings.MIN_PROJECT_AREA}
          height={'64px'}
          md={4}
          value={
            projectDetails?.minProjectArea &&
            strings.formatString(strings.X_HA, numericFormatter.format(projectDetails.minProjectArea))?.toString()
          }
          tooltip={strings.MIN_PROJECT_AREA_DESCRIPTION}
        />
        <ProjectFieldDisplay
          label={strings.EXPANSION_POTENTIAL}
          height={'64px'}
          md={4}
          value={
            projectDetails?.totalExpansionPotential &&
            strings
              .formatString(strings.X_HA, numericFormatter.format(projectDetails.totalExpansionPotential))
              ?.toString()
          }
          tooltip={strings.EXPANSION_POTENTIAL_DESCRIPTION}
        />
      </Grid>

      <Grid container>
        {((!funderView && isPhaseZeroOrApplication) ||
          (!isPhaseZeroOrApplication && (projectDetails?.standard || projectDetails?.methodologyNumber))) && (
          <Box marginX={theme.spacing(2)} width={'100%'}>
            <Grid item xs={12} marginTop={theme.spacing(2)}>
              <Typography fontSize='20px' fontWeight={600} lineHeight='28px'>
                {strings.CARBON_DATA}
              </Typography>
            </Grid>
          </Box>
        )}
        {!funderView && isPhaseZeroOrApplication && (
          <ProjectFieldDisplay
            label={strings.ACCUMULATION_RATE}
            height={'64px'}
            md={4}
            value={projectDetails?.accumulationRate}
            units={<Co2HectareYear />}
          />
        )}
        {!isPhaseZeroOrApplication && (
          <>
            {!funderView && (
              <ProjectFieldDisplay
                label={strings.MIN_MAX_CARBON_ACCUMULATION}
                height={'64px'}
                md={4}
                value={
                  participantProject?.minCarbonAccumulation &&
                  participantProject?.maxCarbonAccumulation &&
                  `${participantProject.minCarbonAccumulation}-${participantProject.maxCarbonAccumulation}`
                }
                units={<Co2HectareYear />}
              />
            )}
            <ProjectFieldDisplay label={strings.STANDARD} height={'64px'} md={4} value={projectDetails?.standard} />
            <ProjectFieldDisplay
              label={strings.METHODOLOGY_NUMBER}
              height={'64px'}
              md={4}
              value={projectDetails?.methodologyNumber}
            />
          </>
        )}
      </Grid>

      {((funderView && projectDetails?.verraLink) || !funderView) && (
        <Grid container>
          <Box
            marginX={theme.spacing(2)}
            border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
            borderRadius={theme.spacing(1)}
            width={'100%'}
            padding={theme.spacing(2)}
          >
            {!funderView && (
              <>
                <Typography fontSize='16px' fontWeight={600} lineHeight='24px' component={'span'}>
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
                  value={APP_PATHS.ACCELERATOR_PROJECT_SCORES.replace(':projectId', `${project.id}`)}
                  label={strings.SCORING}
                />
              )}
              {project && (
                  <ProjectFieldLink
                    value={APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', project.id.toString())}
                    label={strings.REPORTS}
                  />
                )}
              </>
            )}

            <Box paddingTop={theme.spacing(1)}>
              <Typography fontSize='16px' fontWeight={600} lineHeight='24px' component={'span'}>
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
        <Box marginX={theme.spacing(2)} width={'100%'}>
          <Grid item xs={12} marginY={theme.spacing(2)}>
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
              <Typography fontSize='16px' fontWeight={600} lineHeight='24px'>
                {strings.FUNDING_ENTITIES}
              </Typography>
            </Grid>
            {fundingEntities.map((e, i) => (
              <Typography
                key={`entity-${i}`}
                fontSize='20px'
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
