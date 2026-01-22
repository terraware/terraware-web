import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Typography } from '@mui/material';
import { FormButton, theme } from '@terraware/web-components';

import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import { SearchResponseBatches } from 'src/services/NurseryBatchService';
import ProjectsService from 'src/services/ProjectsService';
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

type ProjectNewViewProps = {
  reloadData: () => void;
};

export default function ProjectNewView({ reloadData }: ProjectNewViewProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const snackbar = useSnackbar();
  const navigate = useSyncNavigate();

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

  const saveProject = useCallback(async () => {
    // first create the project
    let projectId = -1;
    const response = await ProjectsService.createProject(record);
    if (!response.requestSucceeded || !response.data) {
      snackbar.toastError();
      return;
    } else {
      projectId = response.data.id;
    }

    if (!projectId) {
      snackbar.toastError();
      return;
    }

    await ProjectsService.assignProjectToEntities(projectId, {
      accessionIds: projectAccessions.map((entity) => Number(entity.id)),
      batchIds: projectBatches.map((entity) => Number(entity.id)),
      plantingSiteIds: projectPlantingSites.map((entity) => Number(entity.id)),
    });

    reloadData();

    // set snackbar with status
    snackbar.toastSuccess(
      getFormattedSuccessMessages(record.name, projectAccessions, projectBatches, projectPlantingSites),
      strings.formatString(strings.PROJECT_ADDED, record.name) as string
    );

    // redirect to projects
    goToProjects();
  }, [goToProjects, projectAccessions, projectBatches, projectPlantingSites, record, reloadData, snackbar]);

  // If we get to the end of the flowState (there are no more valid steps available), save the project and redirect
  useEffect(() => {
    if (!flowState) {
      void saveProject();
    }
  }, [flowState, saveProject]);

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
