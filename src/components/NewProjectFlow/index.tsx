import { Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { BusySpinner, theme } from '@terraware/web-components';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { NurseryBatchService, SeedBankService } from 'src/services';
import useSnackbar from 'src/utils/useSnackbar';
import useForm from 'src/utils/useForm';
import TfMain from 'src/components/common/TfMain';
import { useOrganization } from 'src/providers/hooks';
import { CreateProjectRequest } from 'src/types/Project';
import ProjectsService from 'src/services/ProjectsService';
import CreateProjectForm from './flow/CreateProjectForm';

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
        fields: ['accessionNumber', 'speciesName', 'collectionSiteName', 'collectedDate', 'receivedDate', 'id'],
      });

      if (searchResponse) {
        setAccessions(searchResponse);
      }
    };
    populateBatches();
    populateAccessions();
  }, [snackbar, selectedOrganization.id]);

  const onProjectConfigured = (project: CreateProjectRequest) => {
    console.log(project);
    setRecord(project);

    // if (accessions?.length) {
    //   setFlowState('accessions');
    // } else if (batches?.length) {
    //   setFlowState('batches');
    // } else if (plantingSites?.length) {
    //   setFlowState('plantingSites');
    // } else {
    //   saveProject();
    // }

    saveProject(project);
  };

  const onAccessionsSelected = (accessionsId: number[]) => {
    setProjectAccessions(accessionsId);
    if (batches?.length) {
      setFlowState('batches');
    } else if (plantingSites?.length) {
      setFlowState('plantingSites');
    } else {
      saveProject(record);
    }
  };

  const onBatchesSelected = (batchesId: number[]) => {
    setProjectBatches(batchesId);
    if (plantingSites?.length) {
      setFlowState('plantingSites');
    } else {
      saveProject(record);
    }
  };

  const onPlantingSitesSelected = (plantingSitesIds: number[]) => {
    setProjectPlantingSites(plantingSitesIds);
    saveProject(record);
  };

  const saveProject = async (project: CreateProjectRequest) => {
    // first create the project
    const response = await ProjectsService.createProject(project);
    if (!response.requestSucceeded) {
      snackbar.toastError();
      return;
    }

    reloadData();
    // set snackbar with status
    snackbar.toastSuccess(getFormattedSuccessMessage());
    // redirect to projects
    goToProjects();
  };

  const goToProjects = () => {
    history.push({ pathname: APP_PATHS.PROJECTS });
  };

  const getFormattedSuccessMessage = (): string => {
    return strings.formatString(strings.PROJECT_ADDED, record.name) as string;
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
    </TfMain>
  );
}
