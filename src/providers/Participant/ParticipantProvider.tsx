import React, { useCallback, useEffect, useState } from 'react';

import useListCohortModules from 'src/hooks/useListCohortModules';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { requestListModuleProjects } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModuleProjects } from 'src/redux/features/modules/modulesSelectors';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Project } from 'src/types/Project';

import { ParticipantContext, ParticipantData } from './ParticipantContext';

export type Props = {
  children: React.ReactNode;
};

const ParticipantProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();

  const [currentParticipantProject, setCurrentParticipantProject] = useState<Project>();
  const [participantProjects, setParticipantProjects] = useState<Project[]>([]);
  const [moduleProjects, setModuleProjects] = useState<Project[]>([]);
  const [orgHasModules, setOrgHasModules] = useState<boolean | undefined>(undefined);
  const [orgHasParticipants, setOrgHasParticipants] = useState<boolean | undefined>(undefined);

  const [listModuleProjectsRequestId, setListModuleProjectsRequestId] = useState<string>('');

  const moduleProjectsListRequest = useAppSelector(selectModuleProjects(listModuleProjectsRequestId));
  const projects = useAppSelector(selectProjects);

  const { listCohortModules, cohortModules, status: listModulesStatus } = useListCohortModules();

  const _setCurrentParticipantProject = useCallback(
    (projectId: string | number) => {
      setCurrentParticipantProject(participantProjects.find((project) => project.id === Number(projectId)));
    },
    [participantProjects]
  );

  const [participantData, setParticipantData] = useState<ParticipantData>({
    isLoading: true,
    projectsWithModules: moduleProjects,
    modules: cohortModules,
    orgHasModules,
    orgHasParticipants,
    allParticipantProjects: participantProjects,
    setCurrentParticipantProject: _setCurrentParticipantProject,
  });

  useEffect(() => {
    if (selectedOrganization && activeLocale) {
      setCurrentParticipantProject(undefined);
      setModuleProjects([]);
      setOrgHasModules(undefined);
      setOrgHasParticipants(undefined);
      setParticipantProjects([]);
      void dispatch(requestProjects(selectedOrganization.id, activeLocale));
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
    if (currentParticipantProject && currentParticipantProject.cohortId) {
      void listCohortModules(currentParticipantProject.cohortId);
    }
  }, [currentParticipantProject, listCohortModules]);

  useEffect(() => {
    if (moduleProjectsListRequest && moduleProjectsListRequest.status === 'success' && moduleProjectsListRequest.data) {
      const nextModuleProjects = moduleProjectsListRequest.data
        .map((id) => participantProjects.find((project) => project.id === id))
        .filter((project): project is Project => !!project)
        .sort((a, b) => a.name.localeCompare(b.name));

      setModuleProjects(nextModuleProjects);
      setOrgHasModules(nextModuleProjects.length > 0);

      // Assign the first project with modules as the current participant project
      if (nextModuleProjects.length > 0 && !currentParticipantProject) {
        setCurrentParticipantProject(nextModuleProjects[0]);
      }
    }
  }, [moduleProjectsListRequest, currentParticipantProject, participantProjects]);

  useEffect(() => {
    setParticipantData({
      currentParticipantProject,
      isLoading: moduleProjectsListRequest?.status === 'pending' || listModulesStatus === 'pending',
      projectsWithModules: moduleProjects,
      modules: cohortModules,
      allParticipantProjects: participantProjects,
      orgHasModules,
      orgHasParticipants,
      setCurrentParticipantProject: _setCurrentParticipantProject,
    });
  }, [
    currentParticipantProject,
    listModulesStatus,
    cohortModules,
    moduleProjects,
    moduleProjectsListRequest,
    orgHasModules,
    orgHasParticipants,
    participantProjects,
    _setCurrentParticipantProject,
  ]);

  return <ParticipantContext.Provider value={participantData}>{children}</ParticipantContext.Provider>;
};

export default ParticipantProvider;
