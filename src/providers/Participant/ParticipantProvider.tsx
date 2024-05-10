import React, { useCallback, useEffect, useState } from 'react';

import { useLocalization, useOrganization } from 'src/providers/hooks';
import {
  requestListModuleDeliverables,
  requestListModuleProjects,
  requestListModules,
} from 'src/redux/features/modules/modulesAsyncThunks';
import {
  selectModuleDeliverables,
  selectModuleProjects,
  selectProjectModuleList,
} from 'src/redux/features/modules/modulesSelectors';
import { requestGetParticipant } from 'src/redux/features/participants/participantsAsyncThunks';
import { selectParticipant } from 'src/redux/features/participants/participantsSelectors';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Module, ModuleDeliverable } from 'src/types/Module';
import { Project } from 'src/types/Project';

import { ParticipantContext, ParticipantData } from './ParticipantContext';

export type Props = {
  children: React.ReactNode;
};

const ParticipantProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();

  const [activeModules, setActiveModules] = useState<Module[]>([]);
  const [currentDeliverables, setCurrentDeliverables] = useState<ModuleDeliverable[]>([]);
  const [currentParticipantProject, setCurrentParticipantProject] = useState<Project>();
  const [participantProjects, setParticipantProjects] = useState<Project[]>([]);
  const [moduleProjects, setModuleProjects] = useState<Project[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [orgHasModules, setOrgHasModules] = useState<boolean | undefined>(undefined);
  const [orgHasParticipants, setOrgHasParticipants] = useState<boolean | undefined>(undefined);

  const [listModuleDeliverablesRequest, setListModuleDeliverablesRequest] = useState<string>('');
  const [listModulesRequest, setListModulesRequest] = useState<string>('');
  const [listModuleProjectsRequest, setListModuleProjectsRequest] = useState<string>('');

  const moduleDeliverablesRequest = useAppSelector(selectModuleDeliverables(listModuleDeliverablesRequest));
  const moduleProjectsList = useAppSelector(selectModuleProjects(listModuleProjectsRequest));
  const participant = useAppSelector(selectParticipant(currentParticipantProject?.participantId || -1));
  const projectModuleList = useAppSelector(selectProjectModuleList(listModulesRequest));
  const projects = useAppSelector(selectProjects);

  const _setCurrentParticipantProject = useCallback(
    (projectId: string | number) => {
      setCurrentParticipantProject(participantProjects.find((project) => project.id === Number(projectId)));
    },
    [participantProjects]
  );

  const [participantData, setParticipantData] = useState<ParticipantData>({
    activeModules,
    currentDeliverables,
    moduleProjects,
    modules,
    orgHasModules,
    orgHasParticipants,
    participantProjects,
    setCurrentParticipantProject: _setCurrentParticipantProject,
  });

  useEffect(() => {
    if (selectedOrganization && activeLocale) {
      setCurrentParticipantProject(undefined);
      setModuleProjects([]);
      setOrgHasModules(undefined);
      setOrgHasParticipants(undefined);
      setParticipantProjects([]);
      dispatch(requestProjects(selectedOrganization.id, activeLocale));
    }
  }, [activeLocale, dispatch, selectedOrganization]);

  useEffect(() => {
    const nextParticipantProjects = (projects || []).filter((project) => !!project.participantId);
    setParticipantProjects(nextParticipantProjects);
    setOrgHasParticipants(nextParticipantProjects.length > 0);
  }, [projects]);

  useEffect(() => {
    if (selectedOrganization) {
      const request = dispatch(requestListModuleProjects(selectedOrganization.id));
      setListModuleProjectsRequest(request.requestId);
    }
  }, [selectedOrganization, dispatch]);

  useEffect(() => {
    if (!currentParticipantProject || !projectModuleList) {
      return;
    }
    if (projectModuleList.status === 'success') {
      const nextModules = projectModuleList.data ?? [];
      setModules(nextModules);

      const nextActiveModules = nextModules.filter((module) => module.isActive === true);
      setActiveModules(nextActiveModules);

      if (nextActiveModules.length > 0) {
        const deliverableRequest = dispatch(
          requestListModuleDeliverables({ moduleId: nextActiveModules[0].id, projectId: currentParticipantProject.id })
        );
        setListModuleDeliverablesRequest(deliverableRequest.requestId);
      }
    }
  }, [currentParticipantProject, projectModuleList]);

  useEffect(() => {
    if (!moduleDeliverablesRequest) {
      return;
    }

    if (moduleDeliverablesRequest.status === 'success' && moduleDeliverablesRequest.data) {
      setCurrentDeliverables(moduleDeliverablesRequest.data);
    }
  }, [moduleDeliverablesRequest]);

  useEffect(() => {
    if (moduleProjectsList && moduleProjectsList.status === 'success' && moduleProjectsList.data) {
      const nextModuleProjects = moduleProjectsList.data
        .map((id) => participantProjects.find((project) => project.id === id))
        .filter((project): project is Project => !!project);

      setModuleProjects(nextModuleProjects);
      setOrgHasModules(nextModuleProjects.length > 0);

      // Assign the first project with modules as the current participant project
      if (nextModuleProjects.length > 0 && !currentParticipantProject) {
        setCurrentParticipantProject(nextModuleProjects[0]);
      }
    }
  }, [moduleProjectsList, currentParticipantProject, participantProjects]);

  useEffect(() => {
    if (currentParticipantProject?.participantId) {
      dispatch(requestGetParticipant(currentParticipantProject.participantId));
      const request = dispatch(requestListModules(currentParticipantProject.id));
      setListModulesRequest(request.requestId);
    }
  }, [currentParticipantProject, dispatch]);

  useEffect(() => {
    setParticipantData({
      activeModules,
      currentDeliverables,
      currentParticipant: participant,
      currentParticipantProject,
      moduleProjects,
      modules,
      participantProjects,
      orgHasModules: orgHasModules,
      orgHasParticipants: orgHasParticipants,
      setCurrentParticipantProject: _setCurrentParticipantProject,
    });
  }, [
    activeModules,
    currentDeliverables,
    currentParticipantProject,
    moduleProjects,
    modules,
    orgHasModules,
    orgHasParticipants,
    participant,
    participantProjects,
    _setCurrentParticipantProject,
  ]);

  return <ParticipantContext.Provider value={participantData}>{children}</ParticipantContext.Provider>;
};

export default ParticipantProvider;
