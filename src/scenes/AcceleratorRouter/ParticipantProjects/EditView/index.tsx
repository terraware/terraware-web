import React, { useCallback, useEffect, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { requestUpdateParticipantProject } from 'src/redux/features/participantProjects/participantProjectsAsyncThunks';
import { selectParticipantProjectUpdateRequest } from 'src/redux/features/participantProjects/participantProjectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import VoteBadge from 'src/scenes/AcceleratorRouter/Voting/VoteBadge';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { useParticipantProjectData } from '../ParticipantProjectContext';
import ProjectFieldCard from '../ProjectField/Card';
import ProjectFieldDisplay from '../ProjectField/Display';
import ProjectFieldMeta from '../ProjectField/Meta';
import ProjectFieldTextAreaEdit from '../ProjectField/TextAreaEdit';
import ProjectFieldTextfield from '../ProjectField/Textfield';
import EditNameConfirm from './EditNameConfirm';

const EditView = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { crumbs, projectId, project } = useParticipantProjectData();
  const { goToParticipantProject } = useNavigateTo();

  const [requestId, setRequestId] = useState<string>('');
  const participantProjectUpdateRequest = useAppSelector(selectParticipantProjectUpdateRequest(requestId));

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // TODO we should probably remove non-editable fields like phaseScore and votingDecision,
  // but these also may not come from the model itself so we will wait until BE is done
  const [record, setRecord, onChange] = useForm(project);

  const saveParticipantProject = useCallback(() => {
    if (record) {
      const dispatched = dispatch(requestUpdateParticipantProject(record));
      setRequestId(dispatched.requestId);
    }
  }, [record, dispatch]);

  const handleOnSave = useCallback(() => {
    if (record?.name !== project?.name) {
      setConfirmModalOpen(true);
      return;
    }

    saveParticipantProject();
  }, [project, record, saveParticipantProject]);

  const handleOnCancel = useCallback(() => goToParticipantProject(projectId), [goToParticipantProject, projectId]);
  const handleOnCloseModal = useCallback(() => setConfirmModalOpen(false), []);

  useEffect(() => {
    if (!participantProjectUpdateRequest) {
      return;
    }

    if (participantProjectUpdateRequest.status === 'error') {
      snackbar.toastError();
    } else if (participantProjectUpdateRequest.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED, strings.SAVED);
      goToParticipantProject(projectId);
    }
  }, [goToParticipantProject, participantProjectUpdateRequest, projectId, snackbar]);

  useEffect(() => {
    if (project) {
      setRecord(project);
    }
  }, [project, setRecord]);

  return (
    <Page
      title={`${project?.organizationName || ''} / ${project?.name || ''}`}
      crumbs={crumbs}
      hierarchicalCrumbs={false}
    >
      <PageForm
        busy={participantProjectUpdateRequest?.status === 'pending'}
        cancelID='cancelNewParticipantProject'
        onCancel={handleOnCancel}
        onSave={handleOnSave}
        saveID='createNewParticipantProject'
      >
        {record && project && (
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
                <ProjectFieldTextfield
                  id={'name'}
                  label={strings.PROJECT_NAME}
                  onChange={onChange}
                  value={record.name}
                />
                <ProjectFieldCard label={strings.PHASE_1_SCORE} value={record.phase1Score} />
                <ProjectFieldCard
                  label={strings.VOTING_DECISION}
                  value={
                    project.votingDecision ? (
                      <Box style={{ margin: 'auto', width: 'fit-content' }}>
                        <VoteBadge vote={project.votingDecision} />
                      </Box>
                    ) : undefined
                  }
                />
                <ProjectFieldDisplay value={false} />
                {/* TODO this will be multiselect with values from backend */}
                <ProjectFieldTextfield
                  id={'pipeline'}
                  label={strings.PIPELINE}
                  onChange={onChange}
                  value={record.pipeline}
                />
                <ProjectFieldTextfield
                  id={'dealStage'}
                  label={strings.DEAL_STAGE}
                  onChange={onChange}
                  value={record.dealStage}
                />
                {/* TODO this will be multiselect with values from backend */}
                <ProjectFieldTextfield
                  id={'country'}
                  label={strings.COUNTRY}
                  onChange={onChange}
                  value={record.country}
                />
                {/* TODO this will be multiselect with values from backend */}
                <ProjectFieldTextfield id={'region'} label={strings.REGION} onChange={onChange} value={record.region} />
                {/* TODO this will be multiselect with values from backend */}
                <ProjectFieldTextfield
                  id={'landUseModelType'}
                  label={strings.LAND_USE_MODEL_TYPE}
                  onChange={onChange}
                  value={record.landUseModelType}
                />
                <ProjectFieldTextfield
                  id={'numberOfNativeSpecies'}
                  label={strings.NUMBER_OF_NATIVE_SPECIES}
                  onChange={onChange}
                  value={record.numberOfNativeSpecies}
                />
                <ProjectFieldTextfield
                  id={'projectHectares'}
                  label={strings.PROJECT_HECTARES}
                  onChange={onChange}
                  value={record.projectHectares}
                />
                <ProjectFieldTextfield
                  id={'resortableLand'}
                  label={strings.RESTORABLE_LAND}
                  onChange={onChange}
                  value={record.restorableLand}
                />
                <ProjectFieldTextfield
                  id={'totalExpansionPotential'}
                  label={strings.TOTAL_EXPANSION_POTENTIAL}
                  onChange={onChange}
                  value={record.totalExpansionPotential}
                />
                <ProjectFieldTextfield
                  id={'minimumCarbonAccumulation'}
                  label={strings.MINIMUM_CARBON_ACCUMULATION}
                  onChange={onChange}
                  value={record.minimumCarbonAccumulation}
                />
                <ProjectFieldTextfield
                  id={'maximumCarbonAccumulation'}
                  label={strings.MAXIMUM_CARBON_ACCUMULATION}
                  onChange={onChange}
                  value={record.maximumCarbonAccumulation}
                />
                <ProjectFieldTextfield
                  id={'perHectareEstimatedBudget'}
                  label={strings.PER_HECTARE_ESTIMATED_BUDGET}
                  onChange={onChange}
                  value={record.perHectareEstimatedBudget}
                />
                <ProjectFieldTextfield
                  id={'previousProjectCost'}
                  label={strings.PREVIOUS_PROJECT_COST}
                  onChange={onChange}
                  value={record.previousProjectCost}
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
                <ProjectFieldTextAreaEdit
                  id={'dealDescription'}
                  label={strings.DEAL_DESCRIPTION}
                  onChange={onChange}
                  value={record.dealDescription}
                />
                <ProjectFieldTextAreaEdit
                  id={'investmentThesis'}
                  label={strings.INVESTMENT_THESIS}
                  onChange={onChange}
                  value={record.investmentThesis}
                />
                <ProjectFieldTextAreaEdit
                  id={'failureRisk'}
                  label={strings.FAILURE_RISK}
                  onChange={onChange}
                  value={record.failureRisk}
                />
                <ProjectFieldTextAreaEdit
                  id={'whatNeedsToBeTrue'}
                  label={strings.WHAT_NEEDS_TO_BE_TRUE}
                  onChange={onChange}
                  value={record.whatNeedsToBeTrue}
                />
              </Grid>
            </Card>
          </>
        )}
      </PageForm>
      {confirmModalOpen && (
        <EditNameConfirm
          onClose={handleOnCloseModal}
          onConfirm={saveParticipantProject}
          organizationName={project?.organizationName || ''}
        />
      )}
    </Page>
  );
};
export default EditView;
