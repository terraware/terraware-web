import { Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { BusySpinner, theme } from '@terraware/web-components';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { AccessionService, NurseryBatchService, SeedBankService, TrackingService } from 'src/services';
import useSnackbar from 'src/utils/useSnackbar';
import useForm from 'src/utils/useForm';
import TfMain from 'src/components/common/TfMain';
import { useOrganization } from 'src/providers/hooks';
import { CreateProjectRequest } from 'src/types/Project';
import ProjectsService from 'src/services/ProjectsService';
import CreateProjectForm from './flow/CreateProjectForm';
import SelectAccessions from './flow/SelectAccessions';
import SelectBatches from './flow/SelectBatches';
import SelectPlantingSites from './flow/SelectPlantingSites';

type FlowStates = 'label' | 'accessions' | 'batches' | 'plantingSites';

type NewProjectFlowProps = {
  reloadData: () => void;
};

export default function NewProjectFlow({ reloadData }: NewProjectFlowProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const [flowState, setFlowState] = useState<FlowStates>('label');
  const [record, setRecord] = useForm<CreateProjectRequest>({
    name: '',
    organizationId: selectedOrganization.id,
  });
  const [batches, setBatches] = useState<any[]>();
  const [accessions, setAccessions] = useState<any[]>();
  const [plantingSites, setPlantingSites] = useState<any[]>();
  const snackbar = useSnackbar();
  const history = useHistory();
  const [projectAccessions, setProjectAccessions] = useState<number[]>();
  const [projectBatches, setProjectBatches] = useState<number[]>();
  const [projectPlantingSites, setProjectPlantingSites] = useState<number[]>();

  useEffect(() => {
    const populateBatches = async () => {
      const searchResponse = await NurseryBatchService.getAllBatches(selectedOrganization.id);

      if (searchResponse) {
        setBatches(searchResponse);
      }
    };

    const populateAccessions = async () => {
      const searchResponse = await SeedBankService.searchAccessions({
        organizationId: selectedOrganization.id,
        fields: [
          'accessionNumber',
          'speciesName',
          'collectionSiteName',
          'collectedDate',
          'receivedDate',
          'state',
          'id',
          'project_name',
        ],
      });

      if (searchResponse) {
        setAccessions(searchResponse);
      }
    };

    const populatePlantingSites = async () => {
      const searchResponse = await TrackingService.searchPlantingSites(selectedOrganization.id);
      if (searchResponse) {
        setPlantingSites(searchResponse);
      }
    };
    populateBatches();
    populateAccessions();
    populatePlantingSites();
  }, [snackbar, selectedOrganization.id]);

  const onProjectConfigured = (project: CreateProjectRequest) => {
    setRecord(project);

    if (accessions?.length) {
      setFlowState('accessions');
    } else if (batches?.length) {
      setFlowState('batches');
    } else if (plantingSites?.length) {
      setFlowState('plantingSites');
    } else {
      saveProject(project);
    }
  };

  const onAccessionsSelected = (accessionsId: number[]) => {
    setProjectAccessions(accessionsId);
    if (batches?.length) {
      setFlowState('batches');
    } else if (plantingSites?.length) {
      setFlowState('plantingSites');
    } else {
      saveProject(record, accessionsId);
    }
  };

  const onBatchesSelected = (batchesId: number[]) => {
    setProjectBatches(batchesId);
    if (plantingSites?.length) {
      setFlowState('plantingSites');
    } else {
      saveProject(record, projectAccessions, batchesId);
    }
  };

  const onPlantingSitesSelected = (plantingSitesIds: number[]) => {
    setProjectPlantingSites(plantingSitesIds);
    saveProject(record, projectAccessions, projectBatches, plantingSitesIds);
  };

  const saveProject = async (
    project: CreateProjectRequest,
    pAccessions?: number[],
    pBatches?: number[],
    pPlantingSites?: number[]
  ) => {
    // first create the project
    let projectId = -1;
    const response = await ProjectsService.createProject(project);
    if (!response.requestSucceeded) {
      snackbar.toastError();
      return;
    } else {
      projectId = response.data.id;
    }

    if (projectId) {
      // assign project to selected accessions
      pAccessions?.forEach(async (accessionId) => {
        const selectedAccession = accessions?.find((iAccession) => iAccession.id === accessionId);
        await AccessionService.updateAccession({
          id: accessionId,
          projectId,
          state: selectedAccession.state,
        });
      });

      // assign project to selected batches
      pBatches?.forEach(async (batchId) => {
        const selectedBatch = batches?.find((iBatch) => iBatch.id === batchId);
        await NurseryBatchService.updateBatch({
          id: batchId,
          projectId,
          version: selectedBatch.version,
        });
      });

      // assign project to selected plantingSites
      pPlantingSites?.forEach(async (plantingSiteId) => {
        const selectedPlantingSite = plantingSites?.find((iPlantingSite) => iPlantingSite.id === plantingSiteId);
        await TrackingService.updatePlantingSite(plantingSiteId, {
          name: selectedPlantingSite.name,
          projectId,
        });
      });
    }

    reloadData();
    // set snackbar with status
    getFormattedSuccessMessage();
    // redirect to projects
    goToProjects();
  };

  const goToProjects = () => {
    history.push({ pathname: APP_PATHS.PROJECTS });
  };

  const getFormattedSuccessMessage = () => {
    if (!projectAccessions?.length && !projectBatches?.length && !projectPlantingSites?.length) {
      snackbar.toastSuccess('', strings.formatString(strings.PROJECT_ADDED, record.name) as string);
    } else {
      snackbar.toastSuccess(
        [
          <p>{strings.formatString(strings.PROJECT_ADDED_DETAILS, record.name)}</p>,
          <ul>
            {!!projectAccessions?.length && (
              <li>{strings.formatString(strings.PROJECT_ADDED_ACCESSIONS, projectAccessions.length.toString())}</li>
            )}
            {!!projectBatches?.length && (
              <li>{strings.formatString(strings.PROJECT_ADDED_BATCHES, projectBatches.length.toString())}</li>
            )}
            {!!projectPlantingSites?.length && (
              <li>
                {strings.formatString(strings.PROJECT_ADDED_PLANTING_SITES, projectPlantingSites.length.toString())}
              </li>
            )}
          </ul>,
        ],
        strings.formatString(strings.PROJECT_ADDED, record.name) as string
      );
    }
  };

  if (!batches) {
    return <BusySpinner />;
  }

  return (
    <TfMain>
      <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 'bold', paddingLeft: theme.spacing(3) }}>
        {strings.ADD_PROJECT}
      </Typography>

      {flowState === 'label' && (
        <CreateProjectForm
          onNext={onProjectConfigured}
          project={record}
          onCancel={goToProjects}
          saveText={strings.NEXT}
        />
      )}

      {flowState === 'accessions' && (
        <SelectAccessions
          onNext={onAccessionsSelected}
          project={record}
          onCancel={goToProjects}
          saveText={strings.NEXT}
          accessions={accessions as any[]}
        />
      )}

      {flowState === 'batches' && (
        <SelectBatches
          onNext={onBatchesSelected}
          project={record}
          onCancel={goToProjects}
          saveText={strings.NEXT}
          batches={batches as any[]}
        />
      )}

      {flowState === 'plantingSites' && (
        <SelectPlantingSites
          onNext={onPlantingSitesSelected}
          project={record}
          onCancel={goToProjects}
          saveText={strings.SAVE}
          plantingSites={plantingSites as any[]}
        />
      )}
    </TfMain>
  );
}
