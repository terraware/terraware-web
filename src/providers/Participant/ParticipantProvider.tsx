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
import { selectParticipantGetRequest } from 'src/redux/features/participants/participantsSelectors';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Module } from 'src/types/Module';
import { Participant } from 'src/types/Participant';
import { Project } from 'src/types/Project';

import { ParticipantContext, ParticipantData } from './ParticipantContext';
import { ListDeliverablesElement } from 'src/types/Deliverables';

export type Props = {
  children: React.ReactNode;
};

const ParticipantProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();

  const [activeModules, setActiveModules] = useState<Module[]>([]);
  const [currentDeliverables, setCurrentDeliverables] = useState<ListDeliverablesElement[]>();
  const [currentParticipant, setCurrentParticipant] = useState<Participant>();
  const [currentParticipantProject, setCurrentParticipantProject] = useState<Project>();
  const [participantProjects, setParticipantProjects] = useState<Project[]>([]);
  const [moduleProjects, setModuleProjects] = useState<Project[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [orgHasModules, setOrgHasModules] = useState<boolean | undefined>(undefined);
  const [orgHasParticipants, setOrgHasParticipants] = useState<boolean | undefined>(undefined);

  const [participantRequestId, setParticipantRequestId] = useState<string>('');
  const [listModuleDeliverablesRequestId, setListModuleDeliverablesRequestId] = useState<string>('');
  const [listModulesRequestId, setListModulesRequestId] = useState<string>('');
  const [listModuleProjectsRequestId, setListModuleProjectsRequestId] = useState<string>('');

  const moduleDeliverablesRequest = useAppSelector(selectModuleDeliverables(listModuleDeliverablesRequestId));
  const moduleProjectsListRequest = useAppSelector(selectModuleProjects(listModuleProjectsRequestId));
  const currentParticipantRequest = useAppSelector(selectParticipantGetRequest(participantRequestId));
  const projectModuleListRequest = useAppSelector(selectProjectModuleList(listModulesRequestId));
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
    isLoading: true,
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
      setListModuleProjectsRequestId(request.requestId);
    }
  }, [selectedOrganization, dispatch]);

  useEffect(() => {
    if (!currentParticipantProject || !currentParticipantProject.participantId) {
      return;
    }

    const dispatched = dispatch(requestGetParticipant(currentParticipantProject.participantId));
    setParticipantRequestId(dispatched.requestId);
  }, [currentParticipantProject, dispatch, setParticipantRequestId]);

  useEffect(() => {
    if (!currentParticipantProject || !currentParticipantRequest) {
      return;
    }

    if (currentParticipantRequest.status === 'success' && currentParticipantRequest.data) {
      const nextCurrentParticipant = currentParticipantRequest.data;
      setCurrentParticipant(nextCurrentParticipant);
    }
  }, [currentParticipantRequest, currentParticipantProject, setCurrentParticipant]);

  useEffect(() => {
    if (!currentParticipantProject || !projectModuleListRequest) {
      return;
    }
    if (projectModuleListRequest.status === 'success') {
      const nextModules = projectModuleListRequest.data ?? [];
      setModules(nextModules);

      const nextActiveModules = nextModules.filter((module) => module.isActive === true);
      setActiveModules(nextActiveModules);

      if (nextActiveModules.length > 0) {
        const deliverableRequest = dispatch(
          requestListModuleDeliverables({
            locale: activeLocale,
            moduleId: nextActiveModules[0].id,
            projectId: currentParticipantProject.id,
          })
        );
        setListModuleDeliverablesRequestId(deliverableRequest.requestId);
      }
    }
  }, [currentParticipantProject, projectModuleListRequest]);

  useEffect(() => {
    if (!moduleDeliverablesRequest) {
      return;
    }

    if (moduleDeliverablesRequest.status === 'success' && moduleDeliverablesRequest.data) {
      setCurrentDeliverables(moduleDeliverablesRequest.data);
    }
  }, [moduleDeliverablesRequest]);

  useEffect(() => {
    if (moduleProjectsListRequest && moduleProjectsListRequest.status === 'success' && moduleProjectsListRequest.data) {
      const nextModuleProjects = moduleProjectsListRequest.data
        .map((id) => participantProjects.find((project) => project.id === id))
        .filter((project): project is Project => !!project);

      setModuleProjects(nextModuleProjects);
      setOrgHasModules(nextModuleProjects.length > 0);

      // Assign the first project with modules as the current participant project
      if (nextModuleProjects.length > 0 && !currentParticipantProject) {
        setCurrentParticipantProject(nextModuleProjects[0]);
      }
    }
  }, [moduleProjectsListRequest, currentParticipantProject, participantProjects]);

  useEffect(() => {
    if (currentParticipantProject?.participantId) {
      dispatch(requestGetParticipant(currentParticipantProject.participantId));
      const request = dispatch(requestListModules(currentParticipantProject.id));
      setListModulesRequestId(request.requestId);
    }
  }, [currentParticipantProject, dispatch]);

  useEffect(() => {
    setParticipantData({
      activeModules,
      currentDeliverables,
      currentParticipant,
      currentParticipantProject,
      isLoading: [moduleDeliverablesRequest, moduleProjectsListRequest, projectModuleListRequest].some(
        (request) => request?.status === 'pending'
      ),
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
    currentParticipant,
    currentParticipantProject,
    modules,
    moduleDeliverablesRequest,
    moduleProjects,
    moduleProjectsListRequest,
    orgHasModules,
    orgHasParticipants,
    participantProjects,
    projectModuleListRequest,
    _setCurrentParticipantProject,
  ]);

  return <ParticipantContext.Provider value={participantData}>{children}</ParticipantContext.Provider>;
};

export default ParticipantProvider;
