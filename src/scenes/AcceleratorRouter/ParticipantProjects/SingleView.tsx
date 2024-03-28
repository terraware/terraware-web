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
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useUser } from 'src/providers';
import ParticipantProjectService from 'src/services/ParticipantProjectService';
import strings from 'src/strings';

import PageWithModuleTimeline from '../PageWithModuleTimeline';
import { useParticipantProjectData } from './ParticipantProjectContext';

const SingleView = () => {
  const theme = useTheme();
  const { isAllowed } = useUser();
  const { isMobile } = useDeviceInfo();
  const { crumbs, projectId, project, status } = useParticipantProjectData();
  const { goToParticipantProjectEdit } = useNavigateTo();

  const [exportModalOpen, setExportModalOpen] = useState(false);

  const onOptionItemClick = useCallback((item: DropdownItem) => {
    if (item.value === 'export-participant-project') {
      setExportModalOpen(true);
    }
  }, []);

  const rightComponent = useMemo(
    () => (
      <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
        {isAllowed('UPDATE_PARTICIPANT_PROJECT') && (
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
      </Box>
    ),
    [goToParticipantProjectEdit, isAllowed, projectId, onOptionItemClick, theme]
  );

  return (
    <PageWithModuleTimeline
      title={`${project?.organizationName || ''} / ${project?.name || ''}`}
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
              <ProjectFieldDisplay label={strings.PROJECT_NAME} value={project.name} />
              <PhaseScoreCard project={project} />
              <VotingDecisionCard project={project} />
              <ProjectFieldLink
                label={strings.SEE_SCORECARD}
                value={APP_PATHS.ACCELERATOR_SCORING.replace(':projectId', `${project.id}`)}
              />
              <ProjectFieldDisplay label={strings.PIPELINE} value={project.pipeline} rightBorder={!isMobile} />
              <ProjectFieldDisplay label={strings.DEAL_STAGE} value={project.dealStage} rightBorder={!isMobile} />
              <ProjectFieldDisplay label={strings.COUNTRY} value={project.country} rightBorder={!isMobile} />
              <ProjectFieldDisplay label={strings.REGION} value={project.region} />
              <ProjectFieldDisplay
                label={strings.LAND_USE_MODEL_TYPE}
                value={project.landUseModelType}
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay
                label={strings.NUMBER_OF_NATIVE_SPECIES}
                value={project.numberOfNativeSpecies}
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay
                label={strings.PROJECT_HECTARES}
                link={project.shapeFileUrl}
                value={project.projectHectares}
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay label={strings.RESTORABLE_LAND} value={project.restorableLand} />
              <ProjectFieldDisplay
                label={strings.TOTAL_EXPANSION_POTENTIAL}
                value={project.totalExpansionPotential}
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay
                label={strings.MINIMUM_CARBON_ACCUMULATION}
                value={project.minimumCarbonAccumulation}
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay
                label={strings.MAXIMUM_CARBON_ACCUMULATION}
                value={project.maximumCarbonAccumulation}
                rightBorder={!isMobile}
              />
              <ProjectFieldDisplay
                label={strings.PER_HECTARE_ESTIMATED_BUDGET}
                value={project.perHectareEstimatedBudget}
              />
              <ProjectFieldDisplay
                label={strings.PREVIOUS_PROJECT_COST}
                value={project.previousProjectCost}
                rightBorder={!isMobile}
              />
              <ProjectFieldMeta
                date={project.createdTime}
                dateLabel={strings.CREATED_ON}
                user={project.createdBy}
                userLabel={strings.CREATED_BY}
              />
              <ProjectFieldMeta
                date={project.modifiedTime}
                dateLabel={strings.LAST_MODIFIED_ON}
                user={project.modifiedBy}
                userLabel={strings.LAST_MODIFIED_BY}
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
              <ProjectFieldTextAreaDisplay label={strings.DEAL_DESCRIPTION} value={project.dealDescription} />
              <ProjectFieldTextAreaDisplay label={strings.INVESTMENT_THESIS} value={project.investmentThesis} />
              <ProjectFieldTextAreaDisplay label={strings.FAILURE_RISK} value={project.failureRisk} />
              <ProjectFieldTextAreaDisplay label={strings.WHAT_NEEDS_TO_BE_TRUE} value={project.whatNeedsToBeTrue} />
            </Grid>
          </Card>
        </>
      )}

      <ExportCsvModal
        onExport={() => ParticipantProjectService.download(projectId)}
        onClose={() => {
          setExportModalOpen(false);
        }}
        open={exportModalOpen}
      />
    </PageWithModuleTimeline>
  );
};

export default SingleView;
