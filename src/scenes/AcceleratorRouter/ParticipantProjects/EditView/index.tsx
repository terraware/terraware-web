import React, { useCallback, useEffect, useState } from 'react';

import { Grid, useTheme } from '@mui/material';

import Page from 'src/components/Page';
import CountrySelect from 'src/components/ProjectField/CountrySelect';
import ProjectFieldDisplay from 'src/components/ProjectField/Display';
import LandUseMultiSelect from 'src/components/ProjectField/LandUseMultiSelect';
import PhaseScoreCard from 'src/components/ProjectField/PhaseScoreCard';
import RegionSelect from 'src/components/ProjectField/RegionSelect';
import ProjectFieldTextAreaEdit from 'src/components/ProjectField/TextAreaEdit';
import ProjectFieldTextfield from 'src/components/ProjectField/Textfield';
import VotingDecisionCard from 'src/components/ProjectField/VotingDecisionCard';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { requestUpdateParticipantProject } from 'src/redux/features/participantProjects/participantProjectsAsyncThunks';
import { selectParticipantProjectUpdateRequest } from 'src/redux/features/participantProjects/participantProjectsSelectors';
import { requestProjectUpdate } from 'src/redux/features/projects/projectsAsyncThunks';
import { selectProjectRequest } from 'src/redux/features/projects/projectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { useScoringData } from '../../Scoring/ScoringContext';
import { useVotingData } from '../../Voting/VotingContext';
import { useParticipantProjectData } from '../ParticipantProjectContext';
import EditNameConfirm from './EditNameConfirm';

const EditView = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { crumbs, projectId, participantProject, project, organization, reload } = useParticipantProjectData();
  const { phase1Scores } = useScoringData();
  const { phaseVotes } = useVotingData();
  const { goToParticipantProject } = useNavigateTo();

  const [participantProjectRequestId, setParticipantProjectRequestId] = useState<string>('');
  const participantProjectUpdateRequest = useAppSelector(
    selectParticipantProjectUpdateRequest(participantProjectRequestId)
  );
  const [projectRequestId, setProjectRequestId] = useState<string>('');
  const projectUpdateRequest = useAppSelector((state) => selectProjectRequest(state, projectRequestId));

  const [confirmProjectNameModalOpen, setConfirmProjectNameModalOpen] = useState(false);

  // TODO we should probably remove non-editable fields like phaseScore and votingDecision,
  // but these also may not come from the model itself so we will wait until BE is done
  const [participantProjectRecord, setParticipantProjectRecord, onChangeParticipantProject] =
    useForm(participantProject);
  const [projectRecord, setProjectRecord, onChangeProject] = useForm(project);

  const saveParticipantProject = useCallback(() => {
    if (participantProjectRecord) {
      const dispatched = dispatch(requestUpdateParticipantProject(participantProjectRecord));
      setParticipantProjectRequestId(dispatched.requestId);
    }
  }, [participantProjectRecord, dispatch]);

  const saveProject = useCallback(() => {
    if (projectRecord) {
      const dispatched = dispatch(requestProjectUpdate({ projectId, project: projectRecord }));
      setProjectRequestId(dispatched.requestId);
    }
  }, [projectId, projectRecord, dispatch]);

  const handleOnSave = useCallback(() => {
    if (projectRecord?.name !== project?.name) {
      setConfirmProjectNameModalOpen(true);
      return;
    }

    saveParticipantProject();
  }, [project, projectRecord, saveParticipantProject]);

  const handleOnCancel = useCallback(() => goToParticipantProject(projectId), [goToParticipantProject, projectId]);
  const handleOnCloseModal = useCallback(() => setConfirmProjectNameModalOpen(false), []);

  useEffect(() => {
    if (!participantProjectUpdateRequest) {
      return;
    }

    if (participantProjectUpdateRequest.status === 'error') {
      snackbar.toastError();
    } else if (participantProjectUpdateRequest.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED, strings.SAVED);
      reload();
      goToParticipantProject(projectId);
    }
  }, [goToParticipantProject, participantProjectUpdateRequest, projectId, snackbar, reload]);

  useEffect(() => {
    if (!projectUpdateRequest) {
      return;
    }

    if (projectUpdateRequest.status === 'error') {
      snackbar.toastError();
    } else if (projectUpdateRequest.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED, strings.SAVED);
      reload();
      goToParticipantProject(projectId);
    }
  }, [goToParticipantProject, projectUpdateRequest, projectId, snackbar, reload]);

  useEffect(() => {
    if (project) {
      setProjectRecord(project);
    }
  }, [project, setProjectRecord]);

  useEffect(() => {
    if (participantProject) {
      setParticipantProjectRecord(participantProject);
    }
  }, [participantProject, setParticipantProjectRecord]);

  return (
    <Page title={`${organization?.name || ''} / ${project?.name || ''}`} crumbs={crumbs} hierarchicalCrumbs={false}>
      <PageForm
        busy={participantProjectUpdateRequest?.status === 'pending'}
        cancelID='cancelNewParticipantProject'
        onCancel={handleOnCancel}
        onSave={handleOnSave}
        saveID='createNewParticipantProject'
      >
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
              onChange={onChangeProject}
              value={projectRecord?.name}
            />
            <PhaseScoreCard phaseScores={phase1Scores} />
            <VotingDecisionCard phaseVotes={phaseVotes} />
            <ProjectFieldDisplay value={false} />
            <ProjectFieldTextfield
              id={'abbreviatedName'}
              label={strings.PROJECT_ABBREVIATED_NAME}
              onChange={onChangeParticipantProject}
              value={participantProject?.abbreviatedName}
            />
            <ProjectFieldTextfield
              id={'projectLead'}
              label={strings.PROJECT_LEAD}
              onChange={onChangeParticipantProject}
              value={participantProject?.projectLead}
            />
            <CountrySelect
              id={'countryCode'}
              label={strings.COUNTRY}
              onChange={onChangeParticipantProject}
              value={participantProject?.countryCode}
            />
            <RegionSelect
              id={'region'}
              label={strings.REGION}
              onChange={onChangeParticipantProject}
              value={participantProject?.region}
            />
            <LandUseMultiSelect
              id={'landUseModelTypes'}
              label={strings.LAND_USE_MODEL_TYPE}
              onChange={onChangeParticipantProject}
              value={participantProject?.landUseModelTypes}
            />
            <ProjectFieldTextfield
              id={'numNativeSpecies'}
              label={strings.NUMBER_OF_NATIVE_SPECIES}
              onChange={onChangeParticipantProject}
              value={participantProject?.numNativeSpecies}
            />
            <ProjectFieldTextfield
              id={'applicationReforestableLand'}
              label={strings.APPLICATION_RESTORABLE_LAND}
              onChange={onChangeParticipantProject}
              value={participantProject?.applicationReforestableLand}
            />
            <ProjectFieldTextfield
              id={'confirmedReforestableLand'}
              label={strings.CONFIRMED_RESTORABLE_LAND}
              onChange={onChangeParticipantProject}
              value={participantProject?.confirmedReforestableLand}
            />
            <ProjectFieldTextfield
              id={'totalExpansionPotential'}
              label={strings.TOTAL_EXPANSION_POTENTIAL}
              onChange={onChangeParticipantProject}
              value={participantProject?.totalExpansionPotential}
            />
            <ProjectFieldTextfield
              id={'minCarbonAccumulation'}
              label={strings.MINIMUM_CARBON_ACCUMULATION}
              onChange={onChangeParticipantProject}
              value={participantProject?.minCarbonAccumulation}
            />
            <ProjectFieldTextfield
              id={'maxCarbonAccumulation'}
              label={strings.MAXIMUM_CARBON_ACCUMULATION}
              onChange={onChangeParticipantProject}
              value={participantProject?.maxCarbonAccumulation}
            />
            <ProjectFieldTextfield
              id={'perHectareBudget'}
              label={strings.PER_HECTARE_ESTIMATED_BUDGET}
              onChange={onChangeParticipantProject}
              value={participantProject?.perHectareBudget}
            />
            <ProjectFieldTextfield
              id={'numCommunities'}
              label={strings.NUMBER_OF_COMMUNITIES_WITHIN_PROJECT_AREA}
              onChange={onChangeParticipantProject}
              value={participantProject?.numCommunities}
            />
            <ProjectFieldDisplay label={strings.DEAL_STAGE} value={participantProject?.dealStage} />
            {/* TODO need to know where this is supposed to come from, participant project details or project */}
            {/* <ProjectFieldMeta
              date={project?.createdTime}
              dateLabel={strings.CREATED_ON}
              user={project?.createdBy}
              userLabel={strings.CREATED_BY}
            />
            <ProjectFieldMeta
              date={project?.modifiedTime}
              dateLabel={strings.LAST_MODIFIED_ON}
              user={project?.modifiedBy}
              userLabel={strings.LAST_MODIFIED_BY}
            /> */}
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
              onChange={onChangeParticipantProject}
              value={participantProject?.dealDescription}
            />
            <ProjectFieldTextAreaEdit
              id={'investmentThesis'}
              label={strings.INVESTMENT_THESIS}
              onChange={onChangeParticipantProject}
              value={participantProject?.investmentThesis}
            />
            <ProjectFieldTextAreaEdit
              id={'failureRisk'}
              label={strings.FAILURE_RISK}
              onChange={onChangeParticipantProject}
              value={participantProject?.failureRisk}
            />
            <ProjectFieldTextAreaEdit
              id={'whatNeedsToBeTrue'}
              label={strings.WHAT_NEEDS_TO_BE_TRUE}
              onChange={onChangeParticipantProject}
              value={participantProject?.whatNeedsToBeTrue}
            />
          </Grid>
        </Card>
      </PageForm>
      {confirmProjectNameModalOpen && (
        <EditNameConfirm
          onClose={handleOnCloseModal}
          onConfirm={saveProject}
          organizationName={organization?.name || ''}
        />
      )}
    </Page>
  );
};
export default EditView;
