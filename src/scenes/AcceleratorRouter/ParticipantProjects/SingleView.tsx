import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, DropdownItem } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import ApplicationStatusCard from 'src/components/ProjectField/ApplicationStatusCard';
import ProjectFieldDisplay from 'src/components/ProjectField/Display';
import ProjectFieldMeta from 'src/components/ProjectField/Meta';
import PhaseScoreCard from 'src/components/ProjectField/PhaseScoreCard';
import ProjectFieldTextAreaDisplay from 'src/components/ProjectField/TextAreaDisplay';
import VotingDecisionCard from 'src/components/ProjectField/VotingDecisionCard';
import Card from 'src/components/common/Card';
import ExportCsvModal from 'src/components/common/ExportCsvModal';
import Link from 'src/components/common/Link';
import OptionsMenu from 'src/components/common/OptionsMenu';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import TextTruncated from 'src/components/common/TextTruncated';
import { APP_PATHS } from 'src/constants';
import useListModules from 'src/hooks/useListModules';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization, useUser } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import { requestListDeliverables } from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { selectDeliverablesSearchRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import ParticipantProjectService from 'src/services/ParticipantProjectService';
import strings from 'src/strings';
import { getCountryByCode } from 'src/utils/country';

import { useParticipantProjectData } from './ParticipantProjectContext';
import { useScoringData } from './Scoring/ScoringContext';
import { useVotingData } from './Voting/VotingContext';

const SingleView = () => {
  const { activeLocale, countries } = useLocalization();
  const theme = useTheme();
  const { isAllowed } = useUser();
  const { isMobile } = useDeviceInfo();
  const { crumbs, participant, participantProject, project, projectId, projectMeta, organization, status } =
    useParticipantProjectData();
  const { phase0Scores, phase1Scores } = useScoringData();
  const { phaseVotes } = useVotingData();
  const { goToParticipantProjectEdit } = useNavigateTo();
  const dispatch = useAppDispatch();
  const { modules, listModules } = useListModules();
  const [searchDeliverablesRequestId, setSearchDeliverablesRequestId] = useState('');
  const deliverablesResponse = useAppSelector(selectDeliverablesSearchRequest(searchDeliverablesRequestId));
  const [hasDeliverables, setHasDeliverables] = useState(false);

  useEffect(() => {
    if (project) {
      void listModules({ projectId: project.id });
    }
  }, [project, listModules]);

  useEffect(() => {
    const request = dispatch(requestListDeliverables({ locale: activeLocale, listRequest: { projectId } }));
    setSearchDeliverablesRequestId(request.requestId);
  }, [activeLocale, projectId]);

  useEffect(() => {
    if (deliverablesResponse?.status === 'success' && (deliverablesResponse?.data?.length || 0) > 0) {
      setHasDeliverables(true);
    }
  }, [deliverablesResponse]);

  const [exportModalOpen, setExportModalOpen] = useState(false);

  const isAllowedEdit = isAllowed('UPDATE_PARTICIPANT_PROJECT');
  const isAllowedExport = isAllowed('EXPORT_PARTICIPANT_PROJECT');
  const isAllowedViewScoreAndVoting = isAllowed('VIEW_PARTICIPANT_PROJECT_SCORING_VOTING');

  const { getApplicationByProjectId } = useApplicationData();

  const projectApplication = useMemo(
    () => getApplicationByProjectId(projectId),
    [getApplicationByProjectId, projectId]
  );

  const onOptionItemClick = useCallback((item: DropdownItem) => {
    if (item.value === 'export-participant-project') {
      setExportModalOpen(true);
    }
  }, []);

  const rightComponent = useMemo(
    () => (
      <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
        {isAllowedEdit && (
          <Button
            id='editProject'
            icon='iconEdit'
            label={strings.EDIT_PROJECT}
            priority='primary'
            onClick={() => goToParticipantProjectEdit(projectId)}
            size='medium'
            type='productive'
          />
        )}

        {isAllowedExport && (
          <OptionsMenu
            onOptionItemClick={onOptionItemClick}
            optionItems={[
              {
                label: strings.EXPORT,
                type: 'passive',
                value: 'export-participant-project',
              },
            ]}
          />
        )}
      </Box>
    ),
    [goToParticipantProjectEdit, isAllowedEdit, isAllowedExport, projectId, onOptionItemClick, theme]
  );

  const activeScores = useMemo(() => {
    switch (project?.cohortPhase) {
      case 'Pre-Screen':
      case 'Application':
      case 'Phase 0 - Due Diligence':
        return phase0Scores;
      case 'Phase 1 - Feasibility Study':
      case 'Phase 2 - Plan and Scale':
      case 'Phase 3 - Implement and Monitor':
        return phase1Scores;
    }

    // Default to phase 1 when data is missing
    return phase1Scores;
  }, [project?.cohortPhase, phase0Scores, phase1Scores]);

  const projectViewTitle = (
    <Box paddingLeft={1}>
      <Typography fontSize={'24px'} fontWeight={600}>
        {participant?.name || ''} / {project?.name || ''}
      </Typography>
    </Box>
  );

  return (
    <PageWithModuleTimeline
      title={projectViewTitle}
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      rightComponent={rightComponent}
      titleContainerStyle={{ marginBottom: 0 }}
      cohortPhase={project?.cohortPhase}
      modules={modules ?? []}
    >
      {status === 'pending' && <BusySpinner />}

      {project && (
        <>
          {hasDeliverables && (
            <Box paddingLeft={3}>
              <Link to={`${APP_PATHS.ACCELERATOR_DELIVERABLES}?projectId=${project.id}`} style={{ fontWeight: 400 }}>
                {strings.VIEW_ALL_DELIVERABLES}
              </Link>
            </Box>
          )}
          <Card
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              marginBottom: theme.spacing(3),
              padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
              marginTop: 4,
            }}
          >
            <ProjectFieldDisplay label={strings.PROJECT_NAME} value={project?.name} md={12} />

            <Grid container>
              {!!projectApplication?.id && (
                <ApplicationStatusCard
                  application={projectApplication}
                  linkTo={APP_PATHS.ACCELERATOR_APPLICATION.replace(':applicationId', `${projectApplication.id}`)}
                  md={!isAllowedViewScoreAndVoting ? 12 : undefined}
                />
              )}
              {isAllowedViewScoreAndVoting && (
                <>
                  <PhaseScoreCard
                    linkTo={APP_PATHS.ACCELERATOR_PROJECT_SCORES.replace(':projectId', `${project.id}`)}
                    md={!projectApplication?.id ? 6 : undefined}
                    phaseScores={activeScores}
                  />
                  <VotingDecisionCard
                    linkTo={APP_PATHS.ACCELERATOR_PROJECT_VOTES.replace(':projectId', `${projectId}`)}
                    md={!projectApplication?.id ? 6 : undefined}
                    phaseVotes={phaseVotes}
                  />
                </>
              )}
              <ProjectFieldDisplay
                label={strings.FILE_NAMING}
                value={participantProject?.fileNaming}
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay
                label={strings.PROJECT_LEAD}
                value={
                  organization?.tfContactUser
                    ? `${organization.tfContactUser.firstName} ${organization.tfContactUser.lastName}`
                    : ''
                }
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay
                label={strings.COUNTRY}
                value={
                  countries && participantProject?.countryCode
                    ? getCountryByCode(countries, participantProject?.countryCode)?.name
                    : participantProject?.countryCode
                }
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay label={strings.REGION} value={participantProject?.region} />
              <ProjectFieldDisplay
                label={strings.LAND_USE_MODEL_TYPE}
                value={
                  <TextTruncated
                    fontSize={24}
                    fontWeight={600}
                    stringList={participantProject?.landUseModelTypes || []}
                  />
                }
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay
                label={strings.NUMBER_OF_NATIVE_SPECIES}
                value={participantProject?.numNativeSpecies}
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay
                label={strings.APPLICATION_RESTORABLE_LAND}
                value={participantProject?.applicationReforestableLand}
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay
                label={strings.CONFIRMED_RESTORABLE_LAND}
                value={participantProject?.confirmedReforestableLand}
              />
              <ProjectFieldDisplay
                label={strings.TOTAL_EXPANSION_POTENTIAL}
                value={participantProject?.totalExpansionPotential}
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay
                label={strings.PER_HECTARE_ESTIMATED_BUDGET}
                value={participantProject?.perHectareBudget}
              />
              <ProjectFieldDisplay
                label={strings.HUBSPOT_LINK}
                value={
                  participantProject?.hubSpotUrl ? (
                    <a href={participantProject.hubSpotUrl} rel='noopener noreferrer' target='_blank'>
                      {strings.LINK}
                    </a>
                  ) : null
                }
              />
              <ProjectFieldMeta
                date={project?.createdTime}
                dateLabel={strings.CREATED_ON}
                userId={project?.createdBy}
                userName={projectMeta?.createdByUserName}
                userLabel={strings.BY}
              />
              <ProjectFieldMeta
                date={project?.modifiedTime}
                dateLabel={strings.LAST_MODIFIED_ON}
                userId={project?.modifiedBy}
                userName={projectMeta?.modifiedByUserName}
                userLabel={strings.BY}
              />
            </Grid>
            <Grid container>
              <Grid item xs={12} margin={`0 ${theme.spacing(2)}`}>
                <Typography fontSize='20px' fontWeight={600} lineHeight='28px'>
                  {strings.CARBON}
                </Typography>
              </Grid>
              <ProjectFieldDisplay
                label={strings.MIN_MAX_CARBON_ACCUMULATION}
                value={
                  participantProject?.minCarbonAccumulation && participantProject?.maxCarbonAccumulation
                    ? `${participantProject.minCarbonAccumulation}-${participantProject.maxCarbonAccumulation}`
                    : undefined
                }
              />
              <ProjectFieldDisplay label={strings.CARBON_CAPACITY_TC02_HA} value={participantProject?.carbonCapacity} />
              <ProjectFieldDisplay label={strings.ANNUAL_CARBON_T} value={participantProject?.annualCarbon} />
              <ProjectFieldDisplay label={strings.TOTAL_CARBON_T} value={participantProject?.totalCarbon} />
            </Grid>
          </Card>
          <Card
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              marginBottom: theme.spacing(3),
              padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
            }}
          >
            <Grid container>
              <ProjectFieldTextAreaDisplay
                label={strings.DEAL_DESCRIPTION}
                value={participantProject?.dealDescription}
              />
              <ProjectFieldTextAreaDisplay
                label={strings.INVESTMENT_THESIS}
                value={participantProject?.investmentThesis}
              />
              <ProjectFieldTextAreaDisplay label={strings.FAILURE_RISK} value={participantProject?.failureRisk} />
              <ProjectFieldTextAreaDisplay
                label={strings.WHAT_NEEDS_TO_BE_TRUE}
                value={participantProject?.whatNeedsToBeTrue}
              />
            </Grid>
          </Card>
        </>
      )}

      <ExportCsvModal
        onExport={() =>
          ParticipantProjectService.download({
            participantProject,
            phase1Scores,
            phaseVotes,
            project,
            projectId,
            projectMeta,
            organization,
          })
        }
        onClose={() => {
          setExportModalOpen(false);
        }}
        open={exportModalOpen}
      />
    </PageWithModuleTimeline>
  );
};

export default SingleView;
