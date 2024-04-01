import React, { useCallback, useMemo, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { BusySpinner, Button, DropdownItem } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import ProjectFieldDisplay from 'src/components/ProjectField/Display';
import ProjectFieldLink from 'src/components/ProjectField/Link';
import ProjectFieldMeta from 'src/components/ProjectField/Meta';
import PhaseScoreCard from 'src/components/ProjectField/PhaseScoreCard';
import ProjectFieldTextAreaDisplay from 'src/components/ProjectField/TextAreaDisplay';
import VotingDecisionCard from 'src/components/ProjectField/VotingDecisionCard';
import Card from 'src/components/common/Card';
import ExportCsvModal from 'src/components/common/ExportCsvModal';
import OptionsMenu from 'src/components/common/OptionsMenu';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import TextTruncated from 'src/components/common/TextTruncated';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useUser } from 'src/providers';
import ParticipantProjectService from 'src/services/ParticipantProjectService';
import strings from 'src/strings';

import { useScoringData } from '../Scoring/ScoringContext';
import { useVotingData } from '../Voting/VotingContext';
import { useParticipantProjectData } from './ParticipantProjectContext';

const SingleView = () => {
  const theme = useTheme();
  const { isAllowed } = useUser();
  const { isMobile } = useDeviceInfo();
  const { crumbs, participantProject, project, projectId, projectMeta, organization, status } =
    useParticipantProjectData();
  const { phase1Scores } = useScoringData();
  const { phaseVotes } = useVotingData();
  const { goToParticipantProjectEdit } = useNavigateTo();

  const [exportModalOpen, setExportModalOpen] = useState(false);

  const isAllowedEdit = isAllowed('UPDATE_PARTICIPANT_PROJECT');
  const isAllowedExport = isAllowed('EXPORT_PARTICIPANT_PROJECT');
  const isAllowedViewScoreAndVoting = isAllowed('VIEW_PARTICIPANT_PROJECT_SCORING_VOTING');

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

  return (
    <PageWithModuleTimeline
      title={`${organization?.name || ''} / ${project?.name || ''}`}
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      rightComponent={rightComponent}
    >
      {status === 'pending' && <BusySpinner />}

      {project && (
        <>
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
              <ProjectFieldDisplay label={strings.PROJECT_NAME} value={project?.name} />
              {isAllowedViewScoreAndVoting ? (
                <>
                  <PhaseScoreCard phaseScores={phase1Scores} />
                  <VotingDecisionCard phaseVotes={phaseVotes} />
                </>
              ) : (
                <>
                  <ProjectFieldDisplay value={false} />
                  <ProjectFieldDisplay value={false} />
                </>
              )}
              <ProjectFieldLink
                label={strings.SEE_SCORECARD}
                value={APP_PATHS.ACCELERATOR_SCORING.replace(':projectId', `${project.id}`)}
              />
              <ProjectFieldDisplay
                label={strings.PROJECT_ABBREVIATED_NAME}
                value={participantProject?.abbreviatedName}
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay
                label={strings.PROJECT_LEAD}
                value={participantProject?.projectLead}
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay
                label={strings.COUNTRY}
                value={participantProject?.countryCode}
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay label={strings.REGION} value={participantProject?.region} />
              <ProjectFieldDisplay
                label={strings.LAND_USE_MODEL_TYPE}
                value={<TextTruncated fontSize={24} stringList={participantProject?.landUseModelTypes || []} />}
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
                label={strings.MINIMUM_CARBON_ACCUMULATION}
                value={participantProject?.minCarbonAccumulation}
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay
                label={strings.MAXIMUM_CARBON_ACCUMULATION}
                value={participantProject?.maxCarbonAccumulation}
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay
                label={strings.PER_HECTARE_ESTIMATED_BUDGET}
                value={participantProject?.perHectareBudget}
              />
              <ProjectFieldDisplay
                label={strings.NUMBER_OF_COMMUNITIES_WITHIN_PROJECT_AREA}
                value={participantProject?.numCommunities}
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay
                label={strings.DEAL_STAGE}
                value={participantProject?.dealStage}
                rightBorder={!isMobile}
              />
              <ProjectFieldMeta
                date={project?.createdTime}
                dateLabel={strings.CREATED_ON}
                userId={project?.createdBy}
                userName={projectMeta?.createdByUserName}
                userLabel={strings.CREATED_BY}
              />
              <ProjectFieldMeta
                date={project?.modifiedTime}
                dateLabel={strings.LAST_MODIFIED_ON}
                userId={project?.modifiedBy}
                userName={projectMeta?.modifiedByUserName}
                userLabel={strings.BY}
              />
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
