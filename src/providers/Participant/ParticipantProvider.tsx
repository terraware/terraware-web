import React, { useCallback, useEffect, useState } from 'react';

import { useLocalization, useOrganization } from 'src/providers/hooks';
import { requestGetModule } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModuleRequest, selectProjectModuleList } from 'src/redux/features/modules/modulesSelectors';
import { requestGetParticipant } from 'src/redux/features/participants/participantsAsyncThunks';
import { selectParticipant } from 'src/redux/features/participants/participantsSelectors';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Module } from 'src/types/Module';
import { Project } from 'src/types/Project';
import useSnackbar from 'src/utils/useSnackbar';

import { ParticipantContext, ParticipantData } from './ParticipantContext';

export type Props = {
  children: React.ReactNode;
};

const ParticipantProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const snackbar = useSnackbar();

  const [moduleRequestId, setModuleRequestId] = useState('');
  const [currentParticipantProject, setCurrentParticipantProject] = useState<Project>();
  const [currentModule, setCurrentModule] = useState<Module>();
  const [participantProjects, setParticipantProjects] = useState<Project[]>([]);

  const participant = useAppSelector(selectParticipant(currentParticipantProject?.participantId || -1));
  const currentModuleResponse = useAppSelector(selectModuleRequest(moduleRequestId));
  const modules = useAppSelector(selectProjectModuleList(currentParticipantProject?.id || -1));
  const projects = useAppSelector(selectProjects);

  const _setCurrentParticipantProject = useCallback(
    (projectId: string | number) => {
      setCurrentParticipantProject(participantProjects.find((project) => project.id === Number(projectId)));
    },
    [participantProjects]
  );

  const [participantData, setParticipantData] = useState<ParticipantData>({
    participantProjects,
    orgHasParticipants: false,
    setCurrentParticipantProject: _setCurrentParticipantProject,
  });

  useEffect(() => {
    if (participant?.currentModuleId && currentParticipantProject?.id) {
      const request = dispatch(
        requestGetModule({ projectId: currentParticipantProject.id, moduleId: participant.currentModuleId })
      );
      setModuleRequestId(request.requestId);
    }
  }, [currentParticipantProject, dispatch, participant]);

  useEffect(() => {
    const nextParticipantProjects = (projects || []).filter((project) => !!project.participantId);
    setParticipantProjects(nextParticipantProjects);

    // Assign the first participant as the current participant
    if (nextParticipantProjects.length > 0 && !currentParticipantProject) {
      setCurrentParticipantProject(nextParticipantProjects[0]);
    }
  }, [currentParticipantProject, projects]);

  useEffect(() => {
    if (currentParticipantProject?.participantId) {
      dispatch(requestGetParticipant(currentParticipantProject.participantId));
    }
  }, [currentParticipantProject, dispatch]);

  useEffect(() => {
    if (selectedOrganization && activeLocale) {
      setCurrentParticipantProject(undefined);
      dispatch(requestProjects(selectedOrganization.id, activeLocale));
    }
  }, [activeLocale, dispatch, selectedOrganization]);

  useEffect(() => {
    if (!currentModuleResponse) {
      return;
    }

    if (currentModuleResponse.status === 'success' && currentModuleResponse.data) {
      setCurrentModule(currentModuleResponse.data);
    } else if (currentModuleResponse.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [currentModuleResponse, snackbar]);

  useEffect(() => {
    if (currentModule && participant && currentParticipantProject && modules && participantProjects) {
      setParticipantData({
        currentModule,
        currentParticipant: participant,
        currentParticipantProject,
        modules,
        participantProjects,
        orgHasParticipants: participantProjects.length > 0,
        setCurrentParticipantProject: _setCurrentParticipantProject,
      });
    }
  }, [
    currentModule,
    currentParticipantProject,
    modules,
    participant,
    participantProjects,
    _setCurrentParticipantProject,
  ]);

  return <ParticipantContext.Provider value={participantData}>{children}</ParticipantContext.Provider>;
};

export default ParticipantProvider;
