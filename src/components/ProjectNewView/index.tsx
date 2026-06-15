import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Typography } from '@mui/material';
import { FormButton, theme } from '@terraware/web-components';

import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import { useAssignProjectMutation, useCreateProjectMutation } from 'src/queries/generated/projects';
import { SearchResponseBatches } from 'src/services/NurseryBatchService';
import strings from 'src/strings';
import { CreateProjectRequest } from 'src/types/Project';
import { PlantingSiteSearchResult } from 'src/types/Tracking';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import ProjectForm from './flow/ProjectForm';
import SelectAccessions, { SearchResponseAccession } from './flow/SelectAccessions';
import SelectBatches from './flow/SelectBatches';
import SelectPlantingSites from './flow/SelectPlantingSites';
import { getSaveText } from './flow/util';
import { getFormattedSuccessMessages } from './toasts';

export type FlowStates = 'label' | 'accessions' | 'batches' | 'plantingSites';
const STATE_ORDER: FlowStates[] = ['label', 'accessions', 'batches', 'plantingSites'];

export default function ProjectNewView(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const snackbar = useSnackbar();
  const navigate = useSyncNavigate();

  const [createProject, { data: createdProject, isError, isSuccess }] = useCreateProjectMutation();
  const [assignProject, { isError: isAssignError, isSuccess: isAssignSuccess }] = useAssignProjectMutation();

  const [record, setRecord] = useForm<CreateProjectRequest>({
    name: '',
    organizationId: selectedOrganization?.id || -1,
  });

  const [flowState, setFlowState] = useState<FlowStates>('label');
  const [hasAccessions, setHasAccessions] = useState<boolean>(true);
  const [hasBatches, setHasBatches] = useState<boolean>(true);
  const [hasPlantingSites, setHasPlantingSites] = useState<boolean>(true);
  const [saveText, setSaveText] = useState('');
  const [projectAccessions, setProjectAccessions] = useState<SearchResponseAccession[]>([]);
  const [projectBatches, setProjectBatches] = useState<SearchResponseBatches[]>([]);
  const [projectPlantingSites, setProjectPlantingSites] = useState<PlantingSiteSearchResult[]>([]);

  const goToProjects = useCallback(() => {
    navigate({ pathname: APP_PATHS.PROJECTS });
  }, [navigate]);

  const saveProject = useCallback(() => {
    void createProject(record);
  }, [createProject, record]);

  // If we get to the end of the flowState (there are no more valid steps available), create the project
  useEffect(() => {
    if (!flowState) {
      saveProject();
    }
  }, [flowState, saveProject]);

  // Once the project is created, assign the selected entities
  useEffect(() => {
    if (isError) {
      snackbar.toastError();
      return;
    }

    if (!isSuccess || !createdProject) {
      return;
    }

    void assignProject({
      id: createdProject.id,
      assignProjectRequestPayload: {
        accessionIds: projectAccessions.map((entity) => Number(entity.id)),
        batchIds: projectBatches.map((entity) => Number(entity.id)),
        plantingSiteIds: projectPlantingSites.map((entity) => Number(entity.id)),
      },
    });
  }, [
    assignProject,
    createdProject,
    isError,
    isSuccess,
    projectAccessions,
    projectBatches,
    projectPlantingSites,
    snackbar,
  ]);

  // Once the entities are assigned, notify and redirect to the projects list
  useEffect(() => {
    if (isAssignError) {
      snackbar.toastError();
      return;
    }

    if (!isAssignSuccess) {
      return;
    }

    snackbar.toastSuccess(
      getFormattedSuccessMessages(record.name, projectAccessions, projectBatches, projectPlantingSites),
      strings.formatString(strings.PROJECT_ADDED, record.name) as string
    );

    goToProjects();
  }, [
    goToProjects,
    isAssignError,
    isAssignSuccess,
    projectAccessions,
    projectBatches,
    projectPlantingSites,
    record,
    snackbar,
  ]);

  useEffect(() => {
    setSaveText(getSaveText(flowState, hasAccessions, hasBatches, hasPlantingSites));
  }, [flowState, hasAccessions, hasBatches, hasPlantingSites]);

  const onNext = useCallback(() => {
    const nextFlowState = STATE_ORDER[STATE_ORDER.indexOf(flowState) + 1];
    setFlowState(nextFlowState);
  }, [flowState]);

  const onBack = useCallback(() => {
    const nextFlowState = STATE_ORDER[STATE_ORDER.indexOf(flowState) - 1];
    setFlowState(nextFlowState);
  }, [flowState]);

  const onProjectConfigured = useCallback(
    (project: CreateProjectRequest) => {
      setRecord(project);
      onNext();
    },
    [setRecord, onNext]
  );

  const pageFormRightButtons: FormButton[] = useMemo(
    () => [
      {
        id: 'back',
        text: strings.BACK,
        onClick: onBack,
        disabled: false,
        buttonType: 'passive',
      },
      {
        id: 'skip',
        text: strings.SKIP,
        onClick: onNext,
        disabled: false,
        buttonType: 'passive',
      },
    ],
    [onNext, onBack]
  );

  return (
    <TfMain>
      <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 'bold', paddingLeft: theme.spacing(3) }}>
        {strings.ADD_PROJECT}
      </Typography>

      {flowState === 'label' && (
        <ProjectForm<CreateProjectRequest>
          onNext={onProjectConfigured}
          project={record}
          onCancel={goToProjects}
          saveText={strings.NEXT}
        />
      )}

      <SelectAccessions
        project={record}
        flowState={flowState}
        onNext={onNext}
        onCancel={goToProjects}
        saveText={saveText}
        pageFormRightButtons={pageFormRightButtons}
        setProjectAccessions={setProjectAccessions}
        setHasAccessions={setHasAccessions}
      />

      <SelectBatches
        project={record}
        flowState={flowState}
        onNext={onNext}
        onCancel={goToProjects}
        saveText={saveText}
        pageFormRightButtons={pageFormRightButtons}
        setProjectBatches={setProjectBatches}
        setHasBatches={setHasBatches}
      />

      <SelectPlantingSites
        project={record}
        flowState={flowState}
        onNext={onNext}
        onCancel={goToProjects}
        saveText={saveText}
        pageFormRightButtons={pageFormRightButtons}
        setProjectPlantingSites={setProjectPlantingSites}
        setHasPlantingSites={setHasPlantingSites}
      />
    </TfMain>
  );
}
